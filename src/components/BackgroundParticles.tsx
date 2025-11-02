import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hue: number
  alpha: number
}

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let particles: Particle[] = []

    const init = () => {
      particles = new Array(60).fill(0).map(() => {
        const r = 0.6 + Math.random() * 1.6
        const speed = 0.04 + Math.random() * 0.12
        const angle = Math.random() * Math.PI * 2
        const hue = 0 // unused for grayscale
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r,
          hue,
          alpha: 0.08 + Math.random() * 0.18,
        }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      // subtle vignette
      const grad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        h * 0.1,
        w / 2,
        h / 2,
        h * 0.8
      )
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.02)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.22)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        // wrap
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.beginPath()
        const color = `rgba(255,255,255,${p.alpha})`
        ctx.fillStyle = color
        ctx.shadowColor = 'rgba(255,255,255,0.5)'
        ctx.shadowBlur = 8
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    init()
    draw()

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      init()
    }
    window.addEventListener('resize', onResize)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.45,
        pointerEvents: 'none',
        filter: 'blur(0.2px)',
      }}
    />
  )
}
