import React from "react";
import { Toaster } from "sonner";

export const metadata = {
  title: "Sign In or Register — StockWise",
  description: "Sign in or create a new account for StockWise inventory management.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
