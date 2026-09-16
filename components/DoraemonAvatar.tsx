'use client'

import React from 'react'

export type DoraemonMood = 'normal' | 'happy' | 'surprised' | 'concerned'

interface DoraemonAvatarProps {
  mood?: DoraemonMood
  size?: number
  className?: string
}

export function DoraemonAvatar({ mood = 'normal', size = 56, className = '' }: DoraemonAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-md transition-transform duration-300 ${className}`}
      aria-label="Doraemon Finance Companion"
    >
      <defs>
        {/* Head Gradient */}
        <radialGradient id="doraHeadGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#29b6f6" />
          <stop offset="60%" stopColor="#0288d1" />
          <stop offset="100%" stopColor="#01579b" />
        </radialGradient>

        {/* Nose Gradient */}
        <radialGradient id="doraNoseGrad" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ff5252" />
          <stop offset="70%" stopColor="#d50000" />
        </radialGradient>

        {/* Bell Gradient */}
        <radialGradient id="doraBellGrad" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffeb3b" />
          <stop offset="70%" stopColor="#fbc02d" />
        </radialGradient>
      </defs>

      {/* Blue Head Base */}
      <circle cx="60" cy="54" r="46" fill="url(#doraHeadGrad)" stroke="#013967" strokeWidth="2.5" />

      {/* White Face Oval */}
      <ellipse cx="60" cy="62" rx="38" ry="32" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1" />

      {/* Red Collar */}
      <rect x="34" y="94" width="52" height="10" rx="5" fill="#D50000" stroke="#8E0000" strokeWidth="1.5" />

      {/* Yellow Bell */}
      <circle cx="60" cy="103" r="6.5" fill="url(#doraBellGrad)" stroke="#B78103" strokeWidth="1.5" />
      <line x1="53.5" y1="101" x2="66.5" y2="101" stroke="#5D4037" strokeWidth="1" />
      <circle cx="60" cy="104" r="1.5" fill="#3E2723" />
      <line x1="60" y1="105.5" x2="60" y2="109.5" stroke="#3E2723" strokeWidth="1" />

      {/* EYES */}
      {/* Left Eye Base */}
      <ellipse cx="48" cy="38" rx="10" ry="13" fill="#FFFFFF" stroke="#212121" strokeWidth="2" />
      {/* Right Eye Base */}
      <ellipse cx="72" cy="38" rx="10" ry="13" fill="#FFFFFF" stroke="#212121" strokeWidth="2" />

      {/* Eye Expressions */}
      {mood === 'happy' ? (
        <>
          {/* Happy arch eyes */}
          <path d="M 42 39 Q 48 31 54 39" stroke="#212121" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 66 39 Q 72 31 78 39" stroke="#212121" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'surprised' ? (
        <>
          {/* Surprised big pupils */}
          <circle cx="50" cy="38" r="4.5" fill="#212121" />
          <circle cx="70" cy="38" r="4.5" fill="#212121" />
          <circle cx="51.5" cy="36.5" r="1.5" fill="#FFFFFF" />
          <circle cx="71.5" cy="36.5" r="1.5" fill="#FFFFFF" />
        </>
      ) : mood === 'concerned' ? (
        <>
          {/* Concerned eyes with tilted eyebrows */}
          <circle cx="49" cy="40" r="3.5" fill="#212121" />
          <circle cx="71" cy="40" r="3.5" fill="#212121" />
          <path d="M 40 27 L 55 31" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 80 27 L 65 31" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Normal Pupils */}
          <ellipse cx="51" cy="39" rx="3.5" ry="4.5" fill="#212121" />
          <ellipse cx="69" cy="39" rx="3.5" ry="4.5" fill="#212121" />
          <circle cx="52.5" cy="37.5" r="1.2" fill="#FFFFFF" />
          <circle cx="70.5" cy="37.5" r="1.2" fill="#FFFFFF" />
        </>
      )}

      {/* Red Nose */}
      <circle cx="60" cy="49" r="6" fill="url(#doraNoseGrad)" stroke="#990000" strokeWidth="1" />
      <circle cx="58" cy="47" r="1.8" fill="#FFFFFF" opacity="0.8" />

      {/* Nose Vertical Line */}
      <line x1="60" y1="55" x2="60" y2="72" stroke="#212121" strokeWidth="2" />

      {/* Mouth */}
      {mood === 'happy' ? (
        /* Wide open happy mouth */
        <path d="M 42 66 Q 60 84 78 66 Z" fill="#E53935" stroke="#212121" strokeWidth="2" strokeLinejoin="round" />
      ) : mood === 'surprised' ? (
        /* Surprised 'O' mouth */
        <ellipse cx="60" cy="72" rx="7" ry="9" fill="#E53935" stroke="#212121" strokeWidth="2" />
      ) : mood === 'concerned' ? (
        /* Slightly wavy mouth */
        <path d="M 44 73 Q 52 69 60 73 Q 68 77 76 73" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        /* Classic Smile */
        <path d="M 40 66 Q 60 80 80 66" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Whiskers - Left Side */}
      <line x1="22" y1="52" x2="44" y2="56" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="62" x2="44" y2="62" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="72" x2="44" y2="68" stroke="#212121" strokeWidth="2" strokeLinecap="round" />

      {/* Whiskers - Right Side */}
      <line x1="98" y1="52" x2="76" y2="56" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
      <line x1="100" y1="62" x2="76" y2="62" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
      <line x1="98" y1="72" x2="76" y2="68" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
