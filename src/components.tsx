import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import {
  ArrowRight,
  Check,
  FileText,
  Image as ImageIcon,
  Link2,
  LockKeyhole,
  Menu,
  PenLine,
  ShieldCheck,
  X,
} from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react"

import type {
  ArticleContent,
  ContentSection,
  Faq,
  SourceLink,
} from "@/content"
import { packSteps, type PackSlot, type SlotStatus } from "@/data"
import { LanguageSwitcher, useI18n } from "@/i18n"
import { ADSENSE_CLIENT } from "@/lib/ads"
import { pageMeta, SeoHead, type SeoMeta } from "@/seo"

const localizedRoutes = new Set([
  "/",
  "/photo-compressor",
  "/pdf-compressor",
  "/batch",
  "/file-checker",
])

export function AppShell() {
  const { t, locale } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const previousPath = useRef(pathname)
  const isPack = pathname.startsWith("/prepare")
  const contentLang =
    locale === "hi" && !localizedRoutes.has(pathname) ? "en" : undefined

  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const heading = document.querySelector<HTMLElement>("main h1")
        if (!heading) return
        heading.tabIndex = -1
        heading.focus({ preventScroll: true })
      })
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setMenuOpen(false)
      requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [menuOpen])

  return (
    <div className="site-shell" id="top">
      <a className="skip-link" href="#main-content">
        {t("skip")}
      </a>
      <header className="site-header">
        <div className="shell-width header-inner">
          <Link to="/" className="wordmark" aria-label="FormPack home">
            <span className="wordmark-mark" aria-hidden="true">
              FP
            </span>
            <span>FormPack</span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link to="/quick-tools" activeProps={{ "data-active": true }}>
              {t("nav.compress")}
            </Link>
            <Link to="/presets" activeProps={{ "data-active": true }}>
              {t("nav.presets")}
            </Link>
            <Link to="/prepare" activeProps={{ "data-active": true }}>
              {t("nav.prepare")}
            </Link>
            <Link to="/guides" activeProps={{ "data-active": true }}>
              {t("nav.guides")}
            </Link>
          </nav>

          <div className="header-actions">
            <LanguageSwitcher className="header-language" />
            <div className="header-privacy">
              <LockKeyhole size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>{t("nav.localProcessing")}</span>
            </div>
          </div>

          <button
            ref={menuButtonRef}
            className="menu-button"
            type="button"
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {menuOpen ? (
          <nav
            id="mobile-navigation"
            className="mobile-nav shell-width"
            aria-label="Mobile navigation"
          >
            <Link
              to="/quick-tools"
              activeProps={{ "data-active": true }}
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.compress")}
            </Link>
            <Link
              to="/presets"
              activeProps={{ "data-active": true }}
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.presets")}
            </Link>
            <Link
              to="/prepare"
              activeProps={{ "data-active": true }}
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.prepare")}
            </Link>
            <Link
              to="/guides"
              activeProps={{ "data-active": true }}
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.mobileGuides")}
            </Link>
            <LanguageSwitcher className="mobile-language" />
          </nav>
        ) : null}
      </header>

      {isPack ? <PackStepRail /> : null}
      <main id="main-content" lang={contentLang}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export function PackStepRail() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav className="step-nav" aria-label="Application pack progress">
      <ol className="shell-width step-list">
        {packSteps.map((step, index) => {
          const active =
            pathname === step.to ||
            (step.label === "Fix" && pathname.startsWith("/prepare/file/"))
          const label = (
            <>
              <span className="step-number">{index + 1}</span>
              <span>{step.label}</span>
            </>
          )
          return (
            <li key={step.label} className={active ? "is-active" : undefined}>
              {step.label === "Fix" ? (
                <Link to="/prepare/file/$slotId" params={{ slotId: "photo" }}>
                  {label}
                </Link>
              ) : (
                <Link to={step.to}>{label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <div className="shell-width footer-main">
        <div className="footer-brand">
          <span className="footer-name">FormPack</span>
          <p>{t("footer.tagline")}</p>
        </div>

        <nav className="footer-group" aria-label={t("footer.tools")}>
          <h2 className="footer-heading">{t("footer.tools")}</h2>
          <Link to="/fix">{t("footer.fix")}</Link>
          <Link to="/batch">{t("footer.batch")}</Link>
          <Link to="/file-checker">{t("footer.checker")}</Link>
          <Link to="/presets">{t("footer.presets")}</Link>
        </nav>

        <nav className="footer-group" aria-label={t("footer.learn")}>
          <h2 className="footer-heading">{t("footer.learn")}</h2>
          <Link to="/guides">{t("footer.guides")}</Link>
          <Link to="/about">{t("footer.about")}</Link>
          <Link to="/editorial">{t("footer.editorial")}</Link>
          <Link to="/contact">{t("footer.contact")}</Link>
        </nav>

        <nav className="footer-group" aria-label={t("footer.legal")}>
          <h2 className="footer-heading">{t("footer.legal")}</h2>
          <Link to="/privacy">{t("footer.privacy")}</Link>
          <Link to="/cookies">{t("footer.cookies")}</Link>
          <Link to="/terms">{t("footer.terms")}</Link>
          <Link to="/limitations">{t("footer.limitations")}</Link>
        </nav>
      </div>

      <div className="shell-width footer-bottom">
        <p className="footer-copy" dir="ltr">
          © {new Date().getFullYear()} FormPack
        </p>
        <p className="footer-note">{t("footer.note")}</p>
        <a className="footer-top" href="#top">
          {t("footer.backToTop")} ↑
        </a>
      </div>
    </footer>
  )
}

export function PageFrame({
  title,
  intro,
  aside,
  seo,
  children,
}: PropsWithChildren<{
  title: string
  intro: string
  aside?: ReactNode
  seo?: SeoMeta
}>) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const metadata = seo ?? pageMeta(pathname, title, intro)

  return (
    <>
      <SeoHead {...metadata} />
      <section className="page-frame shell-width">
        <div className="page-heading">
          <div>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
          {aside ? <div className="page-heading-aside">{aside}</div> : null}
        </div>
        {children}
      </section>
    </>
  )
}

export function ArticleBody({
  sections,
  faqs,
  sources,
}: {
  sections: ContentSection[]
  faqs?: Faq[]
  sources?: SourceLink[]
}) {
  const { t, locale } = useI18n()

  return (
    <>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets?.length ? (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
      {faqs?.length ? (
        <section>
          <h2 lang={locale === "hi" ? "hi" : undefined}>{t("article.faq")}</h2>
          {faqs.map((faq) => (
            <div className="faq-item" key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </section>
      ) : null}
      {sources?.length ? (
        <section className="sources-list">
          <h2 lang={locale === "hi" ? "hi" : undefined}>
            {t("article.sources")}
          </h2>
          <ul>
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noopener noreferrer" target="_blank">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}

export function ArticleBlock({
  content,
  className = "",
}: {
  content: ArticleContent
  className?: string
}) {
  const { locale } = useI18n()

  return (
    <article
      className={`guide-article ${className}`.trim()}
      lang={locale === "hi" ? "en" : undefined}
    >
      {content.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <ArticleBody
        sections={content.sections}
        faqs={content.faqs}
        sources={content.sources}
      />
    </article>
  )
}

export function ActionLink({
  to,
  children,
  secondary = false,
  disabled = false,
}: PropsWithChildren<{
  to: string
  secondary?: boolean
  disabled?: boolean
}>) {
  const className = secondary
    ? "action-link action-link-secondary"
    : "action-link"

  if (disabled) {
    return (
      <span className={className} aria-disabled="true">
        <span>{children}</span>
        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
      </span>
    )
  }

  return (
    <Link to={to} className={className}>
      <span>{children}</span>
      <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
    </Link>
  )
}

export function PrivacyNotice({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()

  return (
    <div className={compact ? "privacy-notice is-compact" : "privacy-notice"}>
      <ShieldCheck size={22} strokeWidth={1.6} aria-hidden="true" />
      <div>
        <strong>{t("privacy.title")}</strong>
        <span>{t("privacy.body")}</span>
      </div>
    </div>
  )
}

export function RuleLinkButton({
  href,
  label = "Copy rule link",
  className = "",
}: {
  href: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const shareOrCopy = async () => {
    const url = new URL(href, window.location.origin).toString()

    try {
      if (navigator.share) {
        await navigator.share({ title: "FormPack rule", url })
        return
      }
    } catch {
      // Fall through to clipboard when the share sheet is unavailable or cancelled.
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt("Copy this rule link", url)
    }
  }

  return (
    <button
      type="button"
      className={`rule-link-button ${className}`.trim()}
      onClick={() => void shareOrCopy()}
    >
      <Link2 size={15} strokeWidth={1.9} aria-hidden="true" />
      {copied ? "Link copied" : label}
    </button>
  )
}

export function StatusLabel({ status }: { status: SlotStatus }) {
  const labels: Record<SlotStatus, string> = {
    "not-started": "Not started",
    check: "Check this",
    ready: "Ready",
    "not-ready": "Not ready",
  }

  return (
    <span className="status-label" data-status={status}>
      <span className="status-dot" aria-hidden="true" />
      {labels[status]}
    </span>
  )
}

export function SlotIcon({ slot }: { slot: Pick<PackSlot, "kind"> }) {
  if (slot.kind === "signature") {
    return <PenLine size={20} strokeWidth={1.6} aria-hidden="true" />
  }
  if (slot.kind === "pdf") {
    return <FileText size={20} strokeWidth={1.6} aria-hidden="true" />
  }
  return <ImageIcon size={20} strokeWidth={1.6} aria-hidden="true" />
}

export function CheckLine({
  ready,
  children,
}: PropsWithChildren<{ ready: boolean }>) {
  return (
    <li className="check-line" data-ready={ready}>
      <span className="check-line-icon" aria-hidden="true">
        {ready ? <Check size={14} strokeWidth={2.5} /> : <span />}
      </span>
      {children}
    </li>
  )
}

export function AdSlot({
  slot,
  className = "",
}: {
  slot: string
  className?: string
}) {
  useEffect(() => {
    if (!slot) return
    try {
      const adsWindow = window as unknown as { adsbygoogle?: unknown[] }
      adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? []
      adsWindow.adsbygoogle.push({})
    } catch {
      // AdSense is unavailable (blocked, offline, or not yet configured).
    }
  }, [slot])

  if (!slot) return null

  return (
    <div className={`min-h-[6.5rem] ${className}`.trim()} aria-label="Advertisement">
      <span className="mb-1 block text-[.68rem] uppercase tracking-[.04em] text-[var(--quiet)] [font-family:var(--font-mono)]">
        Advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
