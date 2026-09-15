            import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    proxyClientMaxBodySize: "30mb",
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  reactCompiler: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.catbox.moe",
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