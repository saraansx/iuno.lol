"use client";

import React from "react";

interface GeneralInfoSectionProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  occupation: string;
  setOccupation: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
}

export default function GeneralInfoSection({
  displayName,
  setDisplayName,
  location,
  setLocation,
  occupation,
  setOccupation,
  bio,
  setBio,
}: GeneralInfoSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-7 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="absolute">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <h2 className="text-white font-normal text-[16px] tracking-tight">General Information</h2>
          <p className="text-white/40 text-[13px] mt-0.5">Your profile details</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[12.5px] font-medium text-white/90">Display Name</label>
            <span className="text-[11px] text-white/30">{displayName.length}/32</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 32))}
              placeholder="e.g. John Doe"
              className="w-full h-10 bg-[#161616] border border-white/5 rounded-xl px-4 text-[13px] text-white focus:outline-none focus:border-white/10 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[12.5px] font-medium text-white/90">Location</label>
            <span className="text-[11px] text-white/30">{location.length}/50</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="e.g. New York, USA"
              value={location}
              onChange={(e) => setLocation(e.target.value.slice(0, 50))}
              className="w-full h-10 bg-[#161616] border border-white/5 rounded-xl px-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/10 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[12.5px] font-medium text-white/90">Occupation</label>
            <span className="text-[11px] text-white/30">{occupation.length}/50</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="e.g. Software Engineer"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value.slice(0, 50))}
              className="w-full h-10 bg-[#161616] border border-white/5 rounded-xl px-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/10 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <label className="text-[12.5px] font-medium text-white/90">Description</label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/30">{bio.length}/200</span>
              <span className={`text-[11px] ${bio.split('\n').length >= 10 ? 'text-red-400' : 'text-white/30'}`}>
                {bio.split('\n').length}/10 lines
              </span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.277 1.277L3 12l5.823 1.923a2 2 0 0 1 1.277 1.277L12 21l1.9-5.8a2 2 0 0 1 1.277-1.277L21 12l-5.823-1.923a2 2 0 0 1-1.277-1.277L12 3Z"/><path d="m19 8-1 3-3 1 3 1 1 3 1-3 3-1-3-1-1-3Z"/></svg>
            Generate with AI
          </button>
        </div>

        <div className="w-full bg-[#161616] border border-white/5 rounded-xl overflow-hidden flex flex-col focus-within:border-white/10 transition-colors">
          <textarea 
            placeholder="Tell people about yourself..."
            value={bio}
            onChange={(e) => {
              let val = e.target.value;
              if (val.split('\n').length > 10) {
                val = val.split('\n').slice(0, 10).join('\n');
              }
              setBio(val.slice(0, 200));
            }}
            className="w-full min-h-[140px] bg-transparent p-4 text-[13px] text-white placeholder:text-white/30 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-5">
              <button className="flex items-center gap-1.5 text-[11px] text-white hover:text-white/80 transition-colors cursor-pointer font-medium tracking-wide">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
