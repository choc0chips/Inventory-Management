"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { loginUser, registerUser } from "@/lib/actions/auth-actions";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "@/lib/validators";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ActiveTab = "login" | "register";

export default function AuthPage(): React.ReactElement {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // ── Login Form ──────────────────────────────────────────
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // ── Register Form ───────────────────────────────────────
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  // ── Session Check ───────────────────────────────────────
  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          router.replace("/");
        }
      } catch {
        // Not authenticated, stay on page
      }
      setTimeout(() => setIsLoading(false), 0);
    };
    checkSession();
  }, [router]);

  const handleTabChange = (tab: ActiveTab): void => {
    setActiveTab(tab);
    setShowPassword(false);
  };

  // ── Login Handler ───────────────────────────────────────
  function handleLogin(data: LoginFormValues): void {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", data.email);
      formData.set("password", data.password);

      const result = await loginUser(formData);
      if (!result.success) {
        toast.error(result.error ?? "An unexpected error occurred.");
      } else {
        toast.success("Welcome back! Redirecting to dashboard...");
      }
    });
  }

  // ── Register Handler ────────────────────────────────────
  function handleRegister(data: RegisterFormValues): void {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("username", data.username);
      formData.set("email", data.email);
      formData.set("password", data.password);

      const result = await registerUser(formData);
      if (!result.success) {
        toast.error(result.error ?? "An unexpected error occurred.");
      } else {
        toast.success("Account created successfully! Welcome to StockWise.");
      }
    });
  }

  // ── Loading Screen ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20 animate-pulse">
            <Package className="h-6.5 w-6.5 text-white" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            Booting console...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-50/30 via-slate-50 to-purple-50/30 px-4 py-12">
      {/* Decorative background glowing meshes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-violet-200/20 to-pink-200/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-350">
        {/* Strict Light-Theme Card */}
        <div className="rounded-3xl bg-white p-8 border border-slate-200/80 shadow-xl shadow-slate-100/50">
          {/* Logo & Title */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20 transition-transform hover:scale-105">
              <Package className="h-6.5 w-6.5 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">StockWise</h1>
            <p className="mt-1.5 text-xs text-indigo-600/80 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
              Inventory Operator Portal
            </p>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as ActiveTab)} className="mt-8 w-full">
            <TabsList className="grid h-10 w-full grid-cols-2 bg-slate-100 border border-slate-200/50 p-1 rounded-xl">
              <TabsTrigger 
                value="login" 
                className="gap-2 font-semibold text-xs text-slate-500 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5 shrink-0" />
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="gap-2 font-semibold text-xs text-slate-500 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5 shrink-0" />
                Register
              </TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login">
              <form
                id="login-form"
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="mt-6 space-y-5"
                noValidate
              >
                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-email"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="operator@stockwise.io"
                      disabled={isPending}
                      className={cn(
                        "h-10 w-full pl-10 pr-3 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
                        loginForm.formState.errors.email && "border-rose-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
                      )}
                      {...loginForm.register("email")}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-rose-600 font-bold">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Operator Password
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter security key"
                      disabled={isPending}
                      className={cn(
                        "h-10 w-full pl-10 pr-10 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
                        loginForm.formState.errors.password && "border-rose-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
                      )}
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-rose-600 font-bold">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl bg-primary",
                    "px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25",
                    "transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
                    "active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  )}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Authenticating Operator...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In Console
                    </>
                  )}
                </button>

                {/* Switch prompt */}
                <p className="text-center text-xs text-slate-500 font-semibold">
                  Need a secure terminal account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("register")}
                    className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Create account
                  </button>
                </p>
              </form>
            </TabsContent>

            {/* REGISTER FORM */}
            <TabsContent value="register">
              <form
                id="register-form"
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="mt-6 space-y-5"
                noValidate
              >
                {/* Username */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="register-username"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Operator Username
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="register-username"
                      type="text"
                      autoComplete="username"
                      placeholder="operator123"
                      disabled={isPending}
                      className={cn(
                        "h-10 w-full pl-10 pr-3 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
                        registerForm.formState.errors.username && "border-rose-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
                      )}
                      {...registerForm.register("username")}
                    />
                  </div>
                  {registerForm.formState.errors.username && (
                    <p className="text-xs text-rose-600 font-bold">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="register-email"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Secure Email Address
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      placeholder="operator@stockwise.io"
                      disabled={isPending}
                      className={cn(
                        "h-10 w-full pl-10 pr-3 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
                        registerForm.formState.errors.email && "border-rose-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
                      )}
                      {...registerForm.register("email")}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-rose-600 font-bold">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="register-password"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Access Password
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimum 6 characters"
                      disabled={isPending}
                      className={cn(
                        "h-10 w-full pl-10 pr-10 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
                        registerForm.formState.errors.password && "border-rose-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
                      )}
                      {...registerForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-rose-600 font-bold">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl bg-primary",
                    "px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25",
                    "transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
                    "active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  )}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Registering Operator...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Initialize Account
                    </>
                  )}
                </button>

                {/* Switch prompt */}
                <p className="text-center text-xs text-slate-500 font-semibold">
                  Already initialized security key?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("login")}
                    className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign in instead
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-8 border-t border-slate-100 pt-5">
            <p className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              STOCKWISE SYSTEM TERMINAL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}