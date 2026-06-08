'use client'

import { useMemo, useState } from 'react'

type Project = {
  name: string
  stage: string
  impact: string
  role: string
  summary: string
  problem: string
  solution: string
  outcomes: string[]
  tags: string[]
}

const projects: Project[] = [
  {
    name: '召排一体化建模（三期迭代）',
    stage: '已上线 / Feed 主链路',
    impact: '链路 CTR +0.7%',
    role: '召回 + 精排一体化设计',
    summary: 'VQ-VAE 量化 Token + DSSM 双塔初筛，结合 Encoder Early-Fusion 精排，统一全库资源打分链路。',
    problem: '传统召回与精排分阶段目标存在割裂，难以在全库资源上稳定放大效果。',
    solution: '通过量化 Token 建模内容语义，前置双塔进行高效粗筛，再用 Early-Fusion 精排承接统一目标，保持链路预估一致性。',
    outcomes: ['Feed 时长累计 +1.64%', '分发量 +1.08%', '形成新一代全库打分召回范式'],
    tags: ['Generative Recall', 'VQ-VAE', 'Two-Tower', 'Ranking'],
  },
  {
    name: 'LLM 用户分群协同推荐（两期迭代）',
    stage: '已上线 / 长尾优化',
    impact: '队列互动率 +4%',
    role: '分群建模 + LLM 语义决策',
    summary: 'MiniBatchKMeans 分群后引入 LLM 深度推理做语义去噪与相关性重排，提升长尾用户召回质量。',
    problem: '传统 UCF 在长尾和稀疏行为用户上投票信号弱，召回结果不稳定。',
    solution: '先聚类提取群体后验，再通过 LLM 对候选资源做语义相关性判别与噪声过滤，让召回决策兼具群体统计与语义理解。',
    outcomes: ['Feed 时长 +0.43%', '分发量 +0.4%', '验证 LLM+Rec 在召回层的可落地性'],
    tags: ['LLM+Rec', 'Clustering', 'Long-tail', 'Semantic Rerank'],
  },
  {
    name: 'DeepES 多路召回融合优化（两期迭代）',
    stage: '持续迭代 / 融合策略',
    impact: 'Feed 时长 +0.23%',
    role: '融合权重学习',
    summary: '以深度进化策略学习从用户-内容-场景特征到融合权重空间的映射，实现更细粒度的多路召回调度。',
    problem: '固定权重或规则融合难以适配不同用户场景，限制个性化收益释放。',
    solution: '升级为神经化 DeepES 策略模型，并引入延续消费因子，兼顾短期点击与长期消费价值。',
    outcomes: ['合集/短剧时长 +0.37%', '分发量 +0.38%', '提升多场景下的千人千面能力'],
    tags: ['RL Strategy', 'Recall Fusion', 'Personalization', 'Long-term Value'],
  },
  {
    name: 'User-Agent 用户画像系统',
    stage: '研发中 / 画像体系升级',
    impact: 'Agent 化画像范式',
    role: '系统架构设计',
    summary: '基于 Planner-Executor-Reflection 三角色架构，构建可解释、多维度、可自检的用户语义画像系统。',
    problem: '传统画像往往受限于碎片化行为标签，难以形成稳定、可解释的高层用户认知。',
    solution: '由 Planner 负责结构化推理，Executor 执行信息整合，Reflection 做结果验证与反思，提升画像的完整性与可信度。',
    outcomes: ['Qwen3-4B 驱动', '多维语义画像结构', '可支持推荐/搜索/运营联动'],
    tags: ['AI Agent', 'User Modeling', 'Qwen3', 'Reasoning'],
  },
]

function MetricPill({ value, active = false }: { value: string; active?: boolean }) {
  return (
    <span
      className={`rounded-full border px-[0.75rem] py-[0.28rem] text-[0.74rem] font-semibold transition-all duration-200 ${
        active
          ? 'border-[rgba(94,106,210,0.5)] bg-[rgba(94,106,210,0.16)] text-[#d6ddff]'
          : 'border-[rgba(148,163,184,0.16)] bg-white/[0.03] text-[var(--text-muted)]'
      }`}
    >
      {value}
    </span>
  )
}

function ProjectCard({
  project,
  active,
  onSelect,
}: {
  project: Project
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative h-full rounded-[18px] border p-5 text-left transition-all duration-300 cursor-pointer ${
        active
          ? 'border-[rgba(94,106,210,0.56)] bg-[linear-gradient(180deg,rgba(94,106,210,0.16),rgba(255,255,255,0.04))] shadow-[0_18px_45px_rgba(25,35,80,0.18)]'
          : 'border-[var(--border)] bg-[var(--bg-card)] hover:-translate-y-[3px] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.16)]'
      }`}
      aria-pressed={active}
    >
      <div
        className={`absolute inset-y-0 left-0 w-[3px] rounded-l-[18px] transition-opacity duration-300 ${
          active ? 'opacity-100 bg-[var(--accent1)]' : 'opacity-0 bg-[var(--accent1)] group-hover:opacity-100'
        }`}
      />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent1)] mb-1">
            {project.stage}
          </div>
          <div className="text-[1rem] font-bold text-[var(--text)] leading-snug tracking-[-0.02em]">
            {project.name}
          </div>
        </div>
        <div className="shrink-0 rounded-full border border-[rgba(94,106,210,0.28)] bg-[rgba(94,106,210,0.1)] px-3 py-1 text-[0.75rem] font-semibold text-[#d6ddff]">
          {project.impact}
        </div>
      </div>

      <p className="text-[0.82rem] leading-relaxed text-[var(--text-dim)] mb-4 min-h-[68px]">
        {project.summary}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.slice(0, 3).map(tag => (
          <MetricPill key={tag} value={tag} active={active} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[0.78rem] text-[var(--text-muted)]">
        <span>{project.role}</span>
        <span className={`transition-transform duration-200 ${active ? 'translate-x-1 text-[var(--text)]' : 'group-hover:translate-x-1'}`}>
          查看成果 →
        </span>
      </div>
    </button>
  )
}

export default function Experience() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeProject = useMemo(() => projects[activeIndex], [activeIndex])

  return (
    <section id="experience" className="scroll-mt-[64px] max-w-[1100px] mx-auto px-[5%] pt-[48px] pb-[64px] flex flex-col">
      <div className="text-[0.78rem] font-semibold tracking-[0.18em] uppercase text-[var(--accent1)] mb-2">
        Experience
      </div>
      <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-[var(--text)] mb-4 tracking-[-0.03em] leading-[1.1]">
        工作经历 / 核心成果
      </h2>
      <p className="text-[0.95rem] text-[var(--text-muted)] leading-relaxed max-w-[760px] mb-8">
        将原有静态项目卡重构为“可选中 + 可展开理解”的成果卡。左侧用于快速扫读项目，右侧聚焦当前成果的业务问题、方案拆解与产出，形成最小可落地的交互式案例展示。
      </p>

      <div className="relative pl-8">
        <div className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-[rgba(94,106,210,0.92)] to-transparent" />

        <div className="relative mb-7 pb-6 border-b border-[var(--border)]">
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
            <span>Feed 推荐召回 / LLM+Rec / 用户建模</span>
          </div>
        </div>

        <div className="grid grid-cols-[1.05fr_0.95fr] gap-5 max-md:grid-cols-1">
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.name}
                project={project}
                active={index === activeIndex}
                onSelect={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <div className="rounded-[22px] border border-[rgba(94,106,210,0.22)] bg-[linear-gradient(180deg,rgba(94,106,210,0.14),rgba(255,255,255,0.04))] p-6 backdrop-blur-sm shadow-[0_18px_50px_rgba(14,20,42,0.18)]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent1)] mb-1">
                  Active Outcome Card
                </div>
                <h3 className="text-[1.2rem] font-bold text-[var(--text)] tracking-[-0.02em] leading-snug">
                  {activeProject.name}
                </h3>
              </div>
              <div className="rounded-full border border-[rgba(94,106,210,0.34)] bg-[rgba(94,106,210,0.12)] px-3 py-1 text-[0.78rem] font-semibold text-[#d6ddff] whitespace-nowrap">
                {activeProject.impact}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 max-sm:grid-cols-1">
              <div className="rounded-[16px] border border-[var(--border)] bg-black/10 p-4">
                <div className="text-[0.72rem] uppercase tracking-[0.14em] text-[var(--accent1)] mb-2">业务问题</div>
                <p className="text-[0.85rem] leading-[1.7] text-[var(--text-dim)]">{activeProject.problem}</p>
              </div>
              <div className="rounded-[16px] border border-[var(--border)] bg-black/10 p-4">
                <div className="text-[0.72rem] uppercase tracking-[0.14em] text-[var(--accent1)] mb-2">解决方案</div>
                <p className="text-[0.85rem] leading-[1.7] text-[var(--text-dim)]">{activeProject.solution}</p>
              </div>
            </div>

            <div className="rounded-[16px] border border-[var(--border)] bg-white/[0.03] p-4 mb-5">
              <div className="text-[0.72rem] uppercase tracking-[0.14em] text-[var(--accent1)] mb-2">我的角色</div>
              <p className="text-[0.86rem] leading-relaxed text-[var(--text)]">{activeProject.role}</p>
            </div>

            <div className="mb-5">
              <div className="text-[0.72rem] uppercase tracking-[0.14em] text-[var(--accent1)] mb-3">关键产出</div>
              <div className="flex flex-wrap gap-2.5 mb-4">
                {activeProject.tags.map(tag => (
                  <MetricPill key={tag} value={tag} active />
                ))}
              </div>
              <div className="grid gap-3">
                {activeProject.outcomes.map(outcome => (
                  <div
                    key={outcome}
                    className="rounded-[14px] border border-[rgba(148,163,184,0.14)] bg-black/10 px-4 py-3 text-[0.84rem] text-[var(--text-dim)] leading-relaxed"
                  >
                    <span className="text-[var(--text)] font-semibold mr-2">•</span>
                    {outcome}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-dashed border-[rgba(94,106,210,0.34)] bg-[rgba(94,106,210,0.06)] px-4 py-3 text-[0.8rem] text-[var(--text-muted)] leading-relaxed">
              最小可落地方案：基于本地 state 切换当前成果卡，无需新增依赖；后续可继续叠加 hover 动效、案例弹窗、项目详情页或埋点统计。
            </div>
          </div>
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
