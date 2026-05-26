'use client'
import { Spotlight } from '@/components/ui/Spotlight'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

const tags = ['召回', '排序', '重排', 'LLM', '强化学习', 'Scaling Law', 'AI Agent', '生成式推荐']

// ibelick/spotlight — 弹性跟随光圈（framer-motion useSpring）
function FollowSpotlight({ size = 320 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parent, setParent] = useState<HTMLElement | null>(null)

  const mouseX = useSpring(0, { bounce: 0 })
  const mouseY = useSpring(0, { bounce: 0 })

  const left = useTransform(mouseX, x => `${x - size / 2}px`)
  const top  = useTransform(mouseY, y => `${y - size / 2}px`)

  useEffect(() => {
    const p = containerRef.current?.parentElement ?? null
    setParent(p)
  }, [])

  const onMove = useCallback((e: MouseEvent) => {
    if (!parent) return
    const { left, top } = parent.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }, [parent, mouseX, mouseY])

  useEffect(() => {
    if (!parent) return
    const enterHandler = () => setIsHovered(true)
    const leaveHandler = () => setIsHovered(false)
    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseenter', enterHandler)
    parent.addEventListener('mouseleave', leaveHandler)
    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseenter', enterHandler)
      parent.removeEventListener('mouseleave', leaveHandler)
    }
  }, [parent, onMove])

  return (
    <motion.div
      ref={containerRef}
      className="pointer-events-none absolute rounded-full blur-xl transition-opacity duration-200"
      style={{
        width: size,
        height: size,
        left,
        top,
        background: 'radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, rgba(200,210,255,0.06) 40%, transparent 80%)',
        opacity: isHovered ? 1 : 0,
        zIndex: 5,
      }}
    />
  )
}

// ── HeroRight ────────────────────────────────────────────────────────────────

interface SpringState {
  x: number
  y: number
  vx: number
  vy: number
}

function HeroRight() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridLayerRef = useRef<HTMLDivElement>(null)

  // Grid parallax spring
  const gridSpring = useRef<SpringState>({ x: 0, y: 0, vx: 0, vy: 0 })
  const gridPos = useRef({ x: 0, y: 0 })

  const isInsideRef = useRef(false)
  const mouseTarget = useRef({ x: 0, y: 0 })

  // aigc image ref
  const aigcImg = useRef<HTMLImageElement | null>(null)

  // Pending erase points (mouse positions since last frame)
  const pendingPoints = useRef<{ x: number; y: number }[]>([])
  const lastErasePoint = useRef<{ x: number; y: number } | null>(null)

  const rafRef = useRef<number | null>(null)
  const lastTime = useRef<number>(0)

  // Spring integration step
  function stepSpring(
    state: SpringState,
    target: { x: number; y: number },
    dt: number,
    stiffness: number,
    damping: number
  ): SpringState {
    const clampedDt = Math.min(dt, 50) / 1000
    const ax = -stiffness * (state.x - target.x) - damping * state.vx
    const ay = -stiffness * (state.y - target.y) - damping * state.vy
    const vx = state.vx + ax * clampedDt
    const vy = state.vy + ay * clampedDt
    const x = state.x + vx * clampedDt
    const y = state.y + vy * clampedDt
    return { x, y, vx, vy }
  }

  // Draw aigc.png on canvas with cover crop (center-top)
  const drawAigc = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !aigcImg.current?.complete) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cw = canvas.width
    const ch = canvas.height
    const iw = aigcImg.current.naturalWidth
    const ih = aigcImg.current.naturalHeight
    if (!iw || !ih) return
    // cover: scale to fill, crop center-top
    const scale = Math.max(cw / iw, ch / ih)
    const sw = cw / scale
    const sh = ch / scale
    const sx = (iw - sw) / 2
    const sy = 0 // center-top
    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(aigcImg.current, sx, sy, sw, sh, 0, 0, cw, ch)
  }, [])

  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const { width, height } = container.getBoundingClientRect()
    canvas.width = width
    canvas.height = height
    drawAigc()
  }, [drawAigc])

  // Erase a circle at (x, y) with soft brush
  function erase(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
    grad.addColorStop(0, 'rgba(0,0,0,1)')
    grad.addColorStop(0.5, 'rgba(0,0,0,0.8)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // Interpolate between two points with a given step size
  function interpolate(
    x0: number, y0: number,
    x1: number, y1: number,
    step: number,
    cb: (x: number, y: number) => void
  ) {
    const dx = x1 - x0, dy = y1 - y0
    const dist = Math.sqrt(dx * dx + dy * dy)
    const steps = Math.max(1, Math.floor(dist / step))
    for (let i = 0; i <= steps; i++) {
      cb(x0 + dx * (i / steps), y0 + dy * (i / steps))
    }
  }

  useEffect(() => {
    // Load aigc image
    const img = new Image()
    aigcImg.current = img
    img.onload = () => {
      resizeCanvas()
    }
    img.src = '/aigc.png'

    // ResizeObserver to keep canvas in sync
    const ro = new ResizeObserver(() => resizeCanvas())
    if (containerRef.current) ro.observe(containerRef.current)

    return () => ro.disconnect()
  }, [resizeCanvas])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseTarget.current = { x, y }
      isInsideRef.current = true
      pendingPoints.current.push({ x, y })
    }

    const handleMouseLeave = () => {
      isInsideRef.current = false
      lastErasePoint.current = null
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    function tick(now: number) {
      const dt = lastTime.current ? now - lastTime.current : 16
      lastTime.current = now

      const inside = isInsideRef.current

      // ── Grid parallax spring ──
      let gridTarget = { x: 0, y: 0 }
      if (inside && container) {
        const rect = container.getBoundingClientRect()
        const normX = (mouseTarget.current.x / rect.width) * 2 - 1
        const normY = (mouseTarget.current.y / rect.height) * 2 - 1
        const maxOffset = 15
        gridTarget = {
          x: Math.max(-maxOffset, Math.min(maxOffset, normX * 0.015 * rect.width)),
          y: Math.max(-maxOffset, Math.min(maxOffset, normY * 0.015 * rect.height)),
        }
      }
      const gs = gridSpring.current
      const nextGs = stepSpring(gs, gridTarget, dt, 80, 18)
      gridSpring.current = nextGs
      gridPos.current = { x: nextGs.x, y: nextGs.y }

      if (gridLayerRef.current) {
        gridLayerRef.current.style.transform = `translate(${gridPos.current.x}px, ${gridPos.current.y}px)`
      }

      // ── Canvas scratch-off erase ──
      const canvas = canvasRef.current
      const points = pendingPoints.current.splice(0)
      if (canvas && points.length > 0) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          for (const pt of points) {
            if (lastErasePoint.current) {
              interpolate(
                lastErasePoint.current.x, lastErasePoint.current.y,
                pt.x, pt.y,
                8,
                (ix, iy) => erase(ctx, ix, iy, 120)
              )
            } else {
              erase(ctx, pt.x, pt.y, 120)
            }
            lastErasePoint.current = pt
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative flex-[1.1] h-full -ml-16 overflow-hidden">
      {/* 底层：真实照片 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/sjl.jpg" alt="" aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.7)', zIndex: 0 }}
      />

      {/* 顶层：canvas（aigc.png + 刮刮卡擦除） */}
      <canvas ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* 网格视差层 */}
      <div ref={gridLayerRef} className="absolute pointer-events-none"
        style={{
          inset: '-20px',
          zIndex: 2,
          backgroundImage: `linear-gradient(rgba(77,142,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(77,142,248,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          willChange: 'transform',
        }}
      />

      {/* 左边缘渐变遮罩 */}
      <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #08090a 0%, transparent 100%)' }}
      />
      {/* 右边缘渐变遮罩 */}
      <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #08090a 0%, transparent 100%)' }}
      />
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full h-screen overflow-hidden bg-black/[0.96] flex"
    >
      {/* Aceternity 静态大光锥 */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      {/* ibelick 弹性跟随光圈 */}
      <FollowSpotlight size={340} />

      {/* 左：文字 — flex 稍小一点，给右边更多空间 */}
      <div className="relative z-10 flex-[0.9] flex flex-col justify-center px-[8%] animate-[heroFadeIn_1.2s_ease_both]">
        <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-bold tracking-[-0.045em] leading-[1.07] mb-3
          bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          施纪隆
        </h1>
        <p className="text-[clamp(0.9rem,1.8vw,1.15rem)] text-[var(--text-muted)] font-normal tracking-[0.12em] uppercase mb-10">
          Recommendation Algorithm Engineer
        </p>
        <div className="flex flex-wrap gap-2 animate-[heroFadeIn_1.4s_ease_0.3s_both]">
          {tags.map(tag => (
            <span key={tag}
              className="px-[0.9rem] py-[0.3rem] rounded-full border border-white/[0.08] text-[0.78rem]
                text-[var(--text-dim)] bg-white/[0.03] transition-all duration-200
                hover:border-[var(--accent1)] hover:text-[var(--text)] hover:bg-white/[0.06]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 右：HeroRight — 分层交互区域 */}
      <HeroRight />

      {/* Scroll hint */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5
          text-[var(--text-muted)] text-[0.75rem] tracking-[0.1em] cursor-pointer z-20
          animate-[breathe_2.5s_ease-in-out_infinite]"
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span>SCROLL</span>
        <div className="w-5 h-5 border-r-[1.5px] border-b-[1.5px] border-[var(--text-muted)] rotate-45 -mt-1" />
      </div>

      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%,100% { opacity:0.4; transform:translateX(-50%) translateY(0); }
          50%     { opacity:0.9; transform:translateX(-50%) translateY(6px); }
        }
        @keyframes animate-spotlight {
          0%   { opacity:0;  transform:translate(-72%,-62%) skewX(-30deg); }
          100% { opacity:1;  transform:translate(-50%,-40%) skewX(-30deg); }
        }
        .animate-spotlight {
          animation: animate-spotlight 2s ease 0.75s forwards;
        }
      `}</style>
    </section>
  )
}
