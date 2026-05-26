'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const links = [
  { href: '#about', label: '关于' },
  { href: '#experience', label: '经历' },
  { href: '#arxiv', label: 'arXiv 日报' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = ['about', 'experience', 'arxiv']
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { threshold: 0.3 }
    )
    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[5%] border-b border-white/[0.08] transition-all duration-300
        ${scrolled
          ? 'h-[52px] bg-black/[0.84] backdrop-blur-xl shadow-[0_3px_30px_rgba(0,0,0,0.22)]'
          : 'h-[60px] bg-black/80 backdrop-blur-xl'
        }`}
    >
      <div className="text-[1.1rem] font-bold tracking-[0.02em] text-[var(--text)]">SJL</div>
      <ul className="flex gap-8 list-none">
        {links.map(l => (
          <li key={l.href}>
            <a
              href={l.href}
              className={`relative pb-[2px] text-[0.9rem] font-medium no-underline transition-colors duration-200
                after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:rounded-full
                after:bg-[var(--accent1)] after:transition-all after:duration-300
                ${active === l.href.slice(1)
                  ? 'text-[var(--text)] after:w-full'
                  : 'text-[var(--text-dim)] after:w-0 hover:text-[var(--text)] hover:after:w-full'
                }`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
