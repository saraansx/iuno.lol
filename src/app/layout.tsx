import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./tailwind.css";
import { Toaster } from "@/components/ui/toast";
import ConditionalBackground from "@/components/ConditionalBackground";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const comfortaa = localFont({
  src: [{ path: "../../fonts/comfortaa.ttf", weight: "400", style: "normal" }],
  variable: "--font-comfortaa",
  display: "swap",
  preload: false,
});

const caviarDreams = localFont({
  src: [{ path: "../../fonts/caviar-dreams.ttf", weight: "400", style: "normal" }],
  variable: "--font-caviar-dreams",
  display: "swap",
  preload: false,
});

const poppins = localFont({
  src: [
    { path: "../../fonts/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "../../fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `${SITE_CONFIG.name} - %s`,
  },
  description: SITE_CONFIG.description,
  icons: {
    icon: "/Favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${poppins.variable} ${inter.variable} ${comfortaa.variable} ${caviarDreams.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white relative" style={{ fontFamily: "var(--font-comfortaa)" }}>
        <ConditionalBackground />
        <Toaster />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
