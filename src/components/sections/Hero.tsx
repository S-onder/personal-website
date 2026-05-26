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

interface EchoEntry {
  x: number
  y: number
  ts: number // timestamp when recorded
}

function HeroRight() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Target mouse pos (raw)
  const mouseTarget = useRef({ x: -9999, y: -9999 })
  const isInsideRef = useRef(false)

  // Spring-smoothed cursor position
  const cursorSpring = useRef<SpringState>({ x: -9999, y: -9999, vx: 0, vy: 0 })
  // Current rendered cursor position (for mask + circle)
  const cursorPos = useRef({ x: -9999, y: -9999 })

  // Grid parallax spring
  const gridSpring = useRef<SpringState>({ x: 0, y: 0, vx: 0, vy: 0 })
  const gridPos = useRef({ x: 0, y: 0 })

  // Echo trail
  const echoHistory = useRef<EchoEntry[]>([])
  const frameCount = useRef(0)

  // DOM refs for live style updates (avoid React re-renders)
  const cursorCircleRef = useRef<HTMLDivElement>(null)
  const maskLayerRef = useRef<HTMLDivElement>(null)
  const gridLayerRef = useRef<HTMLDivElement>(null)
  const echoContainerRef = useRef<HTMLDivElement>(null)

  const rafRef = useRef<number | null>(null)

  // Spring integration step
  function stepSpring(
    state: SpringState,
    target: { x: number; y: number },
    dt: number,
    stiffness: number,
    damping: number
  ): SpringState {
    const clampedDt = Math.min(dt, 50) / 1000 // seconds, max 50ms
    const ax = -stiffness * (state.x - target.x) - damping * state.vx
    const ay = -stiffness * (state.y - target.y) - damping * state.vy
    const vx = state.vx + ax * clampedDt
    const vy = state.vy + ay * clampedDt
    const x = state.x + vx * clampedDt
    const y = state.y + vy * clampedDt
    return { x, y, vx, vy }
  }

  const lastTime = useRef<number>(0)
  const ECHO_DURATION = 400 // ms

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseTarget.current = { x, y }
      isInsideRef.current = true
    }

    const handleMouseLeave = () => {
      isInsideRef.current = false
      mouseTarget.current = { x: -9999, y: -9999 }
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    function tick(now: number) {
      const dt = lastTime.current ? now - lastTime.current : 16
      lastTime.current = now
      frameCount.current += 1

      const target = mouseTarget.current
      const inside = isInsideRef.current

      // ── Cursor spring ──
      const cs = cursorSpring.current
      const nextCs = stepSpring(cs, target, dt, 120, 20)
      cursorSpring.current = nextCs
      cursorPos.current = { x: nextCs.x, y: nextCs.y }

      // ── Grid parallax spring ──
      let gridTarget = { x: 0, y: 0 }
      if (inside && container) {
        const rect = container.getBoundingClientRect()
        const normX = (target.x / rect.width) * 2 - 1  // -1..1
        const normY = (target.y / rect.height) * 2 - 1
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

      // ── Echo history recording (every 2 frames) ──
      if (inside && frameCount.current % 2 === 0) {
        echoHistory.current.push({ x: nextCs.x, y: nextCs.y, ts: now })
        // Keep only last 8
        if (echoHistory.current.length > 8) {
          echoHistory.current.shift()
        }
      }
      // Purge old echoes
      echoHistory.current = echoHistory.current.filter(e => now - e.ts < ECHO_DURATION)

      // ── DOM updates ──
      const cx = cursorPos.current.x
      const cy = cursorPos.current.y

      // Cursor circle position
      if (cursorCircleRef.current) {
        const visible = inside && cx > 0
        cursorCircleRef.current.style.transform = `translate(${cx - 120}px, ${cy - 120}px)`
        cursorCircleRef.current.style.opacity = visible ? '1' : '0'
      }

      // aigc mask: hole at cursor position
      if (maskLayerRef.current) {
        const maskStr = inside && cx > 0
          ? `radial-gradient(circle 120px at ${cx}px ${cy}px, transparent 80px, black 120px)`
          : 'none'
        maskLayerRef.current.style.maskImage = maskStr
        maskLayerRef.current.style.webkitMaskImage = maskStr
      }

      // Grid parallax
      if (gridLayerRef.current) {
        gridLayerRef.current.style.transform = `translate(${gridPos.current.x}px, ${gridPos.current.y}px)`
      }

      // Echo circles
      if (echoContainerRef.current) {
        const echoes = echoHistory.current
        // Build innerHTML for echoes
        let html = ''
        for (let i = 0; i < echoes.length; i++) {
          const e = echoes[i]
          const age = now - e.ts
          const t = age / ECHO_DURATION // 0 (fresh) → 1 (old)
          const opacity = (1 - t) * 0.35
          const diameter = 240 - t * 40 // 240 → 200
          const radius = diameter / 2
          html += `<div style="
            position:absolute;
            left:0;top:0;
            width:${diameter}px;
            height:${diameter}px;
            border-radius:50%;
            border:1px solid rgba(77,142,248,0.5);
            opacity:${opacity};
            pointer-events:none;
            transform:translate(${e.x - radius}px,${e.y - radius}px);
          "></div>`
        }
        echoContainerRef.current.innerHTML = html
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
      {/* Layer 0: /sjl.jpg — base portrait, slightly darkened */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sjl.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: 'cover', filter: 'brightness(0.7)', zIndex: 0 }}
      />

      {/* Layer 1: /aigc.png — covers base, masked to reveal sjl.jpg at cursor */}
      <div
        ref={maskLayerRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/aigc.png"
          alt=""
          aria-hidden
          className="w-full h-full"
          style={{ objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Layer 2: Fine grid with parallax */}
      <div
        ref={gridLayerRef}
        className="absolute pointer-events-none"
        style={{
          inset: '-20px', // slightly oversized so parallax shift doesn't expose edges
          zIndex: 2,
          backgroundImage: `
            linear-gradient(rgba(77,142,248,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77,142,248,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          willChange: 'transform',
        }}
      />

      {/* Layer 3a: Echo residuals container */}
      <div
        ref={echoContainerRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 3 }}
      />

      {/* Layer 3b: Main cursor tracking circle */}
      <div
        ref={cursorCircleRef}
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: 240,
          height: 240,
          borderRadius: '50%',
          border: '1.5px solid rgba(77,142,248,0.7)',
          background: 'radial-gradient(circle at center, rgba(77,142,248,0.08) 0%, transparent 70%)',
          zIndex: 4,
          opacity: 0,
          willChange: 'transform, opacity',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Left-edge fade mask */}
      <div
        className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #08090a 0%, transparent 100%)' }}
      />
      {/* Right-edge fade mask */}
      <div
        className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
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
