import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  // Title is handled by layout.tsx 'default' for this page
  description: "iuno.lol - Your ultimate platform for internet presence.",
};

import { isAuthenticated } from "@/lib/auth/session";

export default async function HomePage() {
  const isAuth = await isAuthenticated();
  return <HomeClient isAuthenticated={isAuth} />;
}
