import fs from "node:fs"
import path from "node:path"

import {
  SITE,
  formatDate,
  homeContent,
  sitePages,
  toolContent,
  type ArticleContent,
  type ContentSection,
  type Faq,
  type SourceLink,
} from "../src/content"
import {
  examPresets,
  presetFieldHref,
  type ExamPreset,
} from "../src/exam-presets"
import { seoGuides, type SeoGuide } from "../src/seo-data"

type StaticPage = {
  pathName: string
  title: string
  description: string
  body: string
  robots?: "index,follow" | "noindex,follow"
  type?: "website" | "article"
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
  robots: "index,follow" | "noindex,follow",
  ogType: "website" | "article"
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
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:type" content="${ogType}" />`
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

function sectionHtml(section: ContentSection) {
  const paragraphs = (section.paragraphs ?? [])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("")
  const bullets = section.bullets?.length
    ? `<ul>${section.bullets
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`
    : ""
  return `<section><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${bullets}</section>`
}

function faqsHtml(faqs: Faq[]) {
  if (!faqs.length) return ""
  return `<section><h2>Frequently asked questions</h2>${faqs
    .map(
      (faq) =>
        `<div class="faq-item"><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></div>`
    )
    .join("")}</section>`
}

function sourcesHtml(sources?: SourceLink[]) {
  if (!sources?.length) return ""
  return `<section><h2>Sources and further reading</h2><ul>${sources
    .map(
      (source) =>
        `<li><a href="${escapeHtml(source.url)}" rel="noopener noreferrer">${escapeHtml(source.label)}</a></li>`
    )
    .join("")}</ul></section>`
}

function staticHeader() {
  return `<header class="site-header"><div class="shell-width header-inner"><a class="wordmark" href="/" aria-label="FormPack home"><span class="wordmark-mark" aria-hidden="true">FP</span><span>FormPack</span></a><nav class="desktop-nav" aria-label="Primary navigation"><a href="/quick-tools">Compress files</a><a href="/presets">Exam presets</a><a href="/prepare">Prepare a pack</a><a href="/guides">Guides</a></nav></div></header>`
}

function staticFooter() {
  const year = new Date().getFullYear()
  return `<footer class="site-footer"><div class="shell-width footer-main"><div class="footer-brand"><span class="footer-name">FormPack</span><p>Private file preparation for strict application forms.</p></div><nav class="footer-group" aria-label="Tools"><h2 class="footer-heading">Tools</h2><a href="/fix">Fix a rejection</a><a href="/batch">Batch compress</a><a href="/file-checker">Check a file</a><a href="/presets">Exam presets</a></nav><nav class="footer-group" aria-label="Learn"><h2 class="footer-heading">Learn</h2><a href="/guides">Guides</a><a href="/about">About</a><a href="/editorial">Editorial</a><a href="/contact">Contact</a></nav><nav class="footer-group" aria-label="Legal"><h2 class="footer-heading">Legal</h2><a href="/privacy">Privacy</a><a href="/cookies">Cookies</a><a href="/terms">Terms</a><a href="/limitations">Limitations</a></nav></div><div class="shell-width footer-bottom"><p class="footer-copy" dir="ltr">© ${year} FormPack</p><p class="footer-note">FormPack checks file rules. It cannot guarantee approval by a portal or authority. Always confirm the current official instructions.</p><a class="footer-top" href="#top">Back to top ↑</a></div></footer>`
}

function staticShell(body: string) {
  return `<div class="site-shell" id="top">${staticHeader()}${body}${staticFooter()}</div>`
}

function articleBodyHtml(content: ArticleContent) {
  return [
    ...content.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    ...content.sections.map(sectionHtml),
    faqsHtml(content.faqs),
    sourcesHtml(content.sources),
  ].join("")
}

function articlePageBody(content: ArticleContent, extra = "") {
  const meta = `<div class="guide-article-meta"><span>By ${escapeHtml(
    SITE.author
  )}</span><span>Last updated ${escapeHtml(
    formatDate(content.updatedAt)
  )}</span></div>`
  return staticShell(
    `<main id="main-content" class="page-frame shell-width"><article class="guide-article">${meta}<h1>${escapeHtml(
      content.title
    )}</h1>${articleBodyHtml(content)}${extra}</article></main>`
  )
}

function homeBody() {
  return staticShell(
    `<main id="main-content" class="page-frame shell-width"><article class="guide-article"><div class="guide-article-meta"><span>By ${escapeHtml(
      SITE.author
    )}</span><span>Last updated ${escapeHtml(
      formatDate(homeContent.updatedAt)
    )}</span></div><h1>Hit the exact size range.</h1>${articleBodyHtml(
      homeContent
    )}<p><a href="/presets">Browse exam presets</a> · <a href="/photo-compressor">Compress a photo</a> · <a href="/pdf-compressor">Compress a PDF</a> · <a href="/photo-to-pdf">Combine images into a PDF</a> · <a href="/quick-tools/image-dimensions">Resize an image</a> · <a href="/guides">Read the guides</a></p></article></main>`
  )
}

function guideBody(guide: SeoGuide) {
  const meta = `<div class="guide-article-meta"><span>${escapeHtml(
    guide.audience
  )}</span><span>By ${escapeHtml(SITE.author)}</span><span>Last updated ${escapeHtml(
    formatDate(guide.updatedAt)
  )}</span></div>`
  const body = `<p>${escapeHtml(guide.summary)}</p>${guide.sections
    .map(sectionHtml)
    .join("")}${faqsHtml(guide.faqs)}${sourcesHtml(guide.sources)}`
  const links = `<p><a href="/prepare">Prepare an application pack</a> · <a href="/quick-tools">Use a quick tool</a> · <a href="/guides">Browse all guides</a></p>`
  return staticShell(
    `<main id="main-content" class="page-frame shell-width"><article class="guide-article">${meta}<h1>${escapeHtml(
      guide.title
    )}</h1>${body}${links}</article></main>`
  )
}

function guideIndexBody() {
  const items = seoGuides
    .map(
      (guide) =>
        `<li><a href="/guides/${escapeHtml(guide.slug)}">${escapeHtml(
          guide.title
        )}</a> — ${escapeHtml(guide.summary)}</li>`
    )
    .join("")
  return staticShell(
    `<main id="main-content" class="page-frame shell-width"><article class="guide-article"><h1>Application file checklists and guides</h1><p>Plain-language checklists for turning an official upload rule into measurable checks and a final human review. Each guide explains what software can measure, what you still need to inspect, and which official source to use.</p><ul>${items}</ul><p><a href="/photo-compressor">Compress a photo</a> · <a href="/pdf-compressor">Compress a PDF</a> · <a href="/photo-to-pdf">Combine images into a PDF</a></p></article></main>`
  )
}

function presetIndexBody() {
  const items = examPresets
    .map(
      (preset) =>
        `<li><a href="/presets/${escapeHtml(preset.slug)}">${escapeHtml(
          preset.exam
        )}</a> — ${escapeHtml(preset.summary)}<ul>${preset.fields
          .map(
            (field) =>
              `<li><strong>${escapeHtml(field.label)}:</strong> ${field.format} · ${field.minKb}–${field.maxKb} KB · ${escapeHtml(field.dimensionsLabel)}</li>`
          )
          .join("")}</ul></li>`
    )
    .join("")
  return staticShell(
    `<main id="main-content" class="page-frame shell-width"><article class="guide-article"><h1>Exam file presets</h1><p>Start with the photo, signature, thumb impression, and declaration values commonly published for your exam. These presets are a preparation reference, not an official approval. Confirm every value against the current official notice.</p><ul>${items}</ul><p><a href="/photo-compressor">Compress a photo</a> · <a href="/pdf-compressor">Compress a PDF</a> · <a href="/guides">Read the guides</a></p></article></main>`
  )
}

function presetBody(preset: ExamPreset) {
  const rows = preset.fields
    .map(
      (field) =>
        `<tr><td><strong>${escapeHtml(field.label)}</strong>${
          field.notes ? `<small>${escapeHtml(field.notes)}</small>` : ""
        }</td><td>${field.format}</td><td>${field.minKb}–${field.maxKb} KB</td><td>${escapeHtml(
          field.dimensionsLabel
        )}</td><td><a href="${escapeHtml(presetFieldHref(preset, field))}">Open tool →</a></td></tr>`
    )
    .join("")
  const steps = `<ol>${preset.steps
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join("")}</ol>`
  const notes = `<ul>${preset.notes
    .map((note) => `<li>${escapeHtml(note)}</li>`)
    .join("")}</ul>`
  const guide = preset.guideSlug
    ? `<p><a href="/guides/${escapeHtml(preset.guideSlug)}">Read the full preparation guide →</a></p>`
    : ""
  const meta = `<div class="guide-article-meta"><span>${escapeHtml(
    preset.authority
  )}</span><span>${escapeHtml(preset.cycle)}</span><span>Last updated ${escapeHtml(
    formatDate(preset.updatedAt)
  )}</span></div>`
  return staticShell(
    `<main id="main-content" class="page-frame shell-width"><article class="guide-article">${meta}<h1>${escapeHtml(
      preset.exam
    )} photo and signature requirements</h1><p>${escapeHtml(
      preset.summary
    )}</p><section><h2>Upload rules</h2><div class="preset-table-wrap"><table class="preset-table"><thead><tr><th>Field</th><th>Format</th><th>Size</th><th>Dimensions</th><th>Prepare</th></tr></thead><tbody>${rows}</tbody></table></div></section><section><h2>How to prepare the files</h2>${steps}</section><section><h2>Important notes</h2>${notes}</section><section><h2>Official source</h2><p><a href="${escapeHtml(
      preset.source.url
    )}" rel="noopener noreferrer">${escapeHtml(
      preset.source.label
    )}</a></p>${guide}</section><p><a href="/presets">Browse all exam presets</a> · <a href="/photo-compressor">Open the photo tool</a> · <a href="/guides">Read the guides</a></p></article></main>`
  )
}

function presetSchema(preset: ExamPreset, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${preset.exam} photo and signature requirements`,
        description: preset.summary,
        url: `${siteUrl}/presets/${preset.slug}`,
        datePublished: preset.updatedAt,
        dateModified: preset.updatedAt,
        author: { "@type": "Organization", name: SITE.author },
        publisher: { "@type": "Organization", name: SITE.name, url: siteUrl },
        isPartOf: { "@type": "WebSite", name: SITE.name, url: siteUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Exam presets",
            item: `${siteUrl}/presets`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: preset.exam,
            item: `${siteUrl}/presets/${preset.slug}`,
          },
        ],
      },
    ],
  }
}

function toolBody(pathName: string) {
  const content = toolContent[pathName]
  return articlePageBody(
    content,
    `<p><a href="/">Return to FormPack</a> · <a href="/quick-tools">More quick tools</a> · <a href="/guides">Read the guides</a></p>`
  )
}

function homeSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE.name,
        url: siteUrl,
        description: homeContent.description,
      },
      {
        "@type": "Organization",
        name: SITE.name,
        url: siteUrl,
        email: SITE.email,
      },
    ],
  }
}

function guideSchema(guide: SeoGuide, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        url: `${siteUrl}/guides/${guide.slug}`,
        datePublished: guide.updatedAt,
        dateModified: guide.updatedAt,
        author: { "@type": "Organization", name: SITE.author },
        publisher: { "@type": "Organization", name: SITE.name, url: siteUrl },
        isPartOf: { "@type": "WebSite", name: SITE.name, url: siteUrl },
        about: guide.audience,
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: `${siteUrl}/guides`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: `${siteUrl}/guides/${guide.slug}`,
          },
        ],
      },
    ],
  }
}

function toolSchema(pathName: string, siteUrl: string) {
  const content = toolContent[pathName]
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: content.title,
    description: content.description,
    url: `${siteUrl}${pathName}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@type": "WebSite", name: SITE.name, url: siteUrl },
  }
}

function policySchema(content: ArticleContent, pathName: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.title,
    description: content.description,
    url: `${siteUrl}${pathName}`,
    dateModified: content.updatedAt,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: siteUrl },
  }
}

export function generateStaticSeoPages(root = process.cwd()) {
  const outDir = path.join(root, "dist")
  const baseHtml = fs.readFileSync(path.join(outDir, "index.html"), "utf8")
  const siteUrl = (process.env.VITE_SITE_URL ?? SITE.url).replace(/\/$/, "")

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
  ]
  const utilityBody = staticShell(
    `<main id="main-content" class="page-frame shell-width"><h1>FormPack file workflow</h1><p>This interactive utility is not a search landing page. Visit the home page to learn about local file preparation, or open a focused tool from the quick tools list.</p><p><a href="/">Return to FormPack</a> · <a href="/quick-tools">Quick tools</a></p></main>`
  )

  const pages: StaticPage[] = [
    {
      pathName: "/",
      title: "FormPack — Exact-size photo and PDF tools",
      description: homeContent.description,
      body: homeBody(),
      jsonLd: homeSchema(siteUrl),
    },
    {
      pathName: "/presets",
      title: "Exam photo and signature presets | FormPack",
      description:
        "Browse exam-specific photo, signature, thumb impression, and declaration rules for SSC, IBPS, SBI, RRB, NTA, and other applications.",
      body: presetIndexBody(),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Exam file presets",
        url: `${siteUrl}/presets`,
      },
    },
    ...examPresets.map((preset) => ({
      pathName: `/presets/${preset.slug}`,
      title: `${preset.exam} photo and signature requirements | FormPack`,
      description: preset.summary,
      body: presetBody(preset),
      type: "article" as const,
      jsonLd: presetSchema(preset, siteUrl),
    })),
    {
      pathName: "/guides",
      title: "Application file checklists and guides | FormPack",
      description:
        "Plain-language checklists for application photos, signatures, PDFs, and file-size rejections.",
      body: guideIndexBody(),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Application file checklists and guides",
        url: `${siteUrl}/guides`,
      },
    },
    ...seoGuides.map((guide) => ({
      pathName: `/guides/${guide.slug}`,
      title: guide.seoTitle,
      description: guide.description,
      body: guideBody(guide),
      type: "article" as const,
      jsonLd: guideSchema(guide, siteUrl),
    })),
    ...Object.keys(toolContent).map((pathName) => ({
      pathName,
      title: `${toolContent[pathName].title} | FormPack`,
      description: toolContent[pathName].description,
      body: toolBody(pathName),
      jsonLd: toolSchema(pathName, siteUrl),
    })),
    {
      pathName: "/about",
      title: "About FormPack",
      description: sitePages.about.description,
      body: articlePageBody(sitePages.about),
      jsonLd: policySchema(sitePages.about, "/about", siteUrl),
    },
    {
      pathName: "/contact",
      title: "Contact FormPack",
      description: sitePages.contact.description,
      body: articlePageBody(
        sitePages.contact,
        `<p><a href="mailto:${escapeHtml(SITE.email)}">${escapeHtml(SITE.email)}</a></p>`
      ),
      jsonLd: policySchema(sitePages.contact, "/contact", siteUrl),
    },
    {
      pathName: "/privacy",
      title: "Your documents stay on your device | FormPack",
      description: sitePages.privacy.description,
      body: articlePageBody(sitePages.privacy),
      jsonLd: policySchema(sitePages.privacy, "/privacy", siteUrl),
    },
    {
      pathName: "/limitations",
      title: "What FormPack can and cannot confirm | FormPack",
      description: sitePages.limitations.description,
      body: articlePageBody(sitePages.limitations),
      jsonLd: policySchema(sitePages.limitations, "/limitations", siteUrl),
    },
    {
      pathName: "/terms",
      title: "Terms of Use | FormPack",
      description: sitePages.terms.description,
      body: articlePageBody(sitePages.terms),
      jsonLd: policySchema(sitePages.terms, "/terms", siteUrl),
    },
    {
      pathName: "/editorial",
      title: "Editorial Policy | FormPack",
      description: sitePages.editorial.description,
      body: articlePageBody(sitePages.editorial),
      jsonLd: policySchema(sitePages.editorial, "/editorial", siteUrl),
    },
    {
      pathName: "/cookies",
      title: "Cookie Policy | FormPack",
      description: sitePages.cookies.description,
      body: articlePageBody(sitePages.cookies),
      jsonLd: policySchema(sitePages.cookies, "/cookies", siteUrl),
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
    const target =
      page.pathName === "/"
        ? path.join(outDir, "index.html")
        : path.join(outDir, page.pathName.replace(/^\//, ""), "index.html")
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
        page.robots ?? "index,follow",
        page.type ?? "website"
      )
    )
  }

  console.log(`Generated ${pages.length} static SEO pages.`)
}
