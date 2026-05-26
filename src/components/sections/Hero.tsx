'use client'
import { Spotlight } from '@/components/ui/Spotlight'
import { SplineScene } from '@/components/ui/SplineScene'
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
    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseenter', () => setIsHovered(true))
    parent.addEventListener('mouseleave', () => setIsHovered(false))
    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseenter', () => setIsHovered(true))
      parent.removeEventListener('mouseleave', () => setIsHovered(false))
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

      {/* 左：文字 — flex 稍小一点，给右边 Spline 更多空间 */}
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

      {/* 右：Spline — 往左移 + 左边缘渐变消融"框"感 */}
      <div className="relative z-10 flex-[1.1] h-full -ml-16">
        {/* 左边缘遮罩：从 #000 → transparent，消融 Spline 背景边界 */}
        <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #000 0%, transparent 100%)' }} />
        {/* 右边缘也加一点，避免右侧露边 */}
        <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #000 0%, transparent 100%)' }} />

        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>

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
