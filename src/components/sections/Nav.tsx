'use client'

import Link from 'next/link'
import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'

type PillNavItem = {
  label: string
  href: string
  ariaLabel?: string
}

const links: PillNavItem[] = [
  { href: '#about', label: '关于', ariaLabel: '跳转到关于部分' },
  { href: '#experience', label: '经历', ariaLabel: '跳转到经历部分' },
  { href: '#arxiv', label: 'arXiv 日报', ariaLabel: '跳转到 arXiv 日报部分' },
]

const isExternalLike = (href: string) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('//') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:')

function NavLink({
  item,
  className,
  style,
  children,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  item: PillNavItem
  className: string
  style?: React.CSSProperties
  children: React.ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onClick?: () => void
}) {
  const commonProps = {
    className,
    style,
    'aria-label': item.ariaLabel || item.label,
    onMouseEnter,
    onMouseLeave,
    onClick,
  }

  if (item.href.startsWith('#')) {
    return (
      <a href={item.href} {...commonProps}>
        {children}
      </a>
    )
  }

  if (isExternalLike(item.href)) {
    return (
      <a href={item.href} {...commonProps}>
        {children}
      </a>
    )
  }

  return (
    <Link href={item.href} {...commonProps}>
      {children}
    </Link>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('about')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([])
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([])
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([])
  const logoRef = useRef<HTMLAnchorElement | HTMLDivElement | null>(null)
  const logoTextRef = useRef<HTMLSpanElement | null>(null)
  const logoTweenRef = useRef<gsap.core.Tween | null>(null)
  const hamburgerRef = useRef<HTMLButtonElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const navItemsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = ['about', 'experience', 'arxiv']
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && setActive(entry.target.id)),
      { threshold: 0.35, rootMargin: '-18% 0px -45% 0px' }
    )

    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return

        const pill = circle.parentElement as HTMLElement
        const rect = pill.getBoundingClientRect()
        const { width: w, height: h } = rect
        const R = ((w * w) / 4 + h * h) / (2 * h)
        const D = Math.ceil(2 * R) + 2
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        })

        const label = pill.querySelector<HTMLElement>('.pill-label')
        const hoverLabel = pill.querySelector<HTMLElement>('.pill-label-hover')

        if (label) gsap.set(label, { y: 0 })
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 })

        const index = circleRefs.current.indexOf(circle)
        if (index === -1) return

        tlRefs.current[index]?.kill()
        const tl = gsap.timeline({ paused: true })

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: 'power3.out', overwrite: 'auto' }, 0)

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease: 'power3.out', overwrite: 'auto' }, 0)
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 })
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease: 'power3.out', overwrite: 'auto' }, 0)
        }

        tlRefs.current[index] = tl
      })
    }

    layout()
    window.addEventListener('resize', layout)
    document.fonts?.ready.then(layout).catch(() => {})

    const menu = mobileMenuRef.current
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, y: 10 })
    }

    const logo = logoRef.current
    const navItems = navItemsRef.current

    if (logo) {
      gsap.set(logo, { scale: 0.86, opacity: 0 })
      gsap.to(logo, { scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out' })
    }

    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: 'hidden', opacity: 0 })
      gsap.to(navItems, { width: 'auto', opacity: 1, duration: 0.6, ease: 'power3.out' })
    }

    return () => window.removeEventListener('resize', layout)
  }, [])

  const handleEnter = (index: number) => {
    const tl = tlRefs.current[index]
    if (!tl) return
    activeTweenRefs.current[index]?.kill()
    activeTweenRefs.current[index] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const handleLeave = (index: number) => {
    const tl = tlRefs.current[index]
    if (!tl) return
    activeTweenRefs.current[index]?.kill()
    activeTweenRefs.current[index] = tl.tweenTo(0, {
      duration: 0.2,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const handleLogoEnter = () => {
    const logoText = logoTextRef.current
    if (!logoText) return
    logoTweenRef.current?.kill()
    gsap.set(logoText, { rotate: 0 })
    logoTweenRef.current = gsap.to(logoText, {
      rotate: 360,
      duration: 0.22,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen
    setIsMobileMenuOpen(newState)

    const hamburger = hamburgerRef.current
    const menu = mobileMenuRef.current

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line')
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: 'power3.out' })
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: 'power3.out' })
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: 'power3.out' })
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: 'power3.out' })
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' })
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
        )
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease: 'power3.out',
          onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
        })
      }
    }
  }

  const cssVars = {
    ['--base' as const]: '#f7f8f8',
    ['--pill-bg' as const]: 'rgba(10, 12, 16, 0.94)',
    ['--hover-text' as const]: '#090b10',
    ['--pill-text' as const]: '#f7f8f8',
    ['--nav-h' as const]: scrolled ? '42px' : '46px',
    ['--pill-pad-x' as const]: '18px',
    ['--pill-gap' as const]: '3px',
  } satisfies React.CSSProperties

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-[5%] pt-4 pointer-events-none">
      <nav
        className={`ml-auto w-full md:w-max flex items-center justify-end gap-2 transition-all duration-300 pointer-events-auto ${
          scrolled ? 'translate-y-0' : 'translate-y-0'
        }`}
        aria-label="Primary"
        style={cssVars}
      >
        <Link
          href="#top"
          aria-label="返回顶部"
          onMouseEnter={handleLogoEnter}
          ref={el => {
            logoRef.current = el
          }}
          className="rounded-full inline-flex items-center justify-center overflow-hidden border border-white/[0.1] bg-black/[0.78] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
          style={{ width: 'var(--nav-h)', height: 'var(--nav-h)' }}
        >
          <span
            ref={logoTextRef}
            className="inline-flex items-center justify-center text-[0.92rem] font-bold tracking-[0.04em] text-[var(--base)]"
          >
            SJL
          </span>
        </Link>

        <div
          ref={navItemsRef}
          className="relative items-center rounded-full hidden md:flex border border-white/[0.08] bg-black/[0.78] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
          style={{ height: 'var(--nav-h)' }}
        >
          <ul role="menubar" className="list-none flex items-stretch m-0 p-[3px] h-full" style={{ gap: 'var(--pill-gap)' }}>
            {links.map((item, index) => {
              const isActive = active === item.href.slice(1)
              const pillStyle: React.CSSProperties = {
                background: 'var(--pill-bg)',
                color: 'var(--pill-text)',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)',
              }

              const pillContent = (
                <>
                  <span
                    className="absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                    style={{ background: 'var(--base)', willChange: 'transform' }}
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[index] = el
                    }}
                  />
                  <span className="relative inline-block leading-[1] z-[2]">
                    <span className="pill-label relative z-[2] inline-block leading-[1]" style={{ willChange: 'transform' }}>
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                      style={{ color: 'var(--hover-text)', willChange: 'transform, opacity' }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-2.5 h-2.5 rounded-full z-[4]"
                      style={{ background: 'var(--base)' }}
                      aria-hidden="true"
                    />
                  )}
                </>
              )

              return (
                <li key={item.href} role="none" className="flex h-full">
                  <NavLink
                    item={item}
                    className="relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[14px] leading-[1] whitespace-nowrap cursor-pointer"
                    style={pillStyle}
                    onMouseEnter={() => handleEnter(index)}
                    onMouseLeave={() => handleLeave(index)}
                  >
                    {pillContent}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>

        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border border-white/[0.1] bg-black/[0.78] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.22)] flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative pointer-events-auto"
          style={{ width: 'var(--nav-h)', height: 'var(--nav-h)' }}
        >
          <span className="hamburger-line w-4 h-0.5 rounded origin-center" style={{ background: 'var(--base)' }} />
          <span className="hamburger-line w-4 h-0.5 rounded origin-center" style={{ background: 'var(--base)' }} />
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        className="md:hidden mt-2 ml-auto w-[min(280px,90vw)] rounded-[27px] border border-white/[0.08] bg-black/[0.9] backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.28)] pointer-events-auto"
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {links.map(item => (
            <li key={item.href}>
              <NavLink
                item={item}
                className="block py-3 px-4 text-[15px] font-medium rounded-[50px] transition-all duration-200"
                style={{
                  background: active === item.href.slice(1) ? 'var(--base)' : 'var(--pill-bg)',
                  color: active === item.href.slice(1) ? 'var(--hover-text)' : 'var(--pill-text)',
                }}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  gsap.set(mobileMenuRef.current, { visibility: 'hidden', opacity: 0, y: 10 })
                }}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
