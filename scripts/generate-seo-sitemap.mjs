import fs from "node:fs"

const siteUrl = (process.env.VITE_SITE_URL ?? "https://formpack.app").replace(
  /\/$/,
  ""
)
const lastModified = "2026-10-20"
const source = fs.readFileSync(
  new URL("../src/seo-data.ts", import.meta.url),
  "utf8"
)
const slugs = [...source.matchAll(/slug:\s*"([^"]+)"/g)].map(
  (match) => match[1]
)
const presetSource = fs.readFileSync(
  new URL("../src/exam-presets.ts", import.meta.url),
  "utf8"
)
const presetSlugs = [...presetSource.matchAll(/slug:\s*"([^"]+)"/g)].map(
  (match) => match[1]
)
const paths = [
  "/",
  "/presets",
  ...presetSlugs.map((slug) => `/presets/${slug}`),
  "/guides",
  ...slugs.map((slug) => `/guides/${slug}`),
  "/photo-compressor",
  "/pdf-compressor",
  "/batch",
  "/file-checker",
  "/photo-to-pdf",
  "/quick-tools/image-dimensions",
  "/quick-tools/signature",
  "/about",
  "/contact",
  "/privacy",
  "/limitations",
  "/terms",
  "/editorial",
  "/cookies",
]
const urls = paths
  .map(
    (path) =>
      `  <url><loc>${siteUrl}${path}</loc><lastmod>${lastModified}</lastmod></url>`
  )
  .join("\n")
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

fs.writeFileSync(new URL("../public/sitemap.xml", import.meta.url), sitemap)
fs.writeFileSync(
  new URL("../public/robots.txt", import.meta.url),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
)
console.log(`Generated sitemap with ${paths.length} URLs.`)
