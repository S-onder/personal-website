'use client'
import { useEffect, useRef } from 'react'

const education = [
  { degree: '硕士', school: '上海对外经贸大学', major: '应用统计专业', period: '2023.09 — 2025.06' },
  { degree: '学士', school: '南京财经大学', major: '金融数学专业', period: '2018.09 — 2022.06' },
]

const skills = ['生成式召回','VQ-VAE','双塔模型','LLM+推荐','强化学习','多模态','Scaling Law','用户画像','AI Agent','负采样','特征工程','精排模型','粗排','Python']

const stats = [
  { target: 3, suffix: '%', label: 'Feed 入口\n总时长提升' },
  { target: 1, suffix: '%', label: 'Feed DAU\n提升' },
  { target: 4, suffix: '%', label: '队列互动率\n提升' },
  { target: 4, suffix: ' 项', label: '落地核心\n算法项目' },
]

function useCountUp(ref: React.RefObject<HTMLElement | null>, target: number, suffix: string) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      observer.disconnect()
      const duration = 1400
      const start = performance.now()
      const step = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        const val = Math.round(ease * target * 10) / 10
        el.textContent = (Number.isInteger(target) ? Math.round(val) : val) + suffix
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, target, suffix])
}

function StatCard({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useCountUp(ref, target, suffix)
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 text-center transition-all duration-300 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]">
      <div ref={ref} className="text-[2.4rem] font-bold text-[var(--text)] tracking-[-0.04em] leading-none">0{suffix}</div>
      <div className="text-[0.8rem] text-[var(--text-muted)] mt-1.5 leading-snug whitespace-pre-line">{label}</div>
    </div>
  )
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'))
    }, { threshold: 0.15 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      observer.disconnect()
      skillsRef.current?.querySelectorAll('.skill-tag').forEach(el => el.classList.add('tags-visible'))
    }, { threshold: 0.3 })
    if (skillsRef.current) observer.observe(skillsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="max-w-[1100px] mx-auto px-[5%] py-[70px]">
      <div className="text-[0.78rem] font-semibold tracking-[0.18em] uppercase text-[var(--accent1)] mb-2">About</div>
      <h2 className="section-title text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-[var(--text)] mb-12 tracking-[-0.03em] leading-[1.1]">关于我</h2>

      <div ref={sectionRef} className="grid grid-cols-2 gap-16 items-start opacity-0 translate-y-6 transition-all duration-700 [&.visible]:opacity-100 [&.visible]:translate-y-0 max-md:grid-cols-1 max-md:gap-10">
        <div>
          <p className="text-[1.05rem] text-[var(--text-dim)] leading-[1.8]">
            百度基础技术组<strong className="text-[var(--text)] font-semibold">推荐算法工程师</strong>，专注 Feed 流推荐系统召回链路的算法研发与创新。
            在生成式召回、LLM 与推荐系统结合、多路召回融合等方向有深度实践，
            持续关注 RecSys · NeurIPS · ICLR · KDD 前沿进展。
          </p>
          <div ref={skillsRef} className="flex flex-wrap gap-2 mt-6">
            {skills.map((s, i) => (
              <span
                key={s}
                className="skill-tag px-[0.85rem] py-[0.3rem] rounded-md border border-[var(--border)] text-[0.82rem] font-medium text-[var(--text-dim)] bg-[var(--bg-card)] opacity-0 translate-y-3 transition-none hover:border-[var(--accent1)] hover:text-[var(--text)] hover:-translate-y-px"
                style={{ '--tag-delay': `${i * 55}ms` } as React.CSSProperties}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      {/* Education sub-section */}
      <div className="mt-10">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[0.78rem] font-semibold tracking-[0.18em] uppercase text-[var(--accent1)] shrink-0">EDUCATION</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="flex flex-col gap-3">
          {education.map(edu => (
            <div
              key={edu.school}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] p-[1.1rem_1.5rem] flex items-stretch gap-6 transition-all duration-300 hover:-translate-y-[3px] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
            >
              <div className="flex items-stretch gap-4">
                <div className="w-[3px] rounded-full bg-[var(--accent1)] self-stretch" />
                <div className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent1)] self-center">{edu.degree}</div>
              </div>
              <div className="flex-1 flex items-center justify-between gap-4">
                <div className="flex flex-col justify-center">
                  <div className="text-[1.1rem] font-bold text-[var(--text)] leading-tight">{edu.school}</div>
                  <div className="text-[0.9rem] text-[var(--text-dim)] mt-0.5">{edu.major}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[0.8rem] text-[var(--text-muted)]">{edu.period}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .skill-tag.tags-visible {
          animation: skillTagEnter 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
          animation-delay: var(--tag-delay, 0ms);
        }
        @keyframes skillTagEnter {
          from { opacity:0; transform:translateY(12px) scale(0.985); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </section>
  )
}
