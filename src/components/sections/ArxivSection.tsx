'use client'
import { useState, useEffect, useRef } from 'react'

const TAG_CLASS: Record<string, string> = {
  'RL+Rec': 'bg-[rgba(124,58,237,0.8)] border-[rgba(124,58,237,0.5)]',
  'LLM+Rec': 'bg-[rgba(37,99,235,0.8)] border-[rgba(37,99,235,0.5)]',
  'Generative Rec': 'bg-[rgba(8,145,178,0.8)] border-[rgba(8,145,178,0.5)]',
  'Recall': 'bg-[rgba(5,150,105,0.8)] border-[rgba(5,150,105,0.5)]',
  'CTR Ads': 'bg-[rgba(234,88,12,0.8)] border-[rgba(234,88,12,0.5)]',
  'Sequential Rec': 'bg-[rgba(219,39,119,0.8)] border-[rgba(219,39,119,0.5)]',
  'AI Agent': 'bg-[rgba(202,138,4,0.8)] border-[rgba(202,138,4,0.5)]',
}

const papers = [
  {rank:1,title:'Reinforced Preference Optimization for Reasoning-Augmented Recommendations',subtitle:'Jingtong Gao et al.',tag:'RL+Rec',published:'2026-05-21',summary:'提出强化偏好优化方法，将LLM推理能力与推荐系统结合，增强用户意图推断和偏好建模。',value:'LLM+RL+Rec三者结合的前沿工作，解决推理型推荐的训练优化问题。可用于精排阶段引入LLM reasoning增强意图理解。',url:'https://arxiv.org/abs/2605.21967v1'},
  {rank:2,title:'LLM Retrieval for Stable and Predictable Ad Recommendations',subtitle:'Vinodh Kumar Sunkara et al.',tag:'LLM+Rec',published:'2026-05-21',summary:'针对广告推荐系统，提出基于LLM的检索方法，优化预测稳定性和可预测性。',value:'直接面向广告场景的LLM召回方案，关注系统鲁棒性而非单纯准确率，对广告算法有直接参考价值。',url:'https://arxiv.org/abs/2605.21969v1'},
  {rank:3,title:'Generative Conversational Recommender System',subtitle:'Sixiao Zhang et al.',tag:'Generative Rec',published:'2026-05-21',summary:'提出全生成式对话推荐系统，将推荐与对话生成统一在单一生成框架内。',value:'生成式推荐的典型范式，统一推荐和对话生成。对探索LLM原生推荐架构有参考意义。',url:'https://arxiv.org/abs/2605.21987v1'},
  {rank:4,title:'FLUID: From Ephemeral IDs to Multimodal Semantic Codes for Industrial-Scale Livestreaming Recommendation',subtitle:'Xinhang Yuan et al.',tag:'Recall',published:'2026-05-20',summary:'针对直播推荐冷启动问题，提出多模态语义编码替代传统ID embedding的工业级框架。',value:'工业级直播推荐方案，解决短生命周期item的冷启动难题，可迁移至短视频、电商直播等场景。',url:'https://arxiv.org/abs/2605.21832v1'},
  {rank:5,title:'PEARL: Unbiased Percentile Estimation via Contrastive Learning for Industrial-Scale Livestream Recommendation',subtitle:'Blake Gella et al.',tag:'CTR Ads',published:'2026-05-20',summary:'提出对比学习方法解决直播推荐中用户行为强度不均衡导致的偏差问题。',value:'工业级去偏方案，解决高活用户信号过度放大问题，对精排模型样本加权有直接指导意义。',url:'https://arxiv.org/abs/2605.21752v1'},
  {rank:6,title:'Behavior-Guided Candidate Calibration for Multimodal Recommendation',subtitle:'Zesheng Li et al.',tag:'Sequential Rec',published:'2026-05-21',summary:'通过频谱分析发现多模态信号与行为信号的交互规律，提出行为引导的候选校准方法。',value:'多模态特征与行为特征融合的新视角，可用于优化多模态精排中内容特征的使用方式。',url:'https://arxiv.org/abs/2605.22073v1'},
  {rank:7,title:'Divergence Meets Consensus: A Multi-Source Negative Sampling Framework for Sequential Recommendation',subtitle:'Yuanzi Li et al.',tag:'Sequential Rec',published:'2026-05-19',summary:'提出多源负采样框架，解决自引导硬负采样的局部最优和多样性不足问题。',value:'负采样是序列推荐训练的核心环节，本文方法可直接用于改进召回和精排模型的负样本构造策略。',url:'https://arxiv.org/abs/2605.19651v1'},
  {rank:8,title:'Robust Personalized Recommendation under Hidden Confounding in MNAR',subtitle:'Zongyu Li et al.',tag:'CTR Ads',published:'2026-05-20',summary:'针对隐藏混杂因子场景，提出不依赖RCT数据的鲁棒推荐方法。',value:'因果推荐的实用方案，对广告场景的选择偏差纠正和效果归因有参考价值。',url:'https://arxiv.org/abs/2605.21066v1'},
  {rank:9,title:'Robust Recommendation from Noisy Implicit Feedback: A GMM-Weighted Bayes-label Transition Matrix Framework',subtitle:'Zongyu Li et al.',tag:'CTR Ads',published:'2026-05-20',summary:'提出GMM加权的贝叶斯标签转移矩阵方法，解决隐式反馈噪声问题同时保持数据利用率。',value:'噪声标签学习的实用框架，可用于改进CTR模型在噪声点击数据上的训练鲁棒性。',url:'https://arxiv.org/abs/2605.20721v1'},
  {rank:10,title:'Spreadsheet-RL: Advancing Large Language Model Agents on Realistic Spreadsheet Tasks via Reinforcement Learning',subtitle:'Banghao Chi et al.',tag:'AI Agent',published:'2026-05-21',summary:'提出基于强化学习的LLM Agent方法，解决复杂电子表格任务自动化问题。',value:'RL+LLM Agent的落地案例，展示如何用RL提升Agent在复杂工具使用场景的能力。',url:'https://arxiv.org/abs/2605.22642v1'},
]

const FILTERS = ['全部','RL+Rec','LLM+Rec','Generative Rec','Recall','CTR Ads','Sequential Rec','AI Agent']

export default function ArxivSection() {
  const [activeFilter, setActiveFilter] = useState('全部')
  const [covered, setCovered] = useState(true)
  const coverRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  // WebGL shader cover
  useEffect(() => {
    const canvas = canvasRef.current
    const cover = coverRef.current
    if (!canvas || !cover) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const vert = 'attribute vec2 a_pos; void main(){ gl_Position=vec4(a_pos,0,1); }'
    const frag = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      void main(void){
        vec2 uv=(gl_FragCoord.xy*2.0-resolution.xy)/min(resolution.x,resolution.y);
        float t=time*0.05;
        float lineWidth=0.002;
        vec3 color=vec3(0.0);
        for(int j=0;j<3;j++){
          for(int i=0;i<5;i++){
            color[j]+=lineWidth*float(i*i)/abs(fract(t-0.01*float(j)+float(i)*0.01)*5.0-length(uv)+mod(uv.x+uv.y,0.2));
          }
        }
        gl_FragColor=vec4(color[0],color[1],color[2],1.0);
      }
    `
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s); return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'resolution')
    const uTime = gl.getUniformLocation(prog, 'time')
    let t = 0

    const resize = () => {
      canvas.width = cover.clientWidth * devicePixelRatio
      canvas.height = cover.clientHeight * devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      t += 0.05
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current) }
  }, [])

  const handleCoverClick = () => {
    const cover = coverRef.current
    if (!cover || !covered) return
    cover.classList.add('exiting')
    cover.style.pointerEvents = 'none'
    setTimeout(() => { setCovered(false); cancelAnimationFrame(rafRef.current) }, 800)
  }

  const filtered = activeFilter === '全部' ? papers : papers.filter(p => p.tag === activeFilter)

  return (
    <section id="arxiv" className="relative" style={{ padding: 0 }}>
      {/* Cover */}
      {covered && (
        <div
          ref={coverRef}
          onClick={handleCoverClick}
          className="relative w-full h-screen cursor-pointer overflow-hidden flex items-center justify-center"
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="relative z-10 text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[0.04em]
            bg-clip-text text-transparent pointer-events-none text-center"
            style={{ background: 'var(--accent1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            arXiv 精选日报
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`transition-all duration-700 ${covered ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-[1100px] mx-auto px-[5%] py-[100px]">
          <div className="mb-8">
            <div className="text-[0.78rem] font-semibold tracking-[0.18em] uppercase text-[var(--accent1)] mb-2">Daily Papers</div>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-[var(--text)] mb-1 tracking-[-0.03em] leading-[1.1]">arXiv 精选日报</h2>
            <div className="text-[0.85rem] text-[var(--text-muted)]">2026-05-24 · 推荐系统 &amp; AI 前沿 · TOP 10</div>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-[0.9rem] py-[0.35rem] rounded-full border text-[0.8rem] font-medium cursor-pointer transition-all duration-200 font-inherit
                  ${activeFilter === f
                    ? 'bg-[rgba(94,106,210,0.12)] border-[var(--accent1)] text-[var(--text)]'
                    : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent1)] hover:text-[var(--text)]'
                  }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Papers */}
          <div className="grid grid-cols-1 gap-5">
            {filtered.map((p, i) => (
              <PaperCard key={p.rank} paper={p} index={i} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .exiting { animation: cover-exit 0.8s cubic-bezier(0.4,0,0.2,1) forwards; }
        @keyframes cover-exit {
          0%   { opacity:1; transform:scale(1); }
          60%  { opacity:0.6; transform:scale(1.04); filter:blur(0); }
          100% { opacity:0; transform:scale(1.08); filter:blur(12px); pointer-events:none; }
        }
      `}</style>
    </section>
  )
}

function PaperCard({ paper: p, index }: { paper: typeof papers[0]; index: number }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 })

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    let rafId: number
    const onMove = (e: MouseEvent) => {
      const r = inner.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2)
      const dist = Math.hypot(dx, dy)
      const falloff = dist <= 1 ? 1 : Math.max(0, 1 - (dist - 1) / 2)
      stateRef.current.tx = Math.max(-1, Math.min(1, dy)) * 14 * falloff
      stateRef.current.ty = -Math.max(-1, Math.min(1, dx)) * 30 * falloff
    }
    const onLeave = () => { stateRef.current.tx = 0; stateRef.current.ty = 0 }
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    const tick = () => {
      const s = stateRef.current
      s.rx += (s.tx - s.rx) * 0.12
      s.ry += (s.ty - s.ry) * 0.12
      if (inner) {
        inner.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`
      }
      rafId = requestAnimationFrame(tick)
    }
    tick()
    return () => { window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); cancelAnimationFrame(rafId) }
  }, [])

  const tagCls = TAG_CLASS[p.tag] || TAG_CLASS['LLM+Rec']

  return (
    <div className="perspective-[1200px]" style={{ animationDelay: `${index * 80}ms`, animation: 'perspective-blur-in 0.6s ease both' }}>
      <div ref={innerRef}
        className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] p-6 flex flex-col
          transition-[border-color,box-shadow] duration-300 [transform-style:preserve-3d] will-change-transform
          hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] hover:shadow-[0_3px_30px_rgba(0,0,0,0.2)] group"
      >
        <div className="absolute top-0 left-0 w-[3px] h-full bg-[var(--accent1)] rounded-l-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="flex justify-between items-start mb-3">
          <div className="text-[2rem] font-extrabold text-[var(--text)] leading-none">#{p.rank}</div>
          <span className={`px-[0.7rem] py-[0.2rem] rounded-full text-[0.72rem] font-semibold text-white border ${tagCls}`}>{p.tag}</span>
        </div>
        <div className="text-[0.95rem] font-semibold text-[var(--text)] tracking-[-0.01em] leading-[1.5] mb-1">{p.title}</div>
        <div className="text-[0.78rem] text-[var(--text-muted)] mb-3">{p.subtitle} · {p.published}</div>
        <div className="text-[0.85rem] text-[var(--text-dim)] leading-[1.65] mb-3 flex-1">{p.summary}</div>
        <div className="text-[0.83rem] text-[#c7cff8] leading-relaxed px-[0.9rem] py-[0.7rem]
          bg-white/[0.03] rounded-lg border-l-2 border-[rgba(94,106,210,0.58)] mb-4">
          💡 {p.value}
        </div>
        <a href={p.url} target="_blank" rel="noopener"
          className="inline-flex items-center gap-1.5 text-[var(--accent1)] text-[0.82rem] font-medium no-underline transition-all duration-200 mt-auto hover:gap-2.5 hover:text-[var(--text)]">
          阅读原文 →
        </a>
      </div>
      <style>{`
        @keyframes perspective-blur-in {
          from { opacity:0; filter:blur(10px); transform:translateY(6px); }
          to   { opacity:1; filter:blur(0);    transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}
