"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function BackToHome() {
  return (
    <Link
      href="/"
      className="fixed top-6 left-6 z-50 group flex items-center gap-2.5 hover:opacity-80 transition-all duration-200 cursor-pointer select-none"
    >
      <ArrowLeft className="w-4 h-4 text-[#609fda] group-hover:-translate-x-1 transition-transform duration-200" />
      <Image
        src="/Favicon.png"
        alt="Iuno Logo"
        width={512}
        height={512}
        className="w-[26px] h-auto object-contain group-hover:scale-105 transition-transform duration-200"
        priority
      />
      <span className="font-light text-white tracking-tight text-base uppercase" style={{ fontFamily: "var(--font-comfortaa)" }}>
        uno<span className="text-[#609fda] lowercase text-lg">.lol</span>
      </span>
    </Link>
  );
}
