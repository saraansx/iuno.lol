import { Metadata } from "next";
import NewVerificationClient from "./NewVerificationClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Account",
  description: "Verify your iuno.lol account email",
};

export default function NewVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewVerificationClient />
    </Suspense>
  );
}
