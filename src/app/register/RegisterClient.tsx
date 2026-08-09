"use client";

import { motion } from "framer-motion";
import SwapForm from "@/components/ui/swap-form";

import BackToHome from "@/components/ui/BackToHome";

export default function Register() {
  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center p-4 font-poppins relative overflow-hidden">

      <BackToHome />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-100 relative z-10"
      >
        <SwapForm initialMode="register" />
      </motion.div>
    </main>
  );
}
