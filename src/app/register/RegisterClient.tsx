"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import React, { Suspense, useState } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function Register() {
    const [isSuccess, setIsSuccess] = useState(false);

    return (
    <main className="min-h-screen bg-transparent flex items-center justify-center p-4 font-poppins relative overflow-hidden">

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-100 bg-white/2 backdrop-blur-[32px] border border-white/8 rounded-4xl p-8 md:p-10 flex flex-col items-center relative z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
      >
        {/* Logo */}
        {!isSuccess && (
          <Link href="/" className="mb-6 flex justify-center hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Iuno Logo" width={64} height={64} className="object-contain" priority />
          </Link>
        )}

        {!isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full"
          >
            <h1 className="text-2xl font-normal text-white mb-2 tracking-tight">Create an account</h1>
            <p className="text-white/60 text-sm font-normal mb-8 text-center">
              Join thousands of creators on IUNO.LOL
            </p>
          </motion.div>
        )}

        <Suspense fallback={<div className="text-white/20 text-sm">Loading...</div>}>
          <RegisterForm onSuccessStateChange={setIsSuccess} />
        </Suspense>

        {/* SIGN IN LINK */}
        {!isSuccess && (
          <div className="mt-8 text-center">
            <p className="text-xs text-white/40 font-light">
              Already have an account?{" "}
              <Link href="/signin" className="text-[#609fda] hover:text-[#609fda]/90 font-medium relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#609fda] hover:after:w-full after:transition-all after:duration-300">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </main>
  );
}
