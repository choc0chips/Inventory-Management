"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validators";
import { AUTH_COOKIE_NAME } from "./auth-config";

export type AuthResult = {
  success: boolean;
  error?: string;
};

const SALT_ROUNDS = 10;

// ── Helper: Set session cookie ──────────────────────────
async function setSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

// ── Action A: Register User ─────────────────────────────
export async function registerUser(formData: FormData): Promise<AuthResult> {
  const raw = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError.message };
  }

  try {
    // Check for existing user by email or username
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: parsed.data.email },
          { username: parsed.data.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === parsed.data.email) {
        return {
          success: false,
          error: "Error: An account with this email address already exists.",
        };
      }
      return {
        success: false,
        error: "Error: This username is already taken. Please choose another.",
      };
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(parsed.data.password, SALT_ROUNDS);

    // Create user record
    await db.user.create({
      data: {
        username: parsed.data.username,
        email: parsed.data.email,
        password: hashedPassword,
      },
    });

    // Authorize session
    await setSessionCookie();
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration. Please try again.",
    };
  }

  // redirect must be called outside try/catch per Next.js docs
  revalidatePath("/");
  redirect("/");
}

// ── Action B: Login User ────────────────────────────────
export async function loginUser(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError.message };
  }

  try {
    // Lookup user by email
    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      // Generic error to prevent user enumeration
      return {
        success: false,
        error: "Error: Invalid email or password.",
      };
    }

    // Compare password against stored hash
    const isPasswordValid = await bcrypt.compare(
      parsed.data.password,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Error: Invalid email or password.",
      };
    }

    // Authorize session
    await setSessionCookie();
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login. Please try again.",
    };
  }

  // redirect must be called outside try/catch per Next.js docs
  revalidatePath("/");
  redirect("/");
}

// ── Logout ──────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  revalidatePath("/");
  redirect("/auth");
}

// ── Check Auth ──────────────────────────────────────────
export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  return session?.value === "authenticated";
}