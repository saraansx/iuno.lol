import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iuno-media-storage-bucket.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.iuno.lol",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "discord-decoration.art",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "media.valorant-api.com",
      },
      {
        protocol: "https",
        hostname: "api.henrikdev.xyz",
      }
    ],
  },
};

export default nextConfig;