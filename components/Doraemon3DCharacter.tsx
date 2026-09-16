'use client'

import React from 'react'

export type DoraemonMood = 'normal' | 'happy' | 'surprised' | 'concerned'

interface Doraemon3DCharacterProps {
  isWalking?: boolean
  facing?: 'left' | 'right'
  mood?: DoraemonMood
  className?: string
}

export function Doraemon3DCharacter({
  isWalking = false,
  facing = 'left',
  mood = 'normal',
  className = '',
}: Doraemon3DCharacterProps) {
  return (
    <div
      className={`relative inline-block transition-transform duration-300 ${className}`}
      style={{
        transform: facing === 'right' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      <svg
        width="160"
        height="190"
        viewBox="0 0 160 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-2xl"
      >
        <defs>
          {/* Volumetric 3D Blue Sphere Gradient */}
          <radialGradient id="dora3dHeadGrad" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#4fc3f7" />
            <stop offset="35%" stopColor="#0288d1" />
            <stop offset="75%" stopColor="#01579b" />
            <stop offset="100%" stopColor="#002f56" />
          </radialGradient>

          <radialGradient id="dora3dBodyGrad" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#29b6f6" />
            <stop offset="40%" stopColor="#0288d1" />
            <stop offset="80%" stopColor="#01579b" />
            <stop offset="100%" stopColor="#002f56" />
          </radialGradient>

          {/* 3D Face Shading */}
          <radialGradient id="dora3dFaceGrad" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="75%" stopColor="#f5f7fa" />
            <stop offset="100%" stopColor="#cfd8dc" />
          </radialGradient>

          {/* 3D Glossy Red Nose Gradient */}
          <radialGradient id="dora3dNoseGrad" cx="30%" cy="25%" r="60%">
            <stop offset="0%" stopColor="#ff8a80" />
            <stop offset="40%" stopColor="#ff1744" />
            <stop offset="85%" stopColor="#d50000" />
            <stop offset="100%" stopColor="#7a0000" />
          </radialGradient>

          {/* 3D Metallic Golden Bell Gradient */}
          <radialGradient id="dora3dBellGrad" cx="30%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#ffff8d" />
            <stop offset="40%" stopColor="#ffd700" />
            <stop offset="75%" stopColor="#ffab00" />
            <stop offset="100%" stopColor="#8d6e00" />
          </radialGradient>

          {/* 3D Red Tail Sphere */}
          <radialGradient id="dora3dTailGrad" cx="30%" cy="25%" r="60%">
            <stop offset="0%" stopColor="#ff8a80" />
            <stop offset="60%" stopColor="#d50000" />
            <stop offset="100%" stopColor="#620000" />
          </radialGradient>

          {/* Feet 3D Shading */}
          <radialGradient id="dora3dFootGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#eceff1" />
            <stop offset="100%" stopColor="#b0bec5" />
          </radialGradient>

          {/* Soft Ground Contact Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Ambient Occlusion Filter */}
          <filter id="softAoFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="3" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 0. SOFT GROUND CONTACT SHADOW PLANE */}
        <ellipse cx="75" cy="172" rx="46" ry="8" fill="url(#groundShadow)" />

        {/* 1. TAIL (BEHIND BODY) */}
        <g className="tail-group">
          <path d="M 108 130 Q 120 134 130 136" stroke="#8e0000" strokeWidth="4" strokeLinecap="round" />
          <circle cx="134" cy="137" r="8" fill="url(#dora3dTailGrad)" stroke="#4a0000" strokeWidth="1" />
          <circle cx="132" cy="134" r="2.5" fill="#FFFFFF" opacity="0.6" />
        </g>

        {/* 2. BODY CONTAINER (Walk Bob Animation) */}
        <g className={isWalking ? 'animate-dora-bob' : ''} filter="url(#softAoFilter)">
          {/* LEGS & FEET GROUP */}
          {/* Back Leg (Left) */}
          <g className={isWalking ? 'animate-dora-left-leg origin-[58px_136px]' : ''}>
            <rect x="46" y="126" width="24" height="28" rx="10" fill="url(#dora3dBodyGrad)" stroke="#001d36" strokeWidth="1.5" />
            {/* 3D White Foot Left */}
            <ellipse cx="52" cy="160" rx="20" ry="11" fill="url(#dora3dFootGrad)" stroke="#78909c" strokeWidth="1.5" />
            <ellipse cx="48" cy="157" rx="12" ry="4" fill="#FFFFFF" opacity="0.7" />
          </g>

          {/* Front Leg (Right) */}
          <g className={isWalking ? 'animate-dora-right-leg origin-[90px_136px]' : ''}>
            <rect x="78" y="126" width="24" height="28" rx="10" fill="url(#dora3dBodyGrad)" stroke="#001d36" strokeWidth="1.5" />
            {/* 3D White Foot Right */}
            <ellipse cx="90" cy="160" rx="20" ry="11" fill="url(#dora3dFootGrad)" stroke="#78909c" strokeWidth="1.5" />
            <ellipse cx="86" cy="157" rx="12" ry="4" fill="#FFFFFF" opacity="0.7" />
          </g>

          {/* TORSO BASE */}
          <ellipse cx="75" cy="112" rx="40" ry="32" fill="url(#dora3dBodyGrad)" stroke="#001d36" strokeWidth="2" />

          {/* Ambient Occlusion Shadow under Chin */}
          <ellipse cx="75" cy="88" rx="32" ry="6" fill="#000000" opacity="0.2" />

          {/* WHITE BELLY OVAL WITH 3D SHADING */}
          <ellipse cx="72" cy="114" rx="28" ry="23" fill="url(#dora3dFaceGrad)" stroke="#cfd8dc" strokeWidth="1" />

          {/* 4D POCKET (POUCH) */}
          <path d="M 51 113 C 51 130, 93 130, 93 113 Z" fill="#FFFFFF" stroke="#37474f" strokeWidth="2" />

          {/* ARMS GROUP */}
          {/* Back Arm (Right Arm) */}
          <g className={isWalking ? 'animate-dora-right-arm origin-[98px_98px]' : ''}>
            <path d="M 95 98 Q 116 106 124 116" stroke="url(#dora3dBodyGrad)" strokeWidth="16" strokeLinecap="round" />
            <path d="M 95 98 Q 116 106 124 116" stroke="#001d36" strokeWidth="18" strokeLinecap="round" opacity="0.25" />
            {/* 3D White Round Hand */}
            <circle cx="128" cy="118" r="11.5" fill="url(#dora3dFootGrad)" stroke="#78909c" strokeWidth="1.5" />
            <circle cx="125" cy="115" r="4" fill="#FFFFFF" opacity="0.8" />
          </g>

          {/* Front Arm (Left Arm) */}
          <g className={isWalking ? 'animate-dora-left-arm origin-[50px_98px]' : ''}>
            <path d="M 52 98 Q 30 106 22 116" stroke="url(#dora3dBodyGrad)" strokeWidth="16" strokeLinecap="round" />
            {/* 3D White Round Hand */}
            <circle cx="18" cy="118" r="11.5" fill="url(#dora3dFootGrad)" stroke="#78909c" strokeWidth="1.5" />
            <circle cx="15" cy="115" r="4" fill="#FFFFFF" opacity="0.8" />
          </g>

          {/* RED COLLAR & 3D METALLIC BELL */}
          <rect x="40" y="82" width="68" height="11" rx="5.5" fill="#D50000" stroke="#7a0000" strokeWidth="1.5" />
          <rect x="42" y="83" width="64" height="3" rx="1.5" fill="#ff5252" opacity="0.5" />

          {/* Metallic Bell */}
          <circle cx="75" cy="93" r="8.5" fill="url(#dora3dBellGrad)" stroke="#5d4037" strokeWidth="1.5" />
          <circle cx="72" cy="89" r="3" fill="#FFFFFF" opacity="0.6" />
          <line x1="66.5" y1="90" x2="83.5" y2="90" stroke="#3E2723" strokeWidth="1.5" />
          <circle cx="75" cy="94" r="2.2" fill="#212121" />
          <line x1="75" y1="96.2" x2="75" y2="101" stroke="#212121" strokeWidth="1.2" />

          {/* 3. HEAD GROUP (VOLUMETRIC 3D SPHERE) */}
          {/* Blue Head Base */}
          <circle cx="75" cy="48" r="46" fill="url(#dora3dHeadGrad)" stroke="#001d36" strokeWidth="2" />

          {/* White Face Oval */}
          <ellipse cx="73" cy="55" rx="38" ry="32" fill="url(#dora3dFaceGrad)" stroke="#b0bec5" strokeWidth="1" />

          {/* EYES */}
          <ellipse cx="61" cy="32" rx="10.5" ry="14.5" fill="#FFFFFF" stroke="#212121" strokeWidth="2.2" />
          <ellipse cx="85" cy="32" rx="10.5" ry="14.5" fill="#FFFFFF" stroke="#212121" strokeWidth="2.2" />

          {/* Dynamic Anime Eye Expressions */}
          {mood === 'happy' ? (
            <>
              {/* Happy Arch Eyes (^ ^) */}
              <path d="M 53 33 Q 61 22 69 33" stroke="#212121" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 77 33 Q 85 22 93 33" stroke="#212121" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'surprised' ? (
            <>
              {/* Surprised Big Pupils */}
              <circle cx="63" cy="32" r="4.5" fill="#212121" />
              <circle cx="83" cy="32" r="4.5" fill="#212121" />
              <circle cx="64.5" cy="30.2" r="1.6" fill="#FFFFFF" />
              <circle cx="84.5" cy="30.2" r="1.6" fill="#FFFFFF" />
            </>
          ) : mood === 'concerned' ? (
            <>
              {/* Concerned Eyes with Tilted Eyebrows */}
              <circle cx="62" cy="34" r="4" fill="#212121" />
              <circle cx="84" cy="34" r="4" fill="#212121" />
              <path d="M 51 20 L 67 25" stroke="#212121" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 95 20 L 79 25" stroke="#212121" strokeWidth="2.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Normal Pupils */}
              <ellipse cx="63" cy="33" rx="3.8" ry="4.8" fill="#212121" />
              <ellipse cx="83" cy="33" rx="3.8" ry="4.8" fill="#212121" />
              <circle cx="64.6" cy="31.2" r="1.4" fill="#FFFFFF" />
              <circle cx="84.6" cy="31.2" r="1.4" fill="#FFFFFF" />
            </>
          )}

          {/* Glossy 3D Red Nose */}
          <circle cx="73" cy="41.5" r="6.8" fill="url(#dora3dNoseGrad)" stroke="#520000" strokeWidth="1" />
          <circle cx="70.5" cy="39" r="2.2" fill="#FFFFFF" opacity="0.9" />

          {/* Nose Vertical Line */}
          <line x1="73" y1="48.3" x2="73" y2="65" stroke="#212121" strokeWidth="2.2" />

          {/* Mouth Expressions */}
          {mood === 'happy' ? (
            /* Wide Open Happy Mouth with Tongue */
            <g>
              <path d="M 51 59 Q 73 80 95 59 Z" fill="#D50000" stroke="#212121" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M 60 70 Q 73 62 86 70 Q 73 79 60 70 Z" fill="#FF7043" />
            </g>
          ) : mood === 'surprised' ? (
            /* Surprised O Mouth */
            <ellipse cx="73" cy="66" rx="8" ry="10" fill="#D50000" stroke="#212121" strokeWidth="2.2" />
          ) : mood === 'concerned' ? (
            /* Worried Wavy Line Mouth */
            <path d="M 53 67 Q 63 62 73 67 Q 83 72 93 67" stroke="#212121" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          ) : (
            /* Classic Anime Smile */
            <path d="M 50 59 Q 73 73 96 59" stroke="#212121" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          )}

          {/* Whiskers Left (3 sharp lines) */}
          <line x1="28" y1="45" x2="52" y2="49" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="55" x2="52" y2="55" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="65" x2="52" y2="61" stroke="#212121" strokeWidth="2" strokeLinecap="round" />

          {/* Whiskers Right (3 sharp lines) */}
          <line x1="118" y1="45" x2="94" y2="49" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
          <line x1="120" y1="55" x2="94" y2="55" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
          <line x1="118" y1="65" x2="94" y2="61" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}
