import { Metadata } from "next";
import RegisterClient from "./RegisterClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create your free iuno.lol account, claim your username and build your own profile page.",
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  );
}
