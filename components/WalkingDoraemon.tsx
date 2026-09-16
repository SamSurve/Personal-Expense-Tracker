'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Doraemon3DCharacter, DoraemonMood } from './Doraemon3DCharacter'
import { DashboardSummaryDTO } from '@/lib/api'
import { X, Sparkles, ArrowRight } from 'lucide-react'

interface WalkingDoraemonProps {
  summaryData: DashboardSummaryDTO | null
  lastExpenseTitle?: string
  lastExpenseAmount?: number
  triggerCounter: number
  onOpenImpact: () => void
}

type WalkPhase = 'IDLE' | 'ENTER_WALK' | 'SPEAKING' | 'EXIT_WALK'

export function WalkingDoraemon({
  summaryData,
  lastExpenseTitle,
  lastExpenseAmount,
  triggerCounter,
  onOpenImpact,
}: WalkingDoraemonProps) {
  const [phase, setPhase] = useState<WalkPhase>('IDLE')
  const [positionX, setPositionX] = useState<number>(350) // 350px = off-screen right
  const [facing, setFacing] = useState<'left' | 'right'>('left')
  const [isWalking, setIsWalking] = useState<boolean>(false)
  const [showBubble, setShowBubble] = useState<boolean>(false)

  const speakTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Trigger Walking Entrance whenever a real expense operation completes
  useEffect(() => {
    if (triggerCounter > 0 && summaryData) {
      // Clear any existing timers
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current)

      // Reset state for Walk-In
      setPhase('ENTER_WALK')
      setFacing('left')
      setIsWalking(true)
      setShowBubble(false)
      setPositionX(350)

      // Animate walking in over 2.2 seconds
      const startTime = Date.now()
      const startX = 350
      const targetX = 20
      const duration = 2200

      const animInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(1, elapsed / duration)
        // Smooth ease-out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress)
        const currentX = startX - (startX - targetX) * easeProgress

        setPositionX(currentX)

        if (progress >= 1) {
          clearInterval(animInterval)
          setPositionX(targetX)
          setIsWalking(false)
          setPhase('SPEAKING')
          
          // Speech bubble appears ONLY after Doraemon stops walking
          setTimeout(() => {
            setShowBubble(true)
          }, 100)

          // Stay speaking for 4.2 seconds before walking out
          speakTimerRef.current = setTimeout(() => {
            handleStartExit()
          }, 4200)
        }
      }, 16)

      return () => {
        clearInterval(animInterval)
      }
    }
  }, [triggerCounter])

  // Walk-Out Exit Sequence
  const handleStartExit = () => {
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current)
    setShowBubble(false)
    
    // Turn around and start walking right after short delay
    setTimeout(() => {
      setPhase('EXIT_WALK')
      setFacing('right') // Turn around facing right
      setIsWalking(true)

      const startTime = Date.now()
      const startX = positionX
      const targetX = 380
      const duration = 2000

      const animInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(1, elapsed / duration)
        // Smooth ease-in quad
        const easeProgress = progress * progress
        const currentX = startX + (targetX - startX) * easeProgress

        setPositionX(currentX)

        if (progress >= 1) {
          clearInterval(animInterval)
          setPositionX(380)
          setIsWalking(false)
          setPhase('IDLE')
        }
      }, 16)
    }, 200)
  }

  // Deterministic Message & Mood Engine derived from real MySQL database data
  const reaction = useMemo(() => {
    if (!summaryData) {
      return {
        mood: 'normal' as DoraemonMood,
        headline: 'Expense recorded!',
        statusMsg: "Nice! You're on track.",
      }
    }

    const pace = summaryData.spendingPace
    const health = summaryData.spendingHealth
    const overCat = summaryData.categoryComparisons?.find((c) => c.isOver)

    // Rule 1: Large single purchase impact (>15% of discretionary capacity)
    if (
      lastExpenseAmount &&
      pace?.discretionaryCapacity &&
      lastExpenseAmount >= pace.discretionaryCapacity * 0.15
    ) {
      return {
        mood: 'surprised' as DoraemonMood,
        headline: 'Whoa! Large expense recorded.',
        statusMsg: 'That purchase changed your month-end forecast.',
      }
    }

    // Rule 2: Spending Pace is Above Target
    if (pace?.paceStatus === 'ABOVE PACE') {
      return {
        mood: 'concerned' as DoraemonMood,
        headline: 'Careful! Spending pace is high.',
        statusMsg: "You're spending faster than your planned daily pace.",
      }
    }

    // Rule 3: Category Budget Exceeded
    if (overCat) {
      return {
        mood: 'concerned' as DoraemonMood,
        headline: 'Category budget alert!',
        statusMsg: `Spending in ${overCat.categoryName} is near/exceeding your baseline.`,
      }
    }

    // Rule 4: Optimal / Healthy Pace
    if (health?.score && health.score >= 80) {
      return {
        mood: 'happy' as DoraemonMood,
        headline: 'Expense added!',
        statusMsg: "Nice! Your spending pace looks healthy.",
      }
    }

    // Default
    return {
      mood: 'normal' as DoraemonMood,
      headline: 'Expense added!',
      statusMsg: "Keep tracking and I'll help you spot patterns.",
    }
  }, [summaryData, lastExpenseAmount])

  if (phase === 'IDLE' || !summaryData) return null

  const spentDisplay = lastExpenseAmount ? lastExpenseAmount.toLocaleString('en-IN') : '0'
  const remainingDisplay = summaryData.remainingBalance != null
    ? Math.max(0, summaryData.remainingBalance).toLocaleString('en-IN')
    : '0'

  return (
    <div
      className="fixed bottom-4 right-0 z-50 pointer-events-none select-none"
      style={{
        transform: `translateX(${positionX}px)`,
        transition: 'transform 0.016s linear',
      }}
    >
      <div className="relative flex items-end gap-3 pointer-events-auto">
        {/* SPEECH BUBBLE BANNER (Appears ONLY after Doraemon stops walking) */}
        {showBubble && (
          <div className="mb-12 max-w-xs w-72 bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4 shadow-2xl backdrop-blur-md text-[var(--text)] animate-in fade-in zoom-in-95 duration-200 relative">
            {/* Pointer Arrow pointing to Doraemon */}
            <div className="absolute -right-2.5 bottom-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[var(--border)]" />
            <div className="absolute -right-2 bottom-6 w-0 h-0 border-t-7 border-t-transparent border-b-7 border-b-transparent border-l-7 border-l-[var(--panel)]" />

            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                  DORAEMON
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartExit}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-[var(--text)]">{reaction.headline}</h4>
              <p className="text-[11px] text-[var(--text-muted)] font-light leading-snug">
                {reaction.statusMsg}
              </p>

              {/* Exact Real Data Display */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Spent:</span>
                  <span className="font-bold text-[var(--danger)]">₹{spentDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Remaining:</span>
                  <span className="font-bold text-[var(--accent)]">₹{remainingDisplay}</span>
                </div>
              </div>

              {/* View Impact CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenImpact()
                    handleStartExit()
                  }}
                  className="w-full bg-[var(--accent)] text-black font-semibold text-xs py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>View Impact</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3D-LOOKING DIMENSIONAL DORAEMON CHARACTER */}
        <div className="shrink-0 cursor-pointer" onClick={() => setShowBubble((prev) => !prev)}>
          <Doraemon3DCharacter isWalking={isWalking} facing={facing} mood={reaction.mood} />
        </div>
      </div>
    </div>
  )
}
