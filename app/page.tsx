'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TubesBackground } from '@/components/TubesBackground';
import { ShinyButton } from '@/components/ui/shiny-button';
import { MousePointer2 } from 'lucide-react';

export default function LandingPage() {
  const [themeColor, setThemeColor] = useState("#f967fb"); // Default matches initial tube color

  return (
    <div className="w-full h-screen font-sans">
      <TubesBackground onColorChange={setThemeColor}>
        <div className="flex flex-col items-center justify-center w-full h-full gap-8 text-center px-4">
          
          <div className="space-y-4 pointer-events-auto cursor-default">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter text-white drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] select-none uppercase leading-none">
              PERSONAL
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white/90 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] select-none uppercase">
              EXPENSE TRACKER
            </h2>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-6 pointer-events-auto">
            <p className="text-white/80 text-sm md:text-base max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              Move your cursor to interact with the 3D tubes. Click anywhere to randomize the neon colors.
            </p>
            
            <Link href="/dashboard">
              <ShinyButton themeColor={themeColor}>
                Enter Experience
              </ShinyButton>
            </Link>
          </div>

          <div className="absolute bottom-8 flex flex-col items-center gap-2 text-white/50 animate-pulse pointer-events-none">
            <MousePointer2 className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">Click to randomize</span>
          </div>
          
        </div>
      </TubesBackground>
    </div>
  );
}
