import { Link, Outlet, useRouterState } from "@tanstack/react-router"
import {
  ArrowRight,
  Check,
  FileText,
  Image as ImageIcon,
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

import { packSteps, type PackSlot, type SlotStatus } from "@/data"
import { ADSENSE_CLIENT } from "@/lib/ads"
import { pageMeta, SeoHead, type SeoMeta } from "@/seo"

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isPack = pathname.startsWith("/prepare")

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
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
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
              Compress files
            </Link>
            <Link to="/prepare" activeProps={{ "data-active": true }}>
              Prepare a pack
            </Link>
            <Link to="/guides" activeProps={{ "data-active": true }}>
              Guides
            </Link>
          </nav>

          <div className="header-privacy">
            <LockKeyhole size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Local processing</span>
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
              Compress files
            </Link>
            <Link
              to="/prepare"
              activeProps={{ "data-active": true }}
              onClick={() => setMenuOpen(false)}
            >
              Prepare a pack
            </Link>
            <Link
              to="/guides"
              activeProps={{ "data-active": true }}
              onClick={() => setMenuOpen(false)}
            >
              Read file guides
            </Link>
          </nav>
        ) : null}
      </header>

      {isPack ? <PackStepRail /> : null}
      <main id="main-content">
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
  return (
    <footer className="site-footer">
      <div className="shell-width footer-grid">
        <div>
          <span className="footer-name">FormPack</span>
          <p>Private file preparation for strict application forms.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/fix">Fix a rejection</Link>
          <Link to="/guides">Guides</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/limitations">Limitations</Link>
        </nav>
        <p className="footer-note">
          FormPack checks file rules. It cannot guarantee approval by a portal
          or authority.
        </p>
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
  return (
    <div className={compact ? "privacy-notice is-compact" : "privacy-notice"}>
      <ShieldCheck size={22} strokeWidth={1.6} aria-hidden="true" />
      <div>
        <strong>Files stay on this device</strong>
        <span>
          FormPack processes them in your browser and never uploads your
          documents.
        </span>
      </div>
    </div>
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
