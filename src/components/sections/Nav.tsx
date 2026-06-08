'use client'

import Link from 'next/link'
import { gsap } from 'gsap'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

type StaggeredMenuItem = {
  label: string
  ariaLabel: string
  link: string
}

type StaggeredMenuSocialItem = {
  label: string
  link: string
}

type StaggeredMenuProps = {
  position?: 'left' | 'right'
  colors?: string[]
  items?: StaggeredMenuItem[]
  socialItems?: StaggeredMenuSocialItem[]
  displaySocials?: boolean
  displayItemNumbering?: boolean
  className?: string
  logoUrl?: string
  menuButtonColor?: string
  openMenuButtonColor?: string
  accentColor?: string
  isFixed?: boolean
  changeMenuColorOnOpen?: boolean
  closeOnClickAway?: boolean
  onMenuOpen?: () => void
  onMenuClose?: () => void
}

const navItems: StaggeredMenuItem[] = [
  { label: '关于', ariaLabel: '跳转到关于部分', link: '#about' },
  { label: '经历', ariaLabel: '跳转到经历部分', link: '#experience' },
  { label: 'arXiv 日报', ariaLabel: '跳转到 arXiv 日报部分', link: '#arxiv' },
]

const socialItems: StaggeredMenuSocialItem[] = []

function StaggeredMenu({
  position = 'right',
  colors = ['#B497CF', '#5227FF'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = '/sjl.jpg',
  menuButtonColor = '#ffffff',
  openMenuButtonColor = '#120F17',
  changeMenuColorOnOpen = true,
  accentColor = '#5227FF',
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}: StaggeredMenuProps) {
  const [open, setOpen] = useState(false)
  const [textLines, setTextLines] = useState<string[]>(['Menu', 'Close'])
  const openRef = useRef(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const preLayersRef = useRef<HTMLDivElement | null>(null)
  const preLayerElsRef = useRef<HTMLElement[]>([])
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null)

  const plusHRef = useRef<HTMLSpanElement | null>(null)
  const plusVRef = useRef<HTMLSpanElement | null>(null)
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const textInnerRef = useRef<HTMLSpanElement | null>(null)

  const openTlRef = useRef<gsap.core.Timeline | null>(null)
  const closeTweenRef = useRef<gsap.core.Tween | null>(null)
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null)
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null)
  const colorTweenRef = useRef<gsap.core.Tween | null>(null)
  const busyRef = useRef(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current
      const preContainer = preLayersRef.current
      const plusH = plusHRef.current
      const plusV = plusVRef.current
      const icon = iconRef.current
      const textInner = textInnerRef.current

      if (!panel || !plusH || !plusV || !icon || !textInner) return

      const preLayers = preContainer
        ? (Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[])
        : []

      preLayerElsRef.current = preLayers

      const offscreen = position === 'left' ? -100 : 100
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 })
      if (preContainer) gsap.set(preContainer, { xPercent: 0, opacity: 1 })

      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 })
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 })
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
      gsap.set(textInner, { yPercent: 0 })

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor })
    }, rootRef)

    return () => ctx.revert()
  }, [menuButtonColor, position])

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    closeTweenRef.current?.kill()

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[]
    const numberEls = Array.from(
      panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
    ) as HTMLElement[]
    const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[]

    const offscreen = position === 'left' ? -100 : 100

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 })
    if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as const]: 0 })
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 })
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 })

    const tl = gsap.timeline({ paused: true })

    layers.forEach((layer, index) => {
      tl.fromTo(
        layer,
        { xPercent: offscreen },
        { xPercent: 0, duration: 0.5, ease: 'power4.out' },
        index * 0.07
      )
    })

    const lastTime = layers.length ? (layers.length - 1) * 0.07 : 0
    const panelInsertTime = lastTime + (layers.length ? 0.08 : 0)
    const panelDuration = 0.65

    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    )

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' },
        },
        itemsStart
      )

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            ['--sm-num-opacity' as const]: 1,
            stagger: { each: 0.08, from: 'start' },
          },
          itemsStart + 0.1
        )
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4
      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart)
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
          },
          socialsStart + 0.04
        )
      }
    }

    openTlRef.current = tl
    return tl
  }, [position])

  const playOpen = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true
    const tl = buildOpenTimeline()
    if (!tl) {
      busyRef.current = false
      return
    }

    tl.eventCallback('onComplete', () => {
      busyRef.current = false
    })
    tl.play(0)
  }, [buildOpenTimeline])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    openTlRef.current = null

    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return

    closeTweenRef.current?.kill()

    const offscreen = position === 'left' ? -100 : 100
    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[]
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 })

        const numberEls = Array.from(
          panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
        ) as HTMLElement[]
        if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as const]: 0 })

        const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[]
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 })
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 })

        busyRef.current = false
      },
    })
  }, [position])

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current
    const h = plusHRef.current
    const v = plusVRef.current
    if (!icon || !h || !v) return

    spinTweenRef.current?.kill()

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0)
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0)
    }
  }, [])

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current
      if (!btn) return
      colorTweenRef.current?.kill()

      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: 'power2.out',
        })
      } else {
        gsap.set(btn, { color: menuButtonColor })
      }
    },
    [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]
  )

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current
    if (!inner) return

    textCycleAnimRef.current?.kill()

    const currentLabel = opening ? 'Menu' : 'Close'
    const targetLabel = opening ? 'Close' : 'Menu'
    const cycles = 3
    const sequence = [currentLabel]
    let last = currentLabel

    for (let index = 0; index < cycles; index += 1) {
      last = last === 'Menu' ? 'Close' : 'Menu'
      sequence.push(last)
    }

    if (last !== targetLabel) sequence.push(targetLabel)
    sequence.push(targetLabel)

    setTextLines(sequence)
    gsap.set(inner, { yPercent: 0 })

    const finalShift = ((sequence.length - 1) / sequence.length) * 100
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + sequence.length * 0.07,
      ease: 'power4.out',
    })
  }, [])

  const closeMenu = useCallback(() => {
    if (!openRef.current) return

    openRef.current = false
    setOpen(false)
    onMenuClose?.()
    playClose()
    animateIcon(false)
    animateColor(false)
    animateText(false)
  }, [animateColor, animateIcon, animateText, onMenuClose, playClose])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)

    if (target) {
      onMenuOpen?.()
      playOpen()
    } else {
      onMenuClose?.()
      playClose()
    }

    animateIcon(target)
    animateColor(target)
    animateText(target)
  }, [animateColor, animateIcon, animateText, onMenuClose, onMenuOpen, playClose, playOpen])

  useEffect(() => {
    if (!toggleBtnRef.current) return

    if (changeMenuColorOnOpen) {
      gsap.set(toggleBtnRef.current, {
        color: openRef.current ? openMenuButtonColor : menuButtonColor,
      })
    } else {
      gsap.set(toggleBtnRef.current, { color: menuButtonColor })
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor])

  useEffect(() => {
    if (!closeOnClickAway || !open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeMenu, closeOnClickAway, open])

  const panelClasses = useMemo(
    () =>
      position === 'left'
        ? 'staggered-menu-panel absolute top-0 left-0 h-full bg-white flex flex-col p-[6em_2em_2em_2em] overflow-y-auto z-10 backdrop-blur-[12px] pointer-events-auto'
        : 'staggered-menu-panel absolute top-0 right-0 h-full bg-white flex flex-col p-[6em_2em_2em_2em] overflow-y-auto z-10 backdrop-blur-[12px] pointer-events-auto',
    [position]
  )

  return (
    <div
      ref={rootRef}
      className={`sm-scope z-[1000] ${isFixed ? 'fixed inset-0 overflow-hidden' : 'w-full h-full'} ${className ?? ''}`}
    >
      <div
        className="staggered-menu-wrapper pointer-events-none relative w-full h-full z-40"
        style={accentColor ? ({ ['--sm-accent' as const]: accentColor } as React.CSSProperties) : undefined}
        data-position={position}
        data-open={open || undefined}
      >
        <div
          ref={preLayersRef}
          className={`sm-prelayers absolute top-0 bottom-0 pointer-events-none z-[5] ${position === 'left' ? 'left-0' : 'right-0'}`}
          aria-hidden="true"
        >
          {(() => {
            const raw = colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c']
            const rendered = [...raw]
            if (rendered.length >= 3) rendered.splice(Math.floor(rendered.length / 2), 1)

            return rendered.map((color, index) => (
              <div
                key={`${color}-${index}`}
                className={`sm-prelayer absolute top-0 h-full w-full translate-x-0 ${position === 'left' ? 'left-0' : 'right-0'}`}
                style={{ background: color }}
              />
            ))
          })()}
        </div>

        <header
          className="staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-between px-4 py-4 md:px-6 bg-transparent pointer-events-none z-20"
          aria-label="Main navigation header"
        >
          <Link href="#top" className="sm-logo flex items-center select-none pointer-events-auto" aria-label="返回顶部">
            <img
              src={logoUrl}
              alt="SJL"
              className="sm-logo-img block h-10 w-10 rounded-full object-cover shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
              draggable={false}
              width={40}
              height={40}
            />
          </Link>

          <button
            ref={toggleBtnRef}
            className="sm-toggle relative inline-flex items-center gap-[0.3rem] bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible pointer-events-auto"
            aria-label={open ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span
              className="sm-toggle-textWrap relative inline-block h-[1em] overflow-hidden whitespace-nowrap"
              aria-hidden="true"
            >
              <span ref={textInnerRef} className="sm-toggle-textInner flex flex-col leading-none">
                {textLines.map((line, index) => (
                  <span className="sm-toggle-line block h-[1em] leading-none" key={`${line}-${index}`}>
                    {line}
                  </span>
                ))}
              </span>
            </span>

            <span
              ref={iconRef}
              className="sm-icon relative w-[14px] h-[14px] shrink-0 inline-flex items-center justify-center [will-change:transform]"
              aria-hidden="true"
            >
              <span
                ref={plusHRef}
                className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
              />
              <span
                ref={plusVRef}
                className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
              />
            </span>
          </button>
        </header>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className={panelClasses}
          style={{ WebkitBackdropFilter: 'blur(12px)' }}
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-5">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {items.length ? (
                items.map((item, index) => (
                  <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={`${item.link}-${index}`}>
                    {item.link.startsWith('#') ? (
                      <a
                        className="sm-panel-item relative text-black font-semibold text-[clamp(2.5rem,8vw,4rem)] cursor-pointer leading-none tracking-[-2px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em]"
                        href={item.link}
                        aria-label={item.ariaLabel}
                        data-index={index + 1}
                        onClick={closeMenu}
                      >
                        <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                          {item.label}
                        </span>
                      </a>
                    ) : (
                      <Link
                        className="sm-panel-item relative text-black font-semibold text-[clamp(2.5rem,8vw,4rem)] cursor-pointer leading-none tracking-[-2px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em]"
                        href={item.link}
                        aria-label={item.ariaLabel}
                        data-index={index + 1}
                        onClick={closeMenu}
                      >
                        <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                          {item.label}
                        </span>
                      </Link>
                    )}
                  </li>
                ))
              ) : (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                  <span className="sm-panel-item relative text-black font-semibold text-[4rem] leading-none tracking-[-2px] uppercase inline-block no-underline pr-[1.4em]">
                    <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>

            {displaySocials && socialItems.length > 0 && (
              <div className="sm-socials mt-auto pt-8 flex flex-col gap-3" aria-label="Social links">
                <h3 className="sm-socials-title m-0 text-base font-medium [color:var(--sm-accent,#ff0000)]">Socials</h3>
                <ul className="sm-socials-list list-none m-0 p-0 flex flex-row items-center gap-4 flex-wrap" role="list">
                  {socialItems.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="sm-socials-item">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-socials-link text-[1.2rem] font-medium text-[#111] no-underline relative inline-block py-[2px] transition-[color,opacity] duration-300 ease-linear"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        .sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
        .sm-scope .sm-logo { display: flex; align-items: center; user-select: none; }
        .sm-scope .sm-toggle { color: #e9e9ef; }
        .sm-scope .sm-toggle:focus-visible { outline: 2px solid rgba(255,255,255,0.7); outline-offset: 4px; border-radius: 4px; }
        .sm-scope .sm-toggle-textWrap { margin-right: 0.5em; }
        .sm-scope .staggered-menu-panel { width: clamp(280px, 38vw, 420px); }
        .sm-scope .sm-prelayers { width: clamp(280px, 38vw, 420px); }
        .sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
        .sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after {
          counter-increment: smItem;
          content: counter(smItem, decimal-leading-zero);
          position: absolute;
          top: 0.1em;
          right: 3.2em;
          font-size: 18px;
          font-weight: 400;
          color: var(--sm-accent, #ff0000);
          letter-spacing: 0;
          pointer-events: none;
          user-select: none;
          opacity: var(--sm-num-opacity, 0);
        }
        .sm-scope .sm-socials-list .sm-socials-link { opacity: 1; transition: opacity 0.3s ease; }
        .sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) { opacity: 0.35; }
        .sm-scope .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible) { opacity: 0.35; }
        .sm-scope .sm-socials-list .sm-socials-link:hover,
        .sm-scope .sm-socials-list .sm-socials-link:focus-visible,
        .sm-scope .sm-panel-item:hover,
        .sm-scope .sm-panel-item:focus-visible { color: var(--sm-accent, #ff0000); }
        .sm-scope .sm-socials-link:focus-visible { outline: 2px solid var(--sm-accent, #ff0000); outline-offset: 3px; }
        @media (max-width: 1024px) {
          .sm-scope .staggered-menu-panel,
          .sm-scope .sm-prelayers {
            width: 100%;
            left: 0;
            right: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default function Nav() {
  const [activeHref, setActiveHref] = useState('#about')

  useEffect(() => {
    const sections = ['about', 'experience', 'arxiv']
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`)
        })
      },
      { threshold: 0.35, rootMargin: '-18% 0px -45% 0px' }
    )

    sections.forEach(id => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-[1000] h-0">
      <StaggeredMenu
        position="right"
        items={navItems.map(item => ({ ...item, ariaLabel: `${item.ariaLabel}${item.link === activeHref ? '，当前所在区块' : ''}` }))}
        socialItems={socialItems}
        displaySocials={false}
        displayItemNumbering
        menuButtonColor="#ffffff"
        openMenuButtonColor="#120F17"
        changeMenuColorOnOpen
        colors={['#d7cae7', '#8b5cf6']}
        logoUrl="/sjl.jpg"
        accentColor="#5227FF"
        isFixed={false}
        onMenuOpen={() => undefined}
        onMenuClose={() => undefined}
      />
    </div>
  )
}
