'use client'

import { useState } from 'react'

const projects = [
  {
    name: '召排一体化建模（三期迭代）',
    desc: 'VQ-VAE 量化 Token + DSSM 双塔初筛，结合 Encoder Early-Fusion 精排，两阶段链路训练保持目标预估一致性，实现全库资源打分的新召回范式。',
    metrics: ['链路 CTR +0.7%', 'Feed 时长累计 +1.64%', '分发量 +1.08%'],
  },
  {
    name: 'LLM 用户分群协同推荐（两期迭代）',
    desc: 'MiniBatchKMeans 聚类用户群体，LLM 深度推理完成语义去噪，融合群体后验信息与 LLM 相关性打分决策高质量召回资源，解决 UCF 长尾投票问题。',
    metrics: ['Feed 时长 +0.43%', '队列互动率 +4%', '分发量 +0.4%'],
  },
  {
    name: 'DeepES 多路召回融合优化（两期迭代）',
    desc: '升级至深度进化策略模型，神经网络学习特征空间到融合权重空间映射，实现用户-内容-场景细粒度权重预测，大幅提升个性化千面能力。引入延续消费因子兼顾长期价值。',
    metrics: ['Feed 时长 +0.23%', '合集/短剧时长 +0.37%', '分发量 +0.38%'],
  },
  {
    name: 'User-Agent 用户画像系统',
    desc: 'Planner-Executor-Reflection 三角色架构：Planner 基于 Qwen3-4B 完成用户核心人设与多维偏好结构化推理，Reflection 引入自我反思机制验证结果，突破传统画像行为碎片化局限。',
    metrics: ['Qwen3-4B', '多维语义画像', 'Agent 架构'],
  },
]

interface Project {
  name: string
  desc: string
  metrics: string[]
}

function ProjectCard({ p }: { p: Project }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative rounded-xl cursor-default"
      style={{
        border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        backgroundColor: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.18)' : undefined,
        transform: hovered ? 'translateY(-3px)' : undefined,
        transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left accent line */}
      <div
        className="absolute top-0 left-0 w-[3px] h-full bg-[var(--accent1)] z-10 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          borderRadius: '14px 0 0 14px',
        }}
      />

      <div className="p-[1.1rem]">
        <div className="text-[0.88rem] font-semibold text-[var(--text)] tracking-[-0.01em] mb-2 leading-snug">
          {p.name}
        </div>
        <div className="text-[0.78rem] text-[var(--text-muted)] leading-relaxed mb-2">
          {p.desc}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {p.metrics.map(m => (
            <span
              key={m}
              className="px-[0.65rem] py-[0.2rem] rounded-full text-[0.75rem] font-semibold
                bg-[rgba(94,106,210,0.1)] border border-[rgba(94,106,210,0.22)] text-[#c7cff8]"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="scroll-mt-[64px] max-w-[1100px] mx-auto px-[5%] pt-0 pb-[70px]">
      <div className="text-[0.78rem] font-semibold tracking-[0.18em] uppercase text-[var(--accent1)] mb-2">
        Experience
      </div>
      <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-[var(--text)] mb-6 tracking-[-0.03em] leading-[1.1]">
        工作经历
      </h2>

      <div className="relative pl-8">
        {/* Timeline line */}
        <div className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-[rgba(94,106,210,0.92)] to-transparent" />

        {/* Company header */}
        <div className="relative mb-5 pb-6 border-b border-[var(--border)]">
          <div
            className="absolute -left-[2.45rem] top-1.5 w-2.5 h-2.5 rounded-full
              bg-[radial-gradient(circle,rgba(247,248,248,0.96)_0%,rgba(94,106,210,0.94)_55%,rgba(94,106,210,0.18)_100%)]
              shadow-[0_0_14px_rgba(94,106,210,0.42)]
              animate-[timelineGlowPulse_3.4s_ease-in-out_infinite]"
          />
          <div className="text-[1.3rem] font-bold text-[var(--text)] tracking-[-0.02em] mb-1">
            百度 · 基础技术组
          </div>
          <div className="text-[0.85rem] text-[var(--text-muted)] flex gap-4 flex-wrap">
            <span>推荐算法工程师</span>
            <span>2025.07 — 至今</span>
          </div>
        </div>

        {/* Projects */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
          {projects.map(p => (
            <ProjectCard key={p.name} p={p} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes timelineGlowPulse {
          0%,100% { transform:scale(1); box-shadow:0 0 0 0 rgba(94,106,210,0.14),0 0 10px rgba(94,106,210,0.32); }
          50%      { transform:scale(1.24); box-shadow:0 0 0 8px rgba(94,106,210,0),0 0 18px rgba(94,106,210,0.48); }
        }
      `}</style>
    </section>
  )
}
