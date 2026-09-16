'use client'

import React, { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const randomColors = (count: number) =>
  Array(count)
    .fill(0)
    .map(() => '#' + Math.floor(0xffffff * Math.random()).toString(16).padStart(6, '0'))

interface TubesBackgroundProps {
  children?: React.ReactNode
  className?: string
  enableClickInteraction?: boolean
  onColorChange?: (color: string) => void
}

export function TubesBackground({
  children,
  className,
  enableClickInteraction = true,
  onColorChange,
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [, setIsLoaded] = useState(false)
  const tubesInstance = useRef<any>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    let isMounted = true

    ;(async () => {
      if (canvasRef.current) {
        try {
          const TubesCursor = (
            await Function(
              'return import("https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js")'
            )()
          ).default

          if (!isMounted) return

          tubesInstance.current = TubesCursor(canvasRef.current, {
            tubes: {
              colors: ['#f967fb', '#53bc28', '#6958d5'],
              lights: {
                intensity: 200,
                colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
              },
            },
          })

          setIsLoaded(true)

          const handleResize = () => {}
          window.addEventListener('resize', handleResize)
          cleanup = () => {
            window.removeEventListener('resize', handleResize)
          }
        } catch (error) {
          console.error('Failed to load TubesCursor:', error)
        }
      }
    })()

    return () => {
      isMounted = false
      if (cleanup) cleanup()
    }
  }, [])

  const handleClick = () => {
    if (!enableClickInteraction || !tubesInstance.current) return
    const newTubesColors = randomColors(3)
    const newLightsColors = randomColors(4)
    tubesInstance.current.tubes.setColors(newTubesColors)
    tubesInstance.current.tubes.setLightsColors(newLightsColors)
    if (onColorChange) {
      onColorChange(newTubesColors[0])
    }
  }

  return (
    <div
      className={cn('relative w-full h-full min-h-[400px] overflow-hidden bg-black', className)}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'none' }}
      />
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  )
}
