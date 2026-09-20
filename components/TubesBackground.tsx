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

// Robust loader that tries multiple CDN mirrors and loading strategies
const loadTubesCursor = async (): Promise<any> => {
  const cdnUrls = [
    'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js',
    'https://unpkg.com/threejs-components@0.0.19/build/cursors/tubes1.min.js',
  ]

  let lastError: any = null

  // Strategy 1: Dynamic import via new Function (bypasses Next.js Webpack/Turbopack bundler)
  for (const url of cdnUrls) {
    try {
      const dynamicImport = new Function('moduleUrl', 'return import(moduleUrl)')
      const mod = await dynamicImport(url)
      const fn = mod?.default ?? mod?.tubes ?? mod?.TubesCursor ?? mod
      if (typeof fn === 'function') {
        return fn
      }
    } catch (err) {
      lastError = err
      console.warn(`[TubesBackground] Failed to dynamically import from ${url}:`, err)
    }
  }

  // Strategy 2: Native script tag injection fallback
  if (typeof document !== 'undefined') {
    for (const url of cdnUrls) {
      try {
        const fn = await new Promise<any>((resolve, reject) => {
          const script = document.createElement('script')
          script.type = 'module'
          const callbackName = `__tubes_cursor_cb_${Date.now()}`
          ;(window as any)[callbackName] = (mod: any) => {
            delete (window as any)[callbackName]
            script.remove()
            resolve(mod?.default ?? mod?.tubes ?? mod?.TubesCursor ?? mod)
          }
          script.textContent = `
            import TubesCursor from "${url}";
            if (window["${callbackName}"]) {
              window["${callbackName}"](TubesCursor);
            }
          `
          script.onerror = (e) => {
            delete (window as any)[callbackName]
            script.remove()
            reject(e)
          }
          document.head.appendChild(script)
        })
        if (typeof fn === 'function') {
          return fn
        }
      } catch (err) {
        lastError = err
        console.warn(`[TubesBackground] Script tag fallback failed for ${url}:`, err)
      }
    }
  }

  throw lastError || new Error('Failed to load TubesCursor from all sources')
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
    let isDisposed = false
    let appInstance: any = null

    const init = async () => {
      if (!canvasRef.current) return

      try {
        const TubesCursor = await loadTubesCursor()

        if (isDisposed || !canvasRef.current) return

        appInstance = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ['#f967fb', '#53bc28', '#6958d5'],
            lights: {
              intensity: 200,
              colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
            },
          },
        })

        tubesInstance.current = appInstance
        setIsLoaded(true)

        // Wake up the 3D tubes geometry with initial dimensions and center mouse coordinate
        if (typeof window !== 'undefined') {
          if (appInstance && typeof appInstance.resize === 'function') {
            appInstance.resize()
          }

          setTimeout(() => {
            if (!isDisposed) {
              window.dispatchEvent(
                new MouseEvent('mousemove', {
                  clientX: window.innerWidth / 2,
                  clientY: window.innerHeight / 2,
                  bubbles: true,
                })
              )
            }
          }, 60)
        }
      } catch (error) {
        console.error('[TubesBackground] Failed to initialize TubesCursor:', error)
      }
    }

    init()

    return () => {
      isDisposed = true
      if (appInstance) {
        try {
          if (typeof appInstance.destroy === 'function') {
            appInstance.destroy()
          } else if (typeof appInstance.dispose === 'function') {
            appInstance.dispose()
          }
        } catch {
          // ignore cleanup error
        }
      }
      tubesInstance.current = null
    }
  }, [])

  const handleClick = () => {
    if (!enableClickInteraction || !tubesInstance.current) return
    const newTubesColors = randomColors(3)
    const newLightsColors = randomColors(4)
    if (tubesInstance.current.tubes) {
      if (typeof tubesInstance.current.tubes.setColors === 'function') {
        tubesInstance.current.tubes.setColors(newTubesColors)
      }
      if (typeof tubesInstance.current.tubes.setLightsColors === 'function') {
        tubesInstance.current.tubes.setLightsColors(newLightsColors)
      }
    }
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
        id="tubes-canvas"
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'none' }}
      />
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  )
}
