import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  description: "iuno.lol - Your ultimate platform for internet presence.",
};

export default async function HomePage() {
  const isAuth = await isAuthenticated();
  return <HomeClient isAuthenticated={isAuth} />;
}