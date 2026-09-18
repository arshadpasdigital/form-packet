import fs from "node:fs"
import path from "node:path"

type GuideSnapshot = {
  slug: string
  title: string
  seoTitle: string
  description: string
  summary: string
  audience: string
  checks: string[]
  steps: string[]
  mistakes: string[]
}

type StaticPage = {
  pathName: string
  title: string
  description: string
  body: string
  robots?: "index,follow" | "noindex,follow"
  jsonLd?: Record<string, unknown>
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function readString(block: string, key: string) {
  const match = block.match(new RegExp(`${key}:\\s*(?:\\n\\s*)?"([^"]+)"`))
  return match?.[1] ?? ""
}

function readList(block: string, key: string) {
  const match = block.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\n\\s*\\]`))
  return [...(match?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((item) => item[1])
}

function readGuides(root: string) {
  const source = fs.readFileSync(path.join(root, "src/seo-data.ts"), "utf8")
  const slugMatches = [...source.matchAll(/    slug: "([^"]+)"/g)]
  return slugMatches.map((match, position) => {
    const index = match.index ?? 0
    const nextIndex = slugMatches[position + 1]?.index ?? source.length
    const block = source.slice(index, nextIndex)
    return {
      slug: readString(block, "slug"),
      title: readString(block, "title"),
      seoTitle: readString(block, "seoTitle"),
      description: readString(block, "description"),
      summary: readString(block, "summary"),
      audience: readString(block, "audience"),
      checks: readList(block, "checks"),
      steps: readList(block, "steps"),
      mistakes: readList(block, "mistakes"),
    } satisfies GuideSnapshot
  })
}

function replaceMeta(html: string, selector: RegExp, replacement: string) {
  return html.replace(selector, replacement)
}

function pageHtml(
  baseHtml: string,
  siteUrl: string,
  pathName: string,
  title: string,
  description: string,
  body: string,
  jsonLd: Record<string, unknown> | undefined,
  robots: "index,follow" | "noindex,follow"
) {
  const canonical = `${siteUrl}${pathName === "/" ? "/" : pathName}`
  let html = baseHtml
  html = replaceMeta(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(title)}</title>`
  )
  html = replaceMeta(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`
  )
  html = replaceMeta(
    html,
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/,
    `<meta name="robots" content="${robots}" />`
  )
  html = replaceMeta(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${canonical}" />`
  )
  html = replaceMeta(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${canonical}" />`
  )
  html = replaceMeta(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  )
  html = replaceMeta(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  )
  html = replaceMeta(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  )
  html = replaceMeta(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  )
  if (jsonLd) {
    html = html.replace(
      "</head>",
      `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`
    )
  }
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  return html
}

function guideBody(guide: GuideSnapshot) {
  const list = (items: string[]) =>
    `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
  return `<main id="main-content" class="page-frame shell-width"><article class="guide-article"><div class="guide-article-meta"><span>${escapeHtml(guide.audience)}</span><span>Updated for a local-first workflow</span></div><h1>${escapeHtml(guide.title)}</h1><p>${escapeHtml(guide.summary)}</p><section><h2>Checks to record</h2>${list(guide.checks)}</section><section><h2>A safe preparation sequence</h2>${list(guide.steps)}</section><section><h2>Common avoidable mistakes</h2>${list(guide.mistakes)}</section><p><a href="/prepare">Prepare an application pack</a> · <a href="/guides">Browse all guides</a></p></article></main>`
}

function toolBody(title: string, description: string) {
  return `<main id="main-content" class="page-frame shell-width"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p><a href="/">Return to FormPack</a> · <a href="/quick-tools">More quick tools</a></p></main>`
}

function infoBody(title: string, description: string) {
  return `<main id="main-content" class="page-frame shell-width"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p><a href="/">Return to FormPack</a></p></main>`
}

export function generateStaticSeoPages(root = process.cwd()) {
  const outDir = path.join(root, "dist")
  const baseHtml = fs.readFileSync(path.join(outDir, "index.html"), "utf8")
  const siteUrl = (process.env.VITE_SITE_URL ?? "https://formpack.app").replace(
    /\/$/,
    ""
  )
  const guides = readGuides(root)

  const guideIndexBody = `<main id="main-content" class="page-frame shell-width"><h1>Application file checklists and guides</h1><p>Plain-language checklists for turning an official upload rule into measurable checks and a final human review.</p><nav aria-label="File guides"><ul>${guides.map((guide) => `<li><a href="/guides/${guide.slug}">${escapeHtml(guide.title)}</a></li>`).join("")}</ul></nav></main>`
  const guideIndexSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Application file checklists and guides",
    url: `${siteUrl}/guides`,
  }
  const utilityPaths = [
    "/prepare",
    "/prepare/requirements",
    "/prepare/files",
    "/prepare/file/photo",
    "/prepare/file/signature",
    "/prepare/file/certificate",
    "/prepare/check",
    "/prepare/download",
    "/fix",
    "/fix/requirements",
    "/fix/file",
    "/fix/result",
    "/quick-tools",
    "/quick-tools/image-size",
    "/quick-tools/image-dimensions",
    "/quick-tools/signature",
    "/quick-tools/pdf-size",
  ]
  const utilityBody = `<main id="main-content" class="page-frame shell-width"><h1>FormPack file workflow</h1><p>This interactive utility is not a search landing page. Visit the home page to learn about local file preparation.</p><p><a href="/">Return to FormPack</a></p></main>`
  const pages: StaticPage[] = [
    {
      pathName: "/guides",
      title: "Application file checklists and guides | FormPack",
      description:
        "Plain-language checklists for application photos, signatures, PDFs, and file-size rejections.",
      body: guideIndexBody,
      jsonLd: guideIndexSchema,
    },
    ...guides.map((guide) => ({
      pathName: `/guides/${guide.slug}`,
      title: guide.seoTitle,
      description: guide.description,
      body: guideBody(guide),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        url: `${siteUrl}/guides/${guide.slug}`,
      },
    })),
    {
      pathName: "/photo-compressor",
      title: "Compress a photo to an exact KB range | FormPack",
      description:
        "Compress a JPG or PNG photo to the exact file-size range required by an exam or application portal. Files stay in your browser.",
      body: toolBody(
        "Photo compressor",
        "Compress a JPG or PNG photo to the exact KB range your portal requires, privately in your browser.",
      ),
    },
    {
      pathName: "/pdf-compressor",
      title: "Compress a PDF to an exact KB range | FormPack",
      description:
        "Compress a PDF to the exact file-size range required by an exam or application portal. Files stay in your browser.",
      body: toolBody(
        "PDF compressor",
        "Compress a PDF to the exact KB range your portal requires, privately in your browser.",
      ),
    },
    {
      pathName: "/photo-to-pdf",
      title: "Combine photos into a PDF | FormPack",
      description:
        "Combine two or more photos into one PDF locally in your browser, with an optional target size range.",
      body: toolBody(
        "Photo to PDF",
        "Combine photos, signatures, or thumb impressions into one PDF locally in your browser.",
      ),
    },
    {
      pathName: "/about",
      title: "About FormPack",
      description:
        "Learn why FormPack prepares application files locally and what it can and cannot verify.",
      body: infoBody(
        "About FormPack",
        "FormPack helps applicants turn a strict upload rule into a file that passes its measurable checks, without sending the file anywhere.",
      ),
    },
    {
      pathName: "/contact",
      title: "Contact FormPack",
      description:
        "Questions, corrections, or feedback about FormPack's tools and guides.",
      body: infoBody(
        "Contact FormPack",
        "Questions, corrections, or feedback about FormPack's tools and guides.",
      ),
    },
    {
      pathName: "/privacy",
      title: "Your documents stay on your device | FormPack",
      description:
        "FormPack processes application files locally in your browser and does not receive your documents.",
      body: infoBody(
        "Your documents stay on your device",
        "FormPack processes application files locally in your browser and does not receive your documents.",
      ),
    },
    {
      pathName: "/limitations",
      title: "What FormPack can and cannot confirm | FormPack",
      description:
        "FormPack measures file format and size locally; visual review and portal approval remain your responsibility.",
      body: infoBody(
        "What FormPack can and cannot confirm",
        "FormPack measures file format and size locally; visual review and portal approval remain your responsibility.",
      ),
    },
    ...utilityPaths.map((pathName) => ({
      pathName,
      title: "FormPack file workflow",
      description:
        "Interactive FormPack workflow for checking application files locally.",
      body: utilityBody,
      robots: "noindex,follow" as const,
    })),
  ]

  for (const page of pages) {
    const target = path.join(
      outDir,
      page.pathName.replace(/^\//, ""),
      "index.html"
    )
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(
      target,
      pageHtml(
        baseHtml,
        siteUrl,
        page.pathName,
        page.title,
        page.description,
        page.body,
        page.jsonLd,
        page.robots ?? "index,follow"
      )
    )
  }

  console.log(`Generated ${pages.length} static SEO pages.`)
}
