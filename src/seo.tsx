import { useEffect } from "react"

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://formpack.app"
).replace(/\/$/, "")

export type SeoJsonLd = Record<string, unknown>

export type SeoMeta = {
  title: string
  description: string
  path: string
  robots?: "index,follow" | "noindex,follow"
  type?: "website" | "article"
  jsonLd?: SeoJsonLd
}

function compactDescription(description: string) {
  const compact = description.replace(/\s+/g, " ").trim()
  return compact.length > 155 ? `${compact.slice(0, 152)}…` : compact
}

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string
) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function upsertCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  )
  if (!element) {
    element = document.createElement("link")
    element.rel = "canonical"
    document.head.appendChild(element)
  }
  element.href = url
}

function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path === "/" ? "/" : `/${path.replace(/^\//, "")}`}`
}

export function SeoHead({
  title,
  description,
  path,
  robots = "index,follow",
  type = "website",
  jsonLd,
}: SeoMeta) {
  const canonicalUrl = absoluteUrl(path)
  const safeDescription = compactDescription(description)
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : ""

  useEffect(() => {
    document.title = title
    upsertMeta("name", "description", safeDescription)
    upsertMeta("name", "robots", robots)
    upsertMeta("property", "og:title", title)
    upsertMeta("property", "og:description", safeDescription)
    upsertMeta("property", "og:type", type)
    upsertMeta("property", "og:url", canonicalUrl)
    upsertMeta("property", "og:site_name", "FormPack")
    upsertMeta("property", "og:image", `${SITE_URL}/og-image.png`)
    upsertMeta("property", "og:image:width", "1200")
    upsertMeta("property", "og:image:height", "630")
    upsertMeta("name", "twitter:card", "summary_large_image")
    upsertMeta("name", "twitter:title", title)
    upsertMeta("name", "twitter:description", safeDescription)
    upsertMeta("name", "twitter:image", `${SITE_URL}/og-image.png`)
    upsertCanonical(canonicalUrl)

    const existingJsonLd = document.head.querySelector("#formpack-route-jsonld")
    if (jsonLdText) {
      const script =
        existingJsonLd instanceof HTMLScriptElement
          ? existingJsonLd
          : document.createElement("script")
      script.id = "formpack-route-jsonld"
      script.type = "application/ld+json"
      script.textContent = jsonLdText
      if (!existingJsonLd) document.head.appendChild(script)
    } else {
      existingJsonLd?.remove()
    }
  }, [canonicalUrl, jsonLdText, robots, safeDescription, title, type])

  return null
}

export function pageMeta(
  pathname: string,
  title: string,
  description: string
): SeoMeta {
  const isUtilityRoute =
    title === "Page not found" ||
    pathname === "/prepare" ||
    pathname.startsWith("/prepare/") ||
    pathname === "/fix" ||
    pathname.startsWith("/fix/") ||
    pathname === "/quick-tools"

  return {
    title: title.includes("FormPack") ? title : `${title} | FormPack`,
    description,
    path: pathname,
    robots: isUtilityRoute ? "noindex,follow" : "index,follow",
  }
}
