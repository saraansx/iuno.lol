import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    absolute: "iuno.lol - One Link for Your Whole Internet Presence",
  },
  description:
    "Create your free iuno.lol page - all your links, music player, Discord/Steam/Spotify widgets, animated effects and full theming in one place. Claim iuno.lol/yourname.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const isAuth = await isAuthenticated();
  return <HomeClient isAuthenticated={isAuth} />;
}