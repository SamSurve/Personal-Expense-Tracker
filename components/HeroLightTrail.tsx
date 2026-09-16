'use client'

import React, { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  life: number
  maxLife: number
  radius: number
  hue: number
}

export function HeroLightTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Mouse coordinates with lerp position
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isMoving: false,
    }

    const points: Point[] = []
    let hueOffset = 140 // subtle emerald / green / cyan tint

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top
      mouse.isMoving = true

      // Spawn particles on mouse move
      for (let i = 0; i < 2; i++) {
        points.push({
          x: mouse.x + (Math.random() - 0.5) * 8,
          y: mouse.y + (Math.random() - 0.5) * 8,
          targetX: mouse.targetX,
          targetY: mouse.targetY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          radius: 15 + Math.random() * 25,
          hue: 140 + Math.sin(Date.now() * 0.002) * 20,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const render = () => {
      // Lerp mouse position for smooth inertia delay
      mouse.x += (mouse.targetX - mouse.x) * 0.08
      mouse.y += (mouse.targetY - mouse.y) * 0.08

      // Clear canvas with trail fade
      ctx.fillStyle = 'rgba(9, 9, 11, 0.25)'
      ctx.fillRect(0, 0, width, height)

      if (!prefersReducedMotion) {
        // Draw connected glowing ribbon path
        if (points.length > 2) {
          ctx.beginPath()
          ctx.moveTo(points[0].x, points[0].y)
          for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2
            const yc = (points[i].y + points[i + 1].y) / 2
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
          }
          ctx.strokeStyle = `rgba(34, 197, 94, 0.12)`
          ctx.lineWidth = 3
          ctx.stroke()
        }

        // Update and draw particles
        for (let i = points.length - 1; i >= 0; i--) {
          const p = points[i]
          p.x += p.vx
          p.y += p.vy
          p.life -= 1 / p.maxLife

          if (p.life <= 0) {
            points.splice(i, 1)
            continue
          }

          const alpha = Math.max(0, p.life * 0.35)
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
          gradient.addColorStop(0, `hsla(${p.hue}, 80%, 55%, ${alpha})`)
          gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 45%, ${alpha * 0.4})`)
          gradient.addColorStop(1, `hsla(${p.hue}, 60%, 35%, 0)`)

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }

        // Ambient center glow at mouse cursor
        const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180)
        cursorGlow.addColorStop(0, 'rgba(34, 197, 94, 0.15)')
        cursorGlow.addColorStop(0.5, 'rgba(34, 197, 94, 0.04)')
        cursorGlow.addColorStop(1, 'rgba(34, 197, 94, 0)')
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2)
        ctx.fillStyle = cursorGlow
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      style={{ opacity: 0.85 }}
    />
  )
}
