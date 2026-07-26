import React from 'react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center text-center space-y-6 px-4">
        <div className="flex items-center space-x-3 mb-4">
          <img src="/logo.svg" alt="iuno.lol logo" className="w-10 h-10" />
          <span className="text-white text-2xl font-bold tracking-tight">iuno<span className="text-blue-500">.lol</span></span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          We're building <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            something awesome.
          </span>
        </h1>
        
        <p className="text-zinc-400 text-lg max-w-md mx-auto mt-4">
          The ultimate platform for your internet presence is currently in beta development. Check back soon!
        </p>
        
        <div className="pt-8">
          <Link href="https://discord.gg/5D2XNAqEdX" target="_blank" rel="noreferrer" 
                className="inline-flex items-center justify-center px-6 py-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 text-white rounded-xl transition-all duration-200 font-medium">
            Join the Discord
          </Link>
        </div>
      </div>
    </div>
  );
}
