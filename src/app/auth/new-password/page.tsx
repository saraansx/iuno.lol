import { Metadata } from "next";
import NewPasswordClient from "./NewPasswordClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "New Password",
  description: "Create a new password for your iuno.lol account",
};

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordClient />
    </Suspense>
  );
}
