import { Metadata } from "next";
import SignInClient from "./SignInClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your iuno.lol account",
  alternates: {
    canonical: "/signin",
  },
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
