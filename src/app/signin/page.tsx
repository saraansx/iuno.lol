import { Metadata } from "next";
import SignInClient from "./SignInClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your iuno.lol account",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInClient />
    </Suspense>
  );
}
