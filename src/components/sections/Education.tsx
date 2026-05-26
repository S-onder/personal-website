const edu = [
  { degree: '硕士', school: '上海对外经贸大学', major: '应用统计专业', period: '2023.09 — 2025.06' },
  { degree: '学士', school: '南京财经大学', major: '金融数学专业', period: '2018.09 — 2022.06' },
]

export default function Education() {
  return (
    <section id="education" className="max-w-[1100px] mx-auto px-[5%] pt-0 pb-[100px]">
      <div className="text-[0.78rem] font-semibold tracking-[0.18em] uppercase text-[var(--accent1)] mb-2">Education</div>
      <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-[var(--text)] mb-12 tracking-[-0.03em] leading-[1.1]">教育背景</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {edu.map(e => (
          <div key={e.school}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] p-[1.8rem]
              transition-all duration-200
              hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] hover:-translate-y-[3px] hover:shadow-[0_3px_30px_rgba(0,0,0,0.18)]"
          >
            <div className="text-[0.75rem] font-semibold text-[var(--accent1)] tracking-[0.1em] uppercase mb-2">{e.degree}</div>
            <div className="text-[1.15rem] font-bold text-[var(--text)] tracking-[-0.02em] mb-1">{e.school}</div>
            <div className="text-[0.9rem] text-[var(--text-dim)] mb-1">{e.major}</div>
            <div className="text-[0.8rem] text-[var(--text-muted)]">{e.period}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
