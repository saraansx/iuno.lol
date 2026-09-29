import { Roboto, Outfit, Space_Grotesk, Playfair_Display, Montserrat, DM_Sans, Syne, Pacifico, Caveat, Dancing_Script, Oxanium, Pixelify_Sans } from "next/font/google";
import localFont from "next/font/local";

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
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script", preload: false });
const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify", preload: false });

const paperNotes = localFont({
  src: [{ path: "../../fonts/papernotes.ttf", weight: "400", style: "normal" }],
  variable: "--font-paper-notes",
  preload: false,
});
const chillax = localFont({
  src: [{ path: "../../fonts/Chillax-Variable.ttf", weight: "200 700", style: "normal" }],
  variable: "--font-chillax",
  preload: false,
});
const elegantBloom = localFont({
  src: [{ path: "../../fonts/elegant-bloom.otf", weight: "400", style: "normal" }],
  variable: "--font-elegant-bloom",
  preload: false,
});

export const profileFontVariables = [
  roboto, outfit, spaceGrotesk, playfair, montserrat, dmSans, syne, oxanium,
  pacifico, caveat, dancingScript, pixelify, paperNotes, chillax, elegantBloom,
].map((font) => font.variable).join(" ");
