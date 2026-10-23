            import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [
      {
        has: [{ type: "host", value: "www.iuno.lol" }],
        source: "/:path*",
        destination: "https://iuno.lol/:path*",
        permanent: true,
      },
    ];
  },
  outputFileTracingIncludes: {
    "/changelog": ["./changelog.md"],
  },
  experimental: {
    proxyClientMaxBodySize: "210mb",
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "host.iuno.lol",
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