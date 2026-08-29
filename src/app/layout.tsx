import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto, Outfit, Space_Grotesk, Playfair_Display, Montserrat, DM_Sans, Syne, Pacifico, Caveat, Dancing_Script, Oxanium, Pixelify_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./tailwind.css";
import { Toaster } from "@/components/ui/toast";
import ConditionalBackground from "@/components/ConditionalBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto", preload: false });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", preload: false });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", preload: false });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", preload: false });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", preload: false });
const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-oxanium", preload: false });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico", preload: false });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", preload: false });
const paperNotes = localFont({
  src: [
    {
      path: "../../fonts/papernotes.ttf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-paper-notes",
  preload: false,
});
const chillax = localFont({
  src: [
    {
      path: "../../fonts/Chillax-Variable.ttf",
      weight: "200 700",
      style: "normal",
    }
  ],
  variable: "--font-chillax",
  preload: false,
});
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script", preload: false });
const comfortaa = localFont({
  src: [
    {
      path: "../../fonts/comfortaa.ttf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-comfortaa",
  preload: false,
});
const elegantBloom = localFont({
  src: [
    {
      path: "../../fonts/elegant-bloom.otf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-elegant-bloom",
  preload: false,
});
const caviarDreams = localFont({
  src: [
    {
      path: "../../fonts/caviar-dreams.ttf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-caviar-dreams",
  preload: false,
});
const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify", preload: false });

const poppins = localFont({
  src: [
    {
      path: "../../fonts/Poppins-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../fonts/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  preload: false,
});

import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `${SITE_CONFIG.name} - %s`,
  },
  description: SITE_CONFIG.description,
  icons: {
    icon: "/logo.png",
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
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${roboto.variable} ${outfit.variable} ${spaceGrotesk.variable} ${playfair.variable} ${montserrat.variable} ${dmSans.variable} ${syne.variable} ${oxanium.variable} ${pacifico.variable} ${caveat.variable} ${paperNotes.variable} ${chillax.variable} ${dancingScript.variable} ${comfortaa.variable} ${elegantBloom.variable} ${caviarDreams.variable} ${pixelify.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white font-poppins relative">
        <ConditionalBackground />
        <Toaster />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
