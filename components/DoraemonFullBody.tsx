'use client'

import React from 'react'

export type DoraemonMood = 'normal' | 'happy' | 'surprised' | 'concerned'

interface DoraemonFullBodyProps {
  isWalking?: boolean
  facing?: 'left' | 'right'
  mood?: DoraemonMood
  className?: string
}

export function DoraemonFullBody({
  isWalking = false,
  facing = 'left',
  mood = 'normal',
  className = '',
}: DoraemonFullBodyProps) {
  return (
    <div
      className={`relative inline-block transition-transform duration-300 ${className}`}
      style={{
        transform: facing === 'right' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      <svg
        width="150"
        height="180"
        viewBox="0 0 150 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-2xl"
      >
        <defs>
          {/* Rich Anime Doraemon Blue Gradient */}
          <radialGradient id="doraBodyGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#29b6f6" />
            <stop offset="50%" stopColor="#009ce3" />
            <stop offset="100%" stopColor="#0077c5" />
          </radialGradient>

          {/* Glossy Red Nose Gradient */}
          <radialGradient id="doraNoseGrad" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="65%" stopColor="#e50012" />
            <stop offset="100%" stopColor="#990000" />
          </radialGradient>

          {/* Gold Bell Gradient */}
          <radialGradient id="doraBellGrad" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fff176" />
            <stop offset="60%" stopColor="#ffcc00" />
            <stop offset="100%" stopColor="#e69900" />
          </radialGradient>

          {/* Red Tail Gradient */}
          <radialGradient id="doraTailGrad" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="100%" stopColor="#b71c1c" />
          </radialGradient>
        </defs>

        {/* 0. SOFT GROUND CONTACT SHADOW */}
        <ellipse cx="70" cy="162" rx="42" ry="7" fill="#000000" opacity="0.25" />

        {/* 1. TAIL (BEHIND BODY) */}
        <g className="tail-group">
          <line x1="102" y1="124" x2="124" y2="130" stroke="#b71c1c" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="128" cy="131" r="7.5" fill="url(#doraTailGrad)" stroke="#111111" strokeWidth="1.8" />
        </g>

        {/* 2. BODY CONTAINER (Walk Bob Animation) */}
        <g className={isWalking ? 'animate-dora-bob' : ''}>
          {/* LEGS & FEET GROUP */}
          {/* Back Leg (Left) */}
          <g className={isWalking ? 'animate-dora-left-leg origin-[54px_130px]' : ''}>
            <rect x="44" y="122" width="22" height="26" rx="9" fill="url(#doraBodyGrad)" stroke="#111111" strokeWidth="2.5" />
            {/* White Foot Left */}
            <ellipse cx="50" cy="154" rx="19" ry="10" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
          </g>

          {/* Front Leg (Right) */}
          <g className={isWalking ? 'animate-dora-right-leg origin-[84px_130px]' : ''}>
            <rect x="74" y="122" width="22" height="26" rx="9" fill="url(#doraBodyGrad)" stroke="#111111" strokeWidth="2.5" />
            {/* White Foot Right */}
            <ellipse cx="84" cy="154" rx="19" ry="10" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
          </g>

          {/* TORSO BASE */}
          <ellipse cx="70" cy="108" rx="38" ry="30" fill="url(#doraBodyGrad)" stroke="#111111" strokeWidth="2.8" />

          {/* WHITE BELLY OVAL */}
          <ellipse cx="67" cy="110" rx="27" ry="22" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />

          {/* 4D POCKET (POUCH) */}
          <path d="M 47 109 C 47 125, 87 125, 87 109 Z" fill="#FFFFFF" stroke="#111111" strokeWidth="2.2" />

          {/* ARMS GROUP */}
          {/* Back Arm (Right Arm) */}
          <g className={isWalking ? 'animate-dora-right-arm origin-[94px_95px]' : ''}>
            <path d="M 90 95 Q 110 102 116 112" stroke="url(#doraBodyGrad)" strokeWidth="15" strokeLinecap="round" />
            <path d="M 90 95 Q 110 102 116 112" stroke="#111111" strokeWidth="19" strokeLinecap="round" opacity="0.2" />
            {/* White Round Hand */}
            <circle cx="120" cy="114" r="11" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
          </g>

          {/* Front Arm (Left Arm) */}
          <g className={isWalking ? 'animate-dora-left-arm origin-[46px_95px]' : ''}>
            <path d="M 48 95 Q 28 102 22 112" stroke="url(#doraBodyGrad)" strokeWidth="15" strokeLinecap="round" />
            {/* White Round Hand */}
            <circle cx="18" cy="114" r="11" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
          </g>

          {/* RED COLLAR & BELL */}
          <rect x="38" y="80" width="64" height="10" rx="5" fill="#E50012" stroke="#8E0000" strokeWidth="1.8" />
          <circle cx="70" cy="90" r="8" fill="url(#doraBellGrad)" stroke="#111111" strokeWidth="1.8" />
          <line x1="62" y1="87.5" x2="78" y2="87.5" stroke="#3E2723" strokeWidth="1.5" />
          <circle cx="70" cy="91" r="2" fill="#212121" />
          <line x1="70" y1="93" x2="70" y2="97.5" stroke="#212121" strokeWidth="1.2" />

          {/* 3. HEAD GROUP */}
          {/* Blue Head Base */}
          <circle cx="70" cy="46" r="45" fill="url(#doraBodyGrad)" stroke="#111111" strokeWidth="2.8" />

          {/* White Face Oval */}
          <ellipse cx="68" cy="53" rx="37" ry="31" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />

          {/* EYES */}
          <ellipse cx="56" cy="31" rx="10" ry="14" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
          <ellipse cx="80" cy="31" rx="10" ry="14" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />

          {/* Dynamic Anime Eye Expressions */}
          {mood === 'happy' ? (
            <>
              {/* Happy Arch Eyes (^ ^) */}
              <path d="M 49 32 Q 56 22 63 32" stroke="#111111" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 73 32 Q 80 22 87 32" stroke="#111111" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'surprised' ? (
            <>
              {/* Surprised Big Pupils */}
              <circle cx="58" cy="31" r="4.5" fill="#111111" />
              <circle cx="78" cy="31" r="4.5" fill="#111111" />
              <circle cx="59.5" cy="29.2" r="1.6" fill="#FFFFFF" />
              <circle cx="79.5" cy="29.2" r="1.6" fill="#FFFFFF" />
            </>
          ) : mood === 'concerned' ? (
            <>
              {/* Concerned Eyes with Tilted Eyebrows */}
              <circle cx="57" cy="33" r="4" fill="#111111" />
              <circle cx="79" cy="33" r="4" fill="#111111" />
              <path d="M 47 19 L 62 24" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 89 19 L 74 24" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Normal Pupils */}
              <ellipse cx="58" cy="32" rx="3.5" ry="4.5" fill="#111111" />
              <ellipse cx="78" cy="32" rx="3.5" ry="4.5" fill="#111111" />
              <circle cx="59.5" cy="30.2" r="1.3" fill="#FFFFFF" />
              <circle cx="79.5" cy="30.2" r="1.3" fill="#FFFFFF" />
            </>
          )}

          {/* Glossy Red Nose */}
          <circle cx="68" cy="40.5" r="6.2" fill="url(#doraNoseGrad)" stroke="#111111" strokeWidth="1.2" />
          <circle cx="65.8" cy="38.2" r="1.8" fill="#FFFFFF" opacity="0.9" />

          {/* Nose Vertical Line */}
          <line x1="68" y1="46.7" x2="68" y2="63" stroke="#111111" strokeWidth="2.2" />

          {/* Mouth Expressions */}
          {mood === 'happy' ? (
            /* Wide Open Happy Mouth with Tongue */
            <g>
              <path d="M 48 57 Q 68 77 88 57 Z" fill="#D50000" stroke="#111111" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M 56 67 Q 68 60 80 67 Q 68 76 56 67 Z" fill="#FF7043" />
            </g>
          ) : mood === 'surprised' ? (
            /* Surprised O Mouth */
            <ellipse cx="68" cy="63" rx="7.5" ry="9.5" fill="#D50000" stroke="#111111" strokeWidth="2.2" />
          ) : mood === 'concerned' ? (
            /* Worried Wavy Line Mouth */
            <path d="M 50 64 Q 59 59 68 64 Q 77 69 86 64" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          ) : (
            /* Classic Anime Smile */
            <path d="M 47 57 Q 68 72 89 57" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          )}

          {/* Whiskers Left (3 sharp lines) */}
          <line x1="28" y1="43" x2="50" y2="47" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="53" x2="50" y2="53" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="63" x2="50" y2="59" stroke="#111111" strokeWidth="2" strokeLinecap="round" />

          {/* Whiskers Right (3 sharp lines) */}
          <line x1="108" y1="43" x2="86" y2="47" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <line x1="110" y1="53" x2="86" y2="53" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <line x1="108" y1="63" x2="86" y2="59" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}
