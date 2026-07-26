import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
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
      }
    ],
  },
};

export default nextConfig;
