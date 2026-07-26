import { Metadata } from "next";
import RegisterClient from "./RegisterClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your iuno.lol account",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClient />
    </Suspense>
  );
}
