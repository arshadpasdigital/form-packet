import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "@tanstack/react-router"
import { zipSync } from "fflate"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  FileWarning,
  GripVertical,
  ImagePlus,
  LockKeyhole,
  Plus,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"

import {
  ActionLink,
  AdSlot,
  ArticleBlock,
  ArticleBody,
  CheckLine,
  PageFrame,
  PrivacyNotice,
  RuleLinkButton,
  SlotIcon,
  StatusLabel,
} from "@/components"
import {
  SITE,
  formatDate,
  homeContent,
  sitePages,
  toolContent,
  type ArticleContent,
} from "@/content"
import {
  examPresets,
  getExamPreset,
  presetFieldHref,
  type ExamPreset,
} from "@/exam-presets"
import { useI18n } from "@/i18n"
import {
  categories,
  fileTypeMatches,
  formatBytes,
  quickTools,
  requirementIsComplete,
} from "@/data"
import { usePack } from "@/pack-store"
import { useFix } from "@/fix-store"
import { adSlots } from "@/lib/ads"
import { track } from "@/lib/analytics"
import { normalizeImageFile, normalizeImageFiles } from "@/lib/heic"
import {
  compressImageToRange,
  compressPdfToRange,
  cropSignature,
  imageToBlob,
  imagesToPdfRange,
  readPdfPageCount,
  type FitMode,
  type ImageOutputFormat,
} from "@/lib/processing-client"
import { SeoHead, SITE_URL } from "@/seo"
import { getSeoGuide, seoGuides } from "@/seo-data"

function buildRuleQuery(values: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value)
  }
  return params.toString()
}

export function PhotoCompressorPage() {
  const { t } = useI18n()
  const initialSearch = new URLSearchParams(window.location.search)
  const searchMin = initialSearch.get("min") ?? ""
  const searchMax = initialSearch.get("max") ?? ""
  const searchWidth = initialSearch.get("w") ?? ""
  const searchHeight = initialSearch.get("h") ?? ""
  const searchFormat = initialSearch.get("format")
  const searchFit = initialSearch.get("fit")
  const presetSlug = initialSearch.get("preset") ?? undefined
  const preset = presetSlug ? getExamPreset(presetSlug) : undefined

  const [source, setSource] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [sourceDimensions, setSourceDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [minKb, setMinKb] = useState(searchMin)
  const [maxKb, setMaxKb] = useState(searchMax)
  const [targetWidth, setTargetWidth] = useState(searchWidth)
  const [targetHeight, setTargetHeight] = useState(searchHeight)
  const [outputFormat, setOutputFormat] = useState<"JPEG" | "PNG">(
    searchFormat === "PNG" ? "PNG" : "JPEG",
  )
  const [fit, setFit] = useState<FitMode>(
    searchFit === "contain" || searchFit === "stretch" ? searchFit : "cover",
  )

  useEffect(() => {
    if (searchMin) setMinKb(searchMin)
    if (searchMax) setMaxKb(searchMax)
    if (searchWidth) setTargetWidth(searchWidth)
    if (searchHeight) setTargetHeight(searchHeight)
    if (searchFormat === "PNG" || searchFormat === "JPEG") {
      setOutputFormat(searchFormat)
    }
    if (
      searchFit === "cover" ||
      searchFit === "contain" ||
      searchFit === "stretch"
    ) {
      setFit(searchFit)
    }
  }, [
    searchMin,
    searchMax,
    searchWidth,
    searchHeight,
    searchFormat,
    searchFit,
  ])
  const [processing, setProcessing] = useState(false)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{
    blob: Blob
    url: string
    width: number
    height: number
    inRange: boolean
  } | null>(null)
  const resultRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!result) return
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [result])

  useEffect(() => {
    if (!source) {
      setPreviewUrl("")
      setSourceDimensions(null)
      return
    }

    const nextUrl = URL.createObjectURL(source)
    const image = new Image()
    image.onload = () => {
      setSourceDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.src = nextUrl
    setPreviewUrl(nextUrl)

    return () => {
      image.onload = null
      URL.revokeObjectURL(nextUrl)
    }
  }, [source])

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setConverting(true)
    setResult(null)
    setError("")
    try {
      setSource(await normalizeImageFile(file))
    } catch {
      setError("The HEIC photo could not be converted. Try a JPG or PNG copy.")
    } finally {
      setConverting(false)
    }
  }

  const minValue = Number(minKb)
  const maxValue = Number(maxKb)
  const rangeIsValid =
    minKb.trim().length > 0 &&
    maxKb.trim().length > 0 &&
    minValue > 0 &&
    maxValue >= minValue
  const dimensionsAreValid =
    targetWidth.trim().length > 0 &&
    targetHeight.trim().length > 0 &&
    Number(targetWidth) > 0 &&
    Number(targetHeight) > 0
  const formIsComplete = Boolean(source && rangeIsValid && dimensionsAreValid)

  const handleCompress = async () => {
    if (!source || !formIsComplete) return
    setProcessing(true)
    setError("")
    setResult(null)
    track({ name: "tool_started", tool: "photo-compressor" })
    try {
      const processed = await compressImageToRange(
        source,
        Number(targetWidth),
        Number(targetHeight),
        outputFormat,
        minValue,
        maxValue,
        fit,
      )
      setResult({ ...processed, url: URL.createObjectURL(processed.blob) })
      track({
        name: "tool_completed",
        tool: "photo-compressor",
        inRange: processed.inRange,
      })
    } catch {
      setError("The photo could not be processed in this browser. Try another image.")
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url)
    }
  }, [result?.url])

  return (
    <>
      <SeoHead
        title="Compress a photo to an exact KB range | FormPack"
        description="Compress a JPG or PNG photo to the exact file-size range required by an exam or application portal. Files stay in your browser."
        path="/photo-compressor"
      />
      <section className="mx-auto w-[min(calc(100%-3rem),var(--shell))] py-[clamp(3rem,7vw,6rem)] pb-[clamp(5rem,10vw,8rem)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 pb-[clamp(2.5rem,5vw,4rem)] max-[50rem]:grid-cols-1 max-[50rem]:items-start">
          <div>
            <div className="inline-flex items-center gap-[.55rem] text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              <span className="home-kicker-dot" aria-hidden="true" />
              {t("photo.kicker")}
            </div>
            <h1 className="my-4 max-w-[10ch] text-[clamp(3.2rem,7vw,6rem)] font-[680] leading-[.9] tracking-[-.075em] [text-wrap:balance]">
              {t("photo.title")}
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] text-[var(--muted)] [text-wrap:pretty]">
              {t("photo.intro")}
            </p>
            {preset ? (
              <p className="preset-loaded">
                {t("photo.loadedFrom")}{" "}
                <Link to="/presets/$slug" params={{ slug: preset.slug }}>
                  {preset.exam}
                </Link>
                . {t("photo.confirm")}
              </p>
            ) : null}
          </div>
          <div className="max-[50rem]:max-w-none">
            <PrivacyNotice compact />
          </div>
        </div>

        <AdSlot slot={adSlots.toolTop} className="mb-6" />

        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] gap-px border border-[var(--border)] bg-[var(--border)] max-[50rem]:grid-cols-1">
          <section
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-labelledby="source-title"
          >
            <div
              className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]"
              id="source-title"
            >
              {t("photo.add")}
            </div>
            <label
              className={
                source
                  ? "relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-[var(--ink)] bg-[var(--raised)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80"
                  : "relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-dashed border-[var(--border)] bg-[var(--canvas)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--ink)] hover:bg-[var(--raised)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80"
              }
            >
              <input
                type="file"
                accept="image/jpeg,image/png,.heic,.heif,image/heic,image/heif"
                onChange={onFile}
                className="absolute h-px w-px overflow-hidden opacity-0"
              />
              {source && previewUrl ? (
                <span className="flex max-h-64 w-full max-w-[18rem] items-center justify-center overflow-hidden bg-[var(--surface)] [background-image:linear-gradient(45deg,var(--raised)_25%,transparent_25%),linear-gradient(-45deg,var(--raised)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--raised)_75%),linear-gradient(-45deg,transparent_75%,var(--raised)_75%)] [background-position:0_0,0_.5rem,.5rem_-.5rem,-.5rem_0] [background-size:1rem_1rem] [outline:1px_solid_oklch(0_0_0_/_0.1)]">
                  <img
                    className="max-h-64 max-w-full object-contain [outline:1px_solid_oklch(0_0_0_/_0.1)]"
                    src={previewUrl}
                    alt="Selected photo preview"
                  />
                </span>
              ) : (
                <span className="flex flex-col items-center gap-[.6rem] [&>svg]:mb-2 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.8]">
                  <SlotIcon slot={{ kind: "photo" }} />
                  <strong className="text-[1.08rem] tracking-[-.02em]">
                    {t("photo.choose")}
                  </strong>
                  <small className="max-w-[28ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">
                    {t("photo.chooseHint")}
                  </small>
                </span>
              )}
              <span className="inline-flex min-h-11 items-center gap-[.45rem] border border-[var(--ink)] bg-[var(--surface)] px-[.85rem] py-[.65rem] text-[.82rem] font-bold text-[var(--ink)]">
                {source ? t("photo.chooseAnother") : t("photo.choosePhoto")}
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </label>

            <div
              className="mt-4 grid grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,.85fr))] gap-4 border-t border-[var(--border)] pt-4 max-[32rem]:grid-cols-1 max-[32rem]:gap-[.85rem]"
              aria-live="polite"
            >
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  {t("photo.sourceFile")}
                </span>
                <strong className="[overflow-wrap:anywhere] text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {source?.name ?? t("photo.noPhoto")}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  {t("photo.currentSize")}
                </span>
                <strong className="[overflow-wrap:anywhere] text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {source ? formatBytes(source.size) : "—"}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  {t("photo.dimensions")}
                </span>
                <strong className="[overflow-wrap:anywhere] text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {sourceDimensions
                    ? `${sourceDimensions.width} × ${sourceDimensions.height} px`
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          <form
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              {t("photo.rule")}
            </div>
            <div className="mt-4 border-b border-[var(--border)] pb-5">
              <h2 className="m-0 text-[1.45rem] leading-[1.1] tracking-[-.035em]">
                {t("photo.settings")}
              </h2>
              <p className="mt-[.45rem] text-[.86rem] text-[var(--muted)]">
                {t("photo.settingsHint")}
              </p>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("photo.targetSize")}
              </legend>
              <div className="mt-[.55rem] grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("photo.min")}
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="20"
                      value={minKb}
                      onChange={(event) => setMinKb(event.target.value)}
                      aria-invalid={minKb.length > 0 && minValue <= 0}
                      className="min-h-12 w-full rounded-s border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      KB
                    </span>
                  </div>
                </label>
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("photo.max")}
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="50"
                      value={maxKb}
                      onChange={(event) => setMaxKb(event.target.value)}
                      aria-invalid={maxKb.length > 0 && maxValue < minValue}
                      className="min-h-12 w-full rounded-s border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      KB
                    </span>
                  </div>
                </label>
              </div>
              <small className="mt-[.6rem] block text-[.75rem] leading-[1.45] text-[var(--muted)] [text-wrap:pretty]">
                Example: a portal may require 20–50 KB. Always copy the current
                rule from your form.
              </small>
            </fieldset>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("photo.targetDimensions")}
              </legend>
              <div className="mt-[.55rem] grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("photo.width")}
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="600"
                      value={targetWidth}
                      onChange={(event) => setTargetWidth(event.target.value)}
                      className="min-h-12 w-full rounded-s border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      px
                    </span>
                  </div>
                </label>
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("photo.height")}
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="800"
                      value={targetHeight}
                      onChange={(event) => setTargetHeight(event.target.value)}
                      className="min-h-12 w-full rounded-s border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      px
                    </span>
                  </div>
                </label>
              </div>
            </fieldset>

            <label className="mt-5 flex min-w-0 flex-col gap-[.45rem]">
              <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("photo.format")}
              </span>
              <select
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                value={outputFormat}
                onChange={(event) => setOutputFormat(event.target.value as "JPEG" | "PNG")}
              >
                <option>JPEG</option>
                <option>PNG</option>
              </select>
              {outputFormat === "PNG" ? (
                <small className="text-[.75rem] leading-[1.45] text-[var(--signal)] [text-wrap:pretty]">
                  PNG size can’t be reduced by quality. FormPack returns one PNG
                  at your dimensions; if it misses the range, switch to JPEG or
                  adjust the dimensions.
                </small>
              ) : null}
            </label>

            <label className="mt-5 flex min-w-0 flex-col gap-[.45rem]">
              <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("photo.fit")}
              </span>
              <select
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                value={fit}
                onChange={(event) => setFit(event.target.value as FitMode)}
              >
                <option value="cover">Crop to fill (recommended)</option>
                <option value="contain">Fit inside (add borders)</option>
                <option value="stretch">Stretch to exact dimensions</option>
              </select>
              <small className="text-[.75rem] leading-[1.45] text-[var(--muted)] [text-wrap:pretty]">
                “Crop to fill” keeps the photo’s shape and fills the target
                size. “Fit inside” shows the whole image with empty edges.
              </small>
            </label>

            {rangeIsValid ? (
              <RuleLinkButton
                className="mt-4"
                href={`/photo-compressor?${buildRuleQuery({
                  min: minKb,
                  max: maxKb,
                  w: targetWidth,
                  h: targetHeight,
                  format: outputFormat,
                  fit,
                  preset: presetSlug,
                })}`}
                label={t("photo.share")}
              />
            ) : null}

            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5">
              <span
                className="text-[.76rem] text-[var(--muted)] [text-wrap:pretty]"
                role="status"
              >
                {converting
                  ? t("photo.converting")
                  : error
                    ? error
                    : processing
                      ? t("photo.preparing")
                    : result
                      ? t("photo.resultReady")
                      : formIsComplete
                        ? t("photo.ready")
                        : t("photo.complete")}
              </span>
              <button
                className="inline-flex min-h-[3.25rem] w-full items-center justify-between gap-4 border border-[var(--signal)] bg-[var(--signal)] px-4 py-[.8rem] font-bold text-[var(--ink)] transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-[var(--signal-hover)] active:scale-[.96] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--raised)] disabled:text-[var(--quiet)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
                type="submit"
                disabled={!formIsComplete || processing}
                onClick={() => void handleCompress()}
              >
                {processing
                  ? t("photo.processing")
                  : result
                    ? t("photo.compressAgain")
                    : t("photo.compress")}{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        <section
          ref={resultRef}
          className="mt-[clamp(2rem,4vw,3rem)] border border-[var(--ink)] bg-[var(--surface)]"
          aria-labelledby="output-title"
        >
          <div className="flex items-end justify-between gap-8 border-b border-[var(--border)] p-5 max-[50rem]:flex-col max-[50rem]:items-start max-[50rem]:gap-4">
            <div>
              <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                {t("photo.check")}
              </div>
              <h2
                className="mt-[.65rem] text-[1.45rem] leading-[1.1] tracking-[-.035em]"
                id="output-title"
              >
                {t("photo.waiting")}
              </h2>
            </div>
            <span className={`whitespace-nowrap text-[.68rem] uppercase tracking-[.05em] [font-family:var(--font-mono)] max-[50rem]:whitespace-normal ${result?.inRange ? "text-[var(--ready)]" : "text-[var(--proof)]"}`}>
              {result
                ? result.inRange
                  ? t("photo.inRange")
                  : t("photo.closest")
                : t("photo.waitingOutput")}
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)] gap-px bg-[var(--border)] max-[50rem]:grid-cols-1">
            <div className="flex min-h-[17rem] flex-col items-center justify-center bg-[var(--canvas)] p-[clamp(1.25rem,3vw,2rem)] text-center [&>svg]:mb-4 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.8]">
              {result ? <img src={result.url} alt="Compressed photo preview" className="max-h-64 max-w-[18rem] rounded border border-[var(--border)] bg-white object-contain [outline:1px_solid_oklch(0_0_0_/_0.1)]" /> : <><SlotIcon slot={{ kind: "photo" }} /><strong className="text-[1.05rem]">{t("photo.resultPreview")}</strong><p className="mt-2 max-w-[34ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">{t("photo.resultPreviewBody")}</p></>}
            </div>
            <div className="grid content-center gap-5 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]">
              {result ? <>
                <div className={`border-b border-[var(--border-soft)] pb-5 ${result.inRange ? "" : "text-[var(--signal)]"}`}><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Result status</span><p className="mt-[.45rem] text-[.9rem] font-[680] text-[var(--ink)]">{result.inRange ? "Inside the requested range" : "Closest achievable result"}</p><p className="mt-1 text-[.8rem] leading-[1.5] text-[var(--muted)]">{result.inRange ? "This file matches the dimensions and size range you entered." : outputFormat === "PNG" ? "PNG has no quality control, so this best-effort file may not land inside the range. Switch to JPEG for exact range control." : "These dimensions and format could not reach the full range. Try adjusting the dimensions or maximum size."}</p></div>
                <div className="grid grid-cols-2 gap-3 border-b border-[var(--border-soft)] pb-5"><div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Final size</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{formatBytes(result.blob.size)}</strong></div><div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Dimensions</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{result.width} × {result.height} px</strong></div></div>
                <a href={result.url} download={`formpack-photo.${outputFormat === "PNG" ? "png" : "jpg"}`} className="flex min-h-12 items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.82rem] font-[680] text-[var(--surface)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--signal)] active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"><Download size={17} strokeWidth={1.9} aria-hidden="true" /> {t("photo.downloadResult")}</a>
              </> : <>
              <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  What happens next
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  FormPack adjusts image quality in a local loop until the file
                  lands between your minimum and maximum size.
                </p>
              </div>
              <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  If the range cannot be reached
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  You will get the closest result with a plain explanation and
                  the next setting to change.
                </p>
              </div>
              </>}
            </div>
          </div>
        </section>

        <ArticleBlock
          content={toolContent["/photo-compressor"]}
          className="tool-article"
        />

        <AdSlot slot={adSlots.toolBottom} className="mt-6" />
      </section>
    </>
  )
}

type BatchItem = {
  id: string
  file: File
  width: number
  height: number
  status: "ready" | "processing" | "done" | "error"
  result?: {
    blob: Blob
    url: string
    inRange: boolean
    width: number
    height: number
  }
  error?: string
}

function batchId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function uniqueOutputName(
  name: string,
  format: "JPEG" | "PNG",
  used: Set<string>,
) {
  const base = name.replace(/\.[^.]+$/, "") || "image"
  const extension = format === "PNG" ? "png" : "jpg"
  let candidate = `${base}.${extension}`
  let copy = 2
  while (used.has(candidate)) {
    candidate = `${base}-${copy}.${extension}`
    copy += 1
  }
  used.add(candidate)
  return candidate
}

export function BatchPage() {
  const { t } = useI18n()
  const initialSearch = new URLSearchParams(window.location.search)
  const searchMin = initialSearch.get("min") ?? ""
  const searchMax = initialSearch.get("max") ?? ""
  const searchWidth = initialSearch.get("w") ?? ""
  const searchHeight = initialSearch.get("h") ?? ""
  const searchFormat = initialSearch.get("format")
  const searchFit = initialSearch.get("fit")

  const [items, setItems] = useState<BatchItem[]>([])
  const [minKb, setMinKb] = useState(searchMin)
  const [maxKb, setMaxKb] = useState(searchMax)
  const [targetWidth, setTargetWidth] = useState(searchWidth)
  const [targetHeight, setTargetHeight] = useState(searchHeight)
  const [outputFormat, setOutputFormat] = useState<"JPEG" | "PNG">(
    searchFormat === "PNG" ? "PNG" : "JPEG",
  )
  const [fit, setFit] = useState<FitMode>(
    searchFit === "contain" || searchFit === "stretch" ? searchFit : "cover",
  )
  const [processing, setProcessing] = useState(false)
  const [converting, setConverting] = useState(false)
  const [zipUrl, setZipUrl] = useState("")
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.result?.url) URL.revokeObjectURL(item.result.url)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (zipUrl) URL.revokeObjectURL(zipUrl)
    }
  }, [zipUrl])

  const minValue = Number(minKb)
  const maxValue = Number(maxKb)
  const rangeIsValid =
    minKb.trim().length > 0 &&
    maxKb.trim().length > 0 &&
    minValue > 0 &&
    maxValue >= minValue
  const dimensionsAreValid =
    (targetWidth.trim().length === 0 && targetHeight.trim().length === 0) ||
    (Number(targetWidth) > 0 && Number(targetHeight) > 0)
  const canCompress =
    items.length > 0 &&
    rangeIsValid &&
    dimensionsAreValid &&
    !processing &&
    !converting
  const doneCount = items.filter((item) => item.status === "done").length
  const errorCount = items.filter((item) => item.status === "error").length
  const processedCount = doneCount + errorCount
  const inRangeCount = items.filter((item) => item.result?.inRange).length
  const totalInputBytes = items.reduce((sum, item) => sum + item.file.size, 0)
  const totalOutputBytes = items.reduce(
    (sum, item) => sum + (item.result?.blob.size ?? 0),
    0,
  )

  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (!rawFiles.length) return

    setConverting(true)
    try {
      const nextItems = await Promise.all(
        rawFiles.map(async (rawFile) => {
          let file = rawFile
          try {
            file = await normalizeImageFile(rawFile)
          } catch {
            // Keep the original so the per-file error is visible.
          }
          let width = 0
          let height = 0
          try {
            const bitmap = await createImageBitmap(file)
            width = bitmap.width
            height = bitmap.height
            bitmap.close()
          } catch {
            // Dimensions are optional; the file can still be compressed to a KB range.
          }
          return {
            id: batchId(),
            file,
            width,
            height,
            status: "ready" as const,
          }
        }),
      )

      setItems((current) => [...current, ...nextItems])
      setZipUrl("")
    } finally {
      setConverting(false)
    }
  }

  const removeItem = (id: string) => {
    setItems((current) => {
      const item = current.find((entry) => entry.id === id)
      if (item?.result?.url) URL.revokeObjectURL(item.result.url)
      return current.filter((entry) => entry.id !== id)
    })
    setZipUrl("")
  }

  const compressAll = async () => {
    if (!canCompress) return
    setProcessing(true)
    setZipUrl("")
    const width = Number(targetWidth) || 0
    const height = Number(targetHeight) || 0

    for (const item of items) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "processing", error: undefined }
            : entry,
        ),
      )
      try {
        const itemWidth = width || item.width
        const itemHeight = height || item.height
        if (!itemWidth || !itemHeight) {
          throw new Error("The image dimensions could not be read.")
        }
        const processed = await compressImageToRange(
          item.file,
          itemWidth,
          itemHeight,
          outputFormat,
          minValue,
          maxValue,
          fit,
        )
        const url = URL.createObjectURL(processed.blob)
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: "done",
                  result: {
                    blob: processed.blob,
                    url,
                    inRange: processed.inRange,
                    width: processed.width,
                    height: processed.height,
                  },
                }
              : entry,
          ),
        )
      } catch (error) {
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : t("batch.error"),
                }
              : entry,
          ),
        )
      }
    }
    setProcessing(false)
  }

  const downloadZip = async () => {
    const completed = items.filter((item) => item.result)
    if (!completed.length) return
    const used = new Set<string>()
    const entries: Record<string, Uint8Array> = {}
    for (const item of completed) {
      if (!item.result) continue
      entries[uniqueOutputName(item.file.name, outputFormat, used)] =
        new Uint8Array(await item.result.blob.arrayBuffer())
    }
    const archive = zipSync(entries, { level: 6 })
    setZipUrl(
      URL.createObjectURL(new Blob([archive], { type: "application/zip" })),
    )
  }

  const ruleHref = `/batch?${buildRuleQuery({
    min: minKb,
    max: maxKb,
    w: targetWidth,
    h: targetHeight,
    format: outputFormat,
    fit,
  })}`

  return (
    <>
      <SeoHead
        title="Batch compress photos to an exact KB range | FormPack"
        description="Compress multiple JPG, PNG, or WebP images to an exact file-size range locally in your browser, then download a ZIP."
        path="/batch"
      />
      <section className="mx-auto w-[min(calc(100%-3rem),var(--shell))] py-[clamp(3rem,7vw,6rem)] pb-[clamp(5rem,10vw,8rem)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 pb-[clamp(2.5rem,5vw,4rem)] max-[50rem]:grid-cols-1 max-[50rem]:items-start">
          <div>
            <div className="inline-flex items-center gap-[.55rem] text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              <span className="home-kicker-dot" aria-hidden="true" />
              {t("batch.kicker")}
            </div>
            <h1 className="my-4 max-w-[12ch] text-[clamp(3.2rem,7vw,6rem)] font-[680] leading-[.9] tracking-[-.075em] [text-wrap:balance]">
              {t("batch.title")}
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] text-[var(--muted)] [text-wrap:pretty]">
              {t("batch.intro")}
            </p>
          </div>
          <div className="max-[50rem]:max-w-none">
            <PrivacyNotice compact />
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] gap-5 max-[50rem]:grid-cols-1">
          <section
            className="min-w-0 border border-[var(--border)] bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-labelledby="batch-source-title"
          >
            <div
              className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]"
              id="batch-source-title"
            >
              {t("batch.add")}
            </div>
            <label className="relative mt-4 flex min-h-52 cursor-pointer flex-col items-center justify-center gap-4 border border-dashed border-[var(--border)] bg-[var(--canvas)] p-6 text-center hover:border-[var(--ink)] hover:bg-[var(--raised)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px]">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,.heic,.heif,image/heic,image/heif"
                onChange={(event) => void addFiles(event)}
                className="absolute h-px w-px overflow-hidden opacity-0"
              />
              <ImagePlus size={34} strokeWidth={1.5} aria-hidden="true" />
              <strong className="text-[1.02rem]">
                {items.length
                  ? t("batch.chooseAnother")
                  : t("batch.choose")}
              </strong>
              <small className="max-w-[34ch] text-[.8rem] text-[var(--muted)]">
                {t("batch.chooseHint")}
              </small>
            </label>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-[.76rem] text-[var(--muted)]">
              <span>
                {items.length} {t("batch.files")} · {formatBytes(totalInputBytes)}
              </span>
              {doneCount > 0 ? (
                <span>
                  {doneCount} {t("batch.files")} · {formatBytes(totalOutputBytes)}
                </span>
              ) : null}
            </div>

            {items.length ? (
              <ul className="batch-list">
                {items.map((item) => (
                  <li className="batch-row" key={item.id}>
                    <div>
                      <strong>{item.file.name}</strong>
                      <small>
                        {formatBytes(item.file.size)}
                        {item.width && item.height
                          ? ` · ${item.width} × ${item.height} px`
                          : ""}
                        {item.result
                          ? ` → ${formatBytes(item.result.blob.size)} · ${item.result.width} × ${item.result.height} px`
                          : ""}
                      </small>
                      {item.error ? (
                        <small className="batch-error">{item.error}</small>
                      ) : null}
                    </div>
                    <span className="batch-status" data-status={item.status}>
                      {item.status === "processing"
                        ? t("batch.compressing")
                        : item.status === "done"
                          ? item.result?.inRange
                            ? t("batch.inRange")
                            : t("batch.closest")
                          : item.status === "error"
                            ? t("batch.error")
                            : t("batch.ready")}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.result ? (
                        <a
                          href={item.result.url}
                          download={`${item.file.name.replace(/\.[^.]+$/, "")}${outputFormat === "PNG" ? ".png" : ".jpg"}`}
                          className="batch-download"
                        >
                          <Download size={14} aria-hidden="true" />{" "}
                          {t("common.download")}
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className="batch-remove"
                        onClick={() => removeItem(item.id)}
                        aria-label={t("batch.remove")}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <form
            className="min-w-0 border border-[var(--border)] bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-busy={processing}
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              {t("batch.rule")}
            </div>
            <div className="mt-4 border-b border-[var(--border)] pb-5">
              <h2 className="m-0 text-[1.45rem] leading-[1.1] tracking-[-.035em]">
                {t("batch.settings")}
              </h2>
              <p className="mt-[.45rem] text-[.86rem] text-[var(--muted)]">
                {t("batch.settingsHint")}
              </p>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("batch.targetSize")}
              </legend>
              <div className="mt-[.55rem] grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("batch.min")}
                  </span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    placeholder="20"
                    value={minKb}
                    onChange={(event) => setMinKb(event.target.value)}
                    className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("batch.max")}
                  </span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    placeholder="50"
                    value={maxKb}
                    onChange={(event) => setMaxKb(event.target.value)}
                    className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("batch.targetDimensions")}
              </legend>
              <div className="mt-[.55rem] grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("batch.width")}
                  </span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    placeholder={t("batch.keepOriginal")}
                    value={targetWidth}
                    onChange={(event) => setTargetWidth(event.target.value)}
                    className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("batch.height")}
                  </span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    placeholder={t("batch.keepOriginal")}
                    value={targetHeight}
                    onChange={(event) => setTargetHeight(event.target.value)}
                    className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
                  />
                </label>
              </div>
              <small className="mt-[.6rem] block text-[.75rem] leading-[1.45] text-[var(--muted)]">
                {t("batch.dimensionHint")}
              </small>
            </fieldset>

            <label className="mt-5 flex flex-col gap-[.45rem]">
              <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("batch.format")}
              </span>
              <select
                value={outputFormat}
                onChange={(event) =>
                  setOutputFormat(event.target.value as "JPEG" | "PNG")
                }
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
              >
                <option>JPEG</option>
                <option>PNG</option>
              </select>
            </label>

            <label className="mt-5 flex flex-col gap-[.45rem]">
              <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("batch.fit")}
              </span>
              <select
                value={fit}
                onChange={(event) => setFit(event.target.value as FitMode)}
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
              >
                <option value="cover">Crop to fill (recommended)</option>
                <option value="contain">Fit inside (add borders)</option>
                <option value="stretch">Stretch to exact dimensions</option>
              </select>
            </label>

            <div className="mt-4">
              <RuleLinkButton href={ruleHref} label={t("batch.share")} />
            </div>

            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5">
              <span className="text-[.76rem] text-[var(--muted)]" role="status">
                {converting
                  ? t("batch.converting")
                  : !items.length
                    ? t("batch.noFiles")
                    : processedCount === items.length && !processing
                      ? `${t("batch.complete")} ${inRangeCount}/${items.length} ${t("batch.inRange")}${
                          errorCount
                            ? ` · ${errorCount} ${t("batch.errors")}`
                            : ""
                        }`
                      : !rangeIsValid
                        ? t("batch.targetSize")
                        : !dimensionsAreValid
                          ? t("batch.dimensionHint")
                          : processing
                            ? t("batch.compressing")
                            : `${t("batch.ready")} · ${items.length} ${t("batch.files")}`}
              </span>
              <button
                type="button"
                disabled={!canCompress}
                onClick={() => void compressAll()}
                className="inline-flex min-h-[3.25rem] w-full items-center justify-between gap-4 border border-[var(--signal)] bg-[var(--signal)] px-4 py-[.8rem] font-bold text-[var(--ink)] transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-[var(--signal-hover)] active:scale-[.96] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--raised)] disabled:text-[var(--quiet)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
              >
                {processing
                  ? t("batch.compressing")
                  : processedCount === items.length && items.length > 0
                    ? t("batch.compressAgain")
                    : t("batch.compress")}{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        <section
          className="mt-[clamp(2rem,4vw,3rem)] border border-[var(--ink)] bg-[var(--surface)]"
          aria-labelledby="batch-results-title"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] p-5">
            <div>
              <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                {t("batch.results")}
              </div>
              <h2
                className="mt-[.65rem] text-[1.45rem] leading-[1.1] tracking-[-.035em]"
                id="batch-results-title"
              >
                {t("batch.resultsTitle")}
              </h2>
            </div>
            <span className="text-[.72rem] text-[var(--muted)]">
              {processedCount}/{items.length} {t("batch.files")} · {inRangeCount}{" "}
              {t("batch.inRange")}
            </span>
          </div>
          <div className="grid gap-4 p-5">
            {doneCount > 0 ? (
              <button
                type="button"
                onClick={() => void downloadZip()}
                className="flex min-h-12 items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.82rem] font-[680] text-[var(--surface)] hover:bg-[var(--signal)]"
              >
                <FileArchive size={17} aria-hidden="true" />{" "}
                {t("batch.downloadAll")}
              </button>
            ) : null}
            {zipUrl ? (
              <a
                href={zipUrl}
                download="formpack-batch.zip"
                className="text-[.8rem] font-[680] text-[var(--ink)] underline underline-offset-4"
              >
                {t("batch.downloadAll")}
              </a>
            ) : null}
            {doneCount === 0 ? (
              <p className="text-[.8rem] leading-[1.55] text-[var(--muted)]">
                {t("batch.noFiles")}
              </p>
            ) : null}
          </div>
        </section>

        <ArticleBlock content={toolContent["/batch"]} className="tool-article" />
      </section>
    </>
  )
}

type CheckRule = {
  format: "JPG" | "PNG" | "PDF"
  minKb: string
  maxKb: string
  width: string
  height: string
  maxPages: string
}

type CheckedFile = {
  file: File
  width?: number
  height?: number
  pageCount?: number
}

type CheckResult = {
  formatPass: boolean
  sizePass: boolean
  dimensionPass: boolean | null
  pagePass: boolean | null
  sizeKb: number
}

export function FileCheckerPage() {
  const { t } = useI18n()
  const initialSearch = new URLSearchParams(window.location.search)
  const initialPresetSlug = initialSearch.get("preset")
  const initialFieldKind = initialSearch.get("field")
  const initialPreset = initialPresetSlug
    ? getExamPreset(initialPresetSlug)
    : undefined
  const initialField =
    initialPreset?.fields.find((field) => field.kind === initialFieldKind) ??
    initialPreset?.fields[0]

  const initialFormat = initialSearch.get("format")
  const [rule, setRule] = useState<CheckRule>({
    format:
      initialFormat === "PNG" || initialFormat === "PDF"
        ? initialFormat
        : initialFormat === "JPG"
          ? "JPG"
          : (initialField?.format ?? "JPG"),
    minKb:
      initialSearch.get("min") ??
      (initialField ? String(initialField.minKb) : ""),
    maxKb:
      initialSearch.get("max") ??
      (initialField ? String(initialField.maxKb) : ""),
    width:
      initialSearch.get("w") ??
      (initialField ? String(initialField.width ?? "") : ""),
    height:
      initialSearch.get("h") ??
      (initialField ? String(initialField.height ?? "") : ""),
    maxPages: initialSearch.get("pages") ?? "",
  })
  const [presetValue, setPresetValue] = useState(
    initialPreset && initialField
      ? `${initialPreset.slug}:${initialField.kind}`
      : "",
  )
  const [picked, setPicked] = useState<CheckedFile | null>(null)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState("")

  const updateRule = (changes: Partial<CheckRule>) => {
    setRule((current) => ({ ...current, ...changes }))
    setPresetValue("")
    setResult(null)
  }

  const applyPreset = (value: string) => {
    setPresetValue(value)
    if (!value) return
    const [slug, kind] = value.split(":")
    const preset = getExamPreset(slug)
    const field = preset?.fields.find((item) => item.kind === kind)
    if (!field) return
    setRule({
      format: field.format,
      minKb: String(field.minKb),
      maxKb: String(field.maxKb),
      width: String(field.width ?? ""),
      height: String(field.height ?? ""),
      maxPages: "",
    })
    setResult(null)
  }

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setChecking(true)
    setResult(null)
    setError("")
    try {
      const normalized = await normalizeImageFile(file)
      if (normalized.type === "application/pdf") {
        const pageCount = await readPdfPageCount(normalized)
        setPicked({ file: normalized, pageCount })
      } else {
        const bitmap = await createImageBitmap(normalized)
        setPicked({
          file: normalized,
          width: bitmap.width,
          height: bitmap.height,
        })
        bitmap.close()
      }
    } catch {
      setPicked(null)
      setError(t("checker.error"))
    } finally {
      setChecking(false)
    }
  }

  const checkFile = () => {
    if (!picked) return
    const formatPass =
      rule.format === "PDF"
        ? picked.file.type === "application/pdf"
        : rule.format === "PNG"
          ? picked.file.type === "image/png"
          : picked.file.type === "image/jpeg"
    const sizeKb = picked.file.size / 1024
    const min = Number(rule.minKb)
    const max = Number(rule.maxKb)
    const sizePass =
      (!rule.minKb.trim() || sizeKb >= min) &&
      (!rule.maxKb.trim() || sizeKb <= max)
    const dimensionPass =
      rule.width.trim() && rule.height.trim()
        ? picked.width === Number(rule.width) &&
          picked.height === Number(rule.height)
        : null
    const pagePass =
      rule.maxPages.trim() && picked.pageCount !== undefined
        ? picked.pageCount <= Number(rule.maxPages)
        : null
    setResult({
      formatPass,
      sizePass,
      dimensionPass,
      pagePass,
      sizeKb,
    })
  }

  const presetOptions = examPresets.flatMap((preset) =>
    preset.fields.map((field) => ({
      value: `${preset.slug}:${field.kind}`,
      label: `${preset.exam} — ${field.label}`,
    })),
  )

  const ruleHref = `/file-checker?${buildRuleQuery({
    format: rule.format,
    min: rule.minKb,
    max: rule.maxKb,
    w: rule.width,
    h: rule.height,
    pages: rule.maxPages,
    preset: presetValue ? presetValue.split(":")[0] : undefined,
    field: presetValue ? presetValue.split(":")[1] : undefined,
  })}`

  const measuredPass = result
    ? result.formatPass &&
      result.sizePass &&
      (result.dimensionPass ?? true) &&
      (result.pagePass ?? true)
    : false

  return (
    <>
      <SeoHead
        title="Will my file pass? Upload rule checker | FormPack"
        description="Check a photo, signature, or PDF against an upload rule locally before you submit it."
        path="/file-checker"
      />
      <section className="mx-auto w-[min(calc(100%-3rem),var(--shell))] py-[clamp(3rem,7vw,6rem)] pb-[clamp(5rem,10vw,8rem)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 pb-[clamp(2.5rem,5vw,4rem)] max-[50rem]:grid-cols-1 max-[50rem]:items-start">
          <div>
            <div className="inline-flex items-center gap-[.55rem] text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              <span className="home-kicker-dot" aria-hidden="true" />
              {t("checker.kicker")}
            </div>
            <h1 className="my-4 max-w-[15ch] text-[clamp(3.2rem,7vw,6rem)] font-[680] leading-[.9] tracking-[-.075em] [text-wrap:balance]">
              {t("checker.title")}
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] text-[var(--muted)] [text-wrap:pretty]">
              {t("checker.intro")}
            </p>
          </div>
          <div className="max-[50rem]:max-w-none">
            <PrivacyNotice compact />
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] gap-5 max-[50rem]:grid-cols-1">
          <section
            className="min-w-0 border border-[var(--border)] bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-labelledby="checker-source-title"
          >
            <div
              className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]"
              id="checker-source-title"
            >
              {t("checker.add")}
            </div>
            <label className="relative mt-4 flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 border border-dashed border-[var(--border)] bg-[var(--canvas)] p-6 text-center hover:border-[var(--ink)] hover:bg-[var(--raised)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px]">
              <input
                type="file"
                accept="image/jpeg,image/png,.heic,.heif,image/heic,image/heif,application/pdf"
                onChange={(event) => void onFile(event)}
                className="absolute h-px w-px overflow-hidden opacity-0"
              />
              {picked?.file.type === "application/pdf" ? (
                <FileText size={34} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <ImagePlus size={34} strokeWidth={1.5} aria-hidden="true" />
              )}
              <strong className="text-[1.02rem]">
                {picked ? picked.file.name : t("checker.choose")}
              </strong>
              <small className="max-w-[36ch] text-[.8rem] text-[var(--muted)]">
                {t("checker.chooseHint")}
              </small>
            </label>

            {picked ? (
              <div className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4 text-[.8rem]">
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted)]">
                    {t("checker.size")}
                  </span>
                  <strong className="[font-family:var(--font-mono)]">
                    {formatBytes(picked.file.size)}
                  </strong>
                </div>
                {picked.width && picked.height ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--muted)]">
                      {t("checker.dimensions")}
                    </span>
                    <strong className="[font-family:var(--font-mono)]">
                      {picked.width} × {picked.height} px
                    </strong>
                  </div>
                ) : null}
                {picked.pageCount !== undefined ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--muted)]">
                      {t("checker.pages")}
                    </span>
                    <strong className="[font-family:var(--font-mono)]">
                      {picked.pageCount}
                    </strong>
                  </div>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 text-[.78rem] text-[var(--danger)]" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-4 border border-[var(--border-soft)] bg-[var(--canvas)] p-4">
              <strong className="text-[.82rem]">{t("checker.visual")}</strong>
              <p className="mt-1 text-[.76rem] leading-[1.5] text-[var(--muted)]">
                {t("checker.visualBody")}
              </p>
            </div>
          </section>

          <form
            className="min-w-0 border border-[var(--border)] bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-busy={checking}
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              {t("checker.rule")}
            </div>
            <div className="mt-4 border-b border-[var(--border)] pb-5">
              <h2 className="m-0 text-[1.45rem] leading-[1.1] tracking-[-.035em]">
                {t("checker.settings")}
              </h2>
            </div>

            <label className="mt-5 grid gap-2 text-[.78rem] font-semibold text-[var(--muted)]">
              {t("checker.preset")}
              <select
                value={presetValue}
                onChange={(event) => applyPreset(event.target.value)}
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base font-normal text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
              >
                <option value="">{t("checker.custom")}</option>
                {presetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 grid gap-2 text-[.78rem] font-semibold text-[var(--muted)]">
              {t("checker.format")}
              <select
                value={rule.format}
                onChange={(event) =>
                  updateRule({
                    format: event.target.value as "JPG" | "PNG" | "PDF",
                  })
                }
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base font-normal text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
              >
                <option>JPG</option>
                <option>PNG</option>
                <option>PDF</option>
              </select>
            </label>

            <fieldset className="mt-5 grid grid-cols-2 gap-3 border-0 p-0">
              <label className="grid gap-2 text-[.76rem] text-[var(--muted)]">
                {t("checker.min")}
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={rule.minKb}
                  onChange={(event) => updateRule({ minKb: event.target.value })}
                  className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
                />
              </label>
              <label className="grid gap-2 text-[.76rem] text-[var(--muted)]">
                {t("checker.max")}
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={rule.maxKb}
                  onChange={(event) => updateRule({ maxKb: event.target.value })}
                  className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
                />
              </label>
            </fieldset>

            <fieldset className="mt-5 grid grid-cols-2 gap-3 border-0 p-0">
              <label className="grid gap-2 text-[.76rem] text-[var(--muted)]">
                {t("checker.width")}
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={rule.width}
                  onChange={(event) => updateRule({ width: event.target.value })}
                  className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
                />
              </label>
              <label className="grid gap-2 text-[.76rem] text-[var(--muted)]">
                {t("checker.height")}
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={rule.height}
                  onChange={(event) => updateRule({ height: event.target.value })}
                  className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
                />
              </label>
            </fieldset>

            <label className="mt-5 grid gap-2 text-[.76rem] text-[var(--muted)]">
              {t("checker.maxPages")}
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={rule.maxPages}
                onChange={(event) => updateRule({ maxPages: event.target.value })}
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]"
              />
            </label>

            <div className="mt-4">
              <RuleLinkButton href={ruleHref} label={t("checker.share")} />
            </div>

            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5">
              <span className="text-[.76rem] text-[var(--muted)]" role="status">
                {checking
                  ? t("checker.checking")
                  : !picked
                    ? t("checker.noFile")
                    : result
                      ? `${t("checker.complete")} ${
                          measuredPass ? t("checker.pass") : t("checker.fail")
                        }`
                      : t("checker.ready")}
              </span>
              <button
                type="button"
                disabled={!picked || checking}
                onClick={checkFile}
                className="inline-flex min-h-[3.25rem] w-full items-center justify-between gap-4 border border-[var(--signal)] bg-[var(--signal)] px-4 py-[.8rem] font-bold text-[var(--ink)] transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-[var(--signal-hover)] active:scale-[.96] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--raised)] disabled:text-[var(--quiet)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
              >
                {checking ? t("checker.checking") : t("checker.check")}{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        <section
          className="mt-[clamp(2rem,4vw,3rem)] border border-[var(--ink)] bg-[var(--surface)]"
          aria-labelledby="checker-results-title"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] p-5">
            <div>
              <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                {t("checker.results")}
              </div>
              <h2
                className="mt-[.65rem] text-[1.45rem] leading-[1.1] tracking-[-.035em]"
                id="checker-results-title"
              >
                {result
                  ? measuredPass
                    ? t("checker.pass")
                    : t("checker.fail")
                  : t("checker.resultsTitle")}
              </h2>
            </div>
            <span className="text-[.72rem] text-[var(--muted)]">
              {picked ? `${picked.file.name} · ${formatBytes(picked.file.size)}` : ""}
            </span>
          </div>
          <div className="grid gap-4 p-5">
            {!picked ? (
              <p className="text-[.8rem] leading-[1.55] text-[var(--muted)]">
                {t("checker.noFile")}
              </p>
            ) : null}
            {result ? (
              <>
                <ul className="grid gap-2 p-0">
                  <CheckLine ready={result.formatPass}>
                    {t("checker.formatCheck")}
                  </CheckLine>
                  <CheckLine ready={result.sizePass}>
                    {t("checker.size")} ({result.sizeKb.toFixed(1)} KB)
                  </CheckLine>
                  {result.dimensionPass !== null ? (
                    <CheckLine ready={result.dimensionPass}>
                      {t("checker.dimensions")}
                    </CheckLine>
                  ) : null}
                  {result.pagePass !== null ? (
                    <CheckLine ready={result.pagePass}>
                      {t("checker.pages")}
                    </CheckLine>
                  ) : null}
                </ul>
                <div className="border border-[var(--border-soft)] bg-[var(--canvas)] p-4">
                  <strong className="text-[.82rem]">{t("checker.visual")}</strong>
                  <p className="mt-1 text-[.76rem] leading-[1.5] text-[var(--muted)]">
                    {t("checker.visualBody")}
                  </p>
                </div>
              </>
            ) : null}
            {picked && !result ? (
              <p className="text-[.8rem] leading-[1.55] text-[var(--muted)]">
                {t("checker.ready")}
              </p>
            ) : null}
          </div>
        </section>

        <ArticleBlock
          content={toolContent["/file-checker"]}
          className="tool-article"
        />
      </section>
    </>
  )
}

export function PdfCompressorPage() {
  const { t } = useI18n()
  const initialSearch = new URLSearchParams(window.location.search)
  const searchMin = initialSearch.get("min") ?? ""
  const searchMax = initialSearch.get("max") ?? ""
  const presetSlug = initialSearch.get("preset") ?? undefined
  const preset = presetSlug ? getExamPreset(presetSlug) : undefined

  const [source, setSource] = useState<File | null>(null)
  const [minKb, setMinKb] = useState(searchMin)
  const [maxKb, setMaxKb] = useState(searchMax)

  useEffect(() => {
    if (searchMin) setMinKb(searchMin)
    if (searchMax) setMaxKb(searchMax)
  }, [searchMin, searchMax])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [result, setResult] = useState<{
    blob: Blob
    url: string
    pageCount: number
    inRange: boolean
  } | null>(null)
  const resultRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!result) return
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [result])

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url)
    }
  }, [result?.url])

  useEffect(() => {
    if (!source) {
      setPageCount(null)
      return
    }
    let cancelled = false
    readPdfPageCount(source)
      .then((count) => {
        if (!cancelled) setPageCount(count)
      })
      .catch(() => {
        if (!cancelled) setPageCount(null)
      })
    return () => {
      cancelled = true
    }
  }, [source])

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSource(file)
      setResult(null)
      setError("")
    }
  }

  const minValue = Number(minKb)
  const maxValue = Number(maxKb)
  const rangeIsValid =
    minKb.trim().length > 0 &&
    maxKb.trim().length > 0 &&
    minValue > 0 &&
    maxValue >= minValue
  const formIsComplete = Boolean(source && rangeIsValid)

  const handleCompress = async () => {
    if (!source || !formIsComplete) return
    setProcessing(true)
    setError("")
    setResult(null)
    track({ name: "tool_started", tool: "pdf-compressor" })
    try {
      const processed = await compressPdfToRange(source, minValue, maxValue)
      setResult({
        blob: processed.blob,
        pageCount: processed.pageCount,
        inRange: processed.inRange,
        url: URL.createObjectURL(processed.blob),
      })
      track({
        name: "tool_completed",
        tool: "pdf-compressor",
        inRange: processed.inRange,
      })
    } catch {
      setError("This PDF could not be read in the browser. Try an unlocked PDF with a valid page structure.")
    } finally {
      setProcessing(false)
    }
  }

  const inputClass =
    "min-h-12 w-full rounded-s border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"

  return (
    <>
      <SeoHead
        title="Compress a PDF to an exact KB range | FormPack"
        description="Compress a PDF to the exact file-size range required by an exam or application portal. Files stay in your browser."
        path="/pdf-compressor"
      />
      <section className="mx-auto w-[min(calc(100%-3rem),var(--shell))] py-[clamp(3rem,7vw,6rem)] pb-[clamp(5rem,10vw,8rem)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 pb-[clamp(2.5rem,5vw,4rem)] max-[50rem]:grid-cols-1 max-[50rem]:items-start">
          <div>
            <div className="inline-flex items-center gap-[.55rem] text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              <span className="home-kicker-dot" aria-hidden="true" />
              {t("pdf.kicker")}
            </div>
            <h1 className="my-4 max-w-[11ch] text-[clamp(3.2rem,7vw,6rem)] font-[680] leading-[.9] tracking-[-.075em] [text-wrap:balance]">
              {t("pdf.title")}
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] text-[var(--muted)] [text-wrap:pretty]">
              {t("pdf.intro")}
            </p>
            {preset ? (
              <p className="preset-loaded">
                {t("pdf.loadedFrom")}{" "}
                <Link to="/presets/$slug" params={{ slug: preset.slug }}>
                  {preset.exam}
                </Link>
                . {t("pdf.confirm")}
              </p>
            ) : null}
          </div>
          <div className="max-[50rem]:max-w-none">
            <PrivacyNotice compact />
          </div>
        </div>

        <AdSlot slot={adSlots.toolTop} className="mb-6" />

        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] gap-px border border-[var(--border)] bg-[var(--border)] max-[50rem]:grid-cols-1">
          <section
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-labelledby="pdf-source-title"
          >
            <div
              className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]"
              id="pdf-source-title"
            >
              {t("pdf.add")}
            </div>
            <label
              className={
                source
                  ? "relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-[var(--ink)] bg-[var(--raised)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80"
                  : "relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-dashed border-[var(--border)] bg-[var(--canvas)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--ink)] hover:bg-[var(--raised)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80"
              }
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={onFile}
                className="absolute h-px w-px overflow-hidden opacity-0"
              />
              {source ? (
                <span className="flex max-w-full flex-col items-center gap-3">
                  <span className="grid h-16 w-16 place-items-center border border-[var(--border)] bg-[var(--surface)] text-[var(--proof)] [outline:1px_solid_oklch(0_0_0_/_0.1)]">
                    <FileText size={32} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <strong className="max-w-[28ch] overflow-hidden text-ellipsis whitespace-nowrap text-[1.08rem] tracking-[-.02em]">
                    {source.name}
                  </strong>
                  <small className="text-[.82rem] text-[var(--muted)]">
                    PDF ready for the portal rule
                  </small>
                </span>
              ) : (
                <span className="flex flex-col items-center gap-[.6rem] [&>svg]:mb-2 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.5]">
                  <FileText aria-hidden="true" />
                  <strong className="text-[1.08rem] tracking-[-.02em]">
                    {t("pdf.choose")}
                  </strong>
                  <small className="max-w-[28ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">
                    {t("pdf.chooseHint")}
                  </small>
                </span>
              )}
              <span className="inline-flex min-h-11 items-center gap-[.45rem] border border-[var(--ink)] bg-[var(--surface)] px-[.85rem] py-[.65rem] text-[.82rem] font-bold text-[var(--ink)]">
                {source ? t("pdf.chooseAnother") : t("pdf.choose")}
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </label>

            <div
              className="mt-4 grid grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,.85fr))] gap-4 border-t border-[var(--border)] pt-4 max-[32rem]:grid-cols-1 max-[32rem]:gap-[.85rem]"
              aria-live="polite"
            >
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Source file
                </span>
                <strong className="[overflow-wrap:anywhere] text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {source?.name ?? "No PDF selected"}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Current size
                </span>
                <strong className="[overflow-wrap:anywhere] text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {source ? formatBytes(source.size) : "—"}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Pages
                </span>
                <strong className="text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {pageCount ?? "—"}
                </strong>
              </div>
            </div>
          </section>

          <form
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              {t("pdf.rule")}
            </div>
            <div className="mt-4 border-b border-[var(--border)] pb-5">
              <h2 className="m-0 text-[1.45rem] leading-[1.1] tracking-[-.035em]">
                {t("pdf.settings")}
              </h2>
              <p className="mt-[.45rem] text-[.86rem] text-[var(--muted)]">
                {t("pdf.settingsHint")}
              </p>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[.78rem] font-semibold text-[var(--muted)]">
                {t("pdf.targetSize")}
              </legend>
              <div className="mt-[.55rem] grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("pdf.min")}
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="75"
                      value={minKb}
                      onChange={(event) => setMinKb(event.target.value)}
                      aria-invalid={minKb.length > 0 && minValue <= 0}
                      className={inputClass}
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      KB
                    </span>
                  </div>
                </label>
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    {t("pdf.max")}
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="100"
                      value={maxKb}
                      onChange={(event) => setMaxKb(event.target.value)}
                      aria-invalid={maxKb.length > 0 && maxValue < minValue}
                      className={inputClass}
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      KB
                    </span>
                  </div>
                </label>
              </div>
              <small className="mt-[.6rem] block text-[.75rem] leading-[1.45] text-[var(--muted)] [text-wrap:pretty]">
                Example: a portal may require 75–100 KB. Always copy the current
                rule from your form.
              </small>
            </fieldset>

            <div className="mt-5 border border-[var(--signal)] bg-[color-mix(in_oklch,var(--signal)_10%,var(--surface))] p-4">
              <div className="flex items-start gap-3">
                <FileWarning
                  className="mt-0.5 shrink-0 text-[var(--signal)]"
                  size={18}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <div>
                  <strong className="text-[.82rem]">
                    Important before you compress
                  </strong>
                  <p className="mt-1 text-[.78rem] leading-[1.5] text-[var(--muted)] [text-wrap:pretty]">
                    This pass rasterizes the PDF locally. Selectable or
                    searchable text becomes an image, so the file can shrink.
                    Review the result for legibility before you submit it.
                  </p>
                </div>
              </div>
            </div>

            {rangeIsValid ? (
              <RuleLinkButton
                className="mt-4"
                href={`/pdf-compressor?${buildRuleQuery({
                  min: minKb,
                  max: maxKb,
                  preset: presetSlug,
                })}`}
                label={t("pdf.share")}
              />
            ) : null}

            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5">
              <span
                className="text-[.76rem] text-[var(--muted)] [text-wrap:pretty]"
                role="status"
              >
                {error
                  ? error
                  : processing
                    ? t("pdf.preparing")
                    : result
                      ? t("pdf.resultReady")
                      : formIsComplete
                        ? t("pdf.ready")
                        : t("pdf.complete")}
              </span>
              <button
                className="inline-flex min-h-[3.25rem] w-full items-center justify-between gap-4 border border-[var(--signal)] bg-[var(--signal)] px-4 py-[.8rem] font-bold text-[var(--ink)] transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-[var(--signal-hover)] active:scale-[.96] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--raised)] disabled:text-[var(--quiet)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
                type="submit"
                disabled={!formIsComplete || processing}
                onClick={() => void handleCompress()}
              >
                {processing
                  ? t("pdf.processing")
                  : result
                    ? t("pdf.compressAgain")
                    : t("pdf.compress")}{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        <section
          ref={resultRef}
          className="mt-[clamp(2rem,4vw,3rem)] border border-[var(--ink)] bg-[var(--surface)]"
          aria-labelledby="pdf-output-title"
        >
          <div className="flex items-end justify-between gap-8 border-b border-[var(--border)] p-5 max-[50rem]:flex-col max-[50rem]:items-start max-[50rem]:gap-4">
            <div>
              <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                {t("pdf.check")}
              </div>
              <h2
                className="mt-[.65rem] text-[1.45rem] leading-[1.1] tracking-[-.035em]"
                id="pdf-output-title"
              >
                {t("pdf.waiting")}
              </h2>
            </div>
            <span className={`whitespace-nowrap text-[.68rem] uppercase tracking-[.05em] [font-family:var(--font-mono)] max-[50rem]:whitespace-normal ${result?.inRange ? "text-[var(--ready)]" : "text-[var(--proof)]"}`}>
              {result
                ? result.inRange
                  ? t("pdf.inRange")
                  : t("pdf.closest")
                : t("pdf.waitingOutput")}
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)] gap-px bg-[var(--border)] max-[50rem]:grid-cols-1">
            <div className="flex min-h-[17rem] flex-col items-center justify-center bg-[var(--canvas)] p-[clamp(1.25rem,3vw,2rem)] text-center [&>svg]:mb-4 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.5]">
              {result ? <iframe src={result.url} title="Compressed PDF preview" className="h-64 w-full max-w-[22rem] rounded border border-[var(--border)] bg-white" /> : <><FileText size={42} aria-hidden="true" /><strong className="text-[1.05rem]">Result preview</strong><p className="mt-2 max-w-[34ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">Run the local pass to compare the finished PDF with your portal rule.</p></>}
            </div>
            <div className="grid content-center gap-5 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]">
              {result ? <>
                <div className="border-b border-[var(--border-soft)] pb-5"><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Result status</span><p className="mt-[.45rem] text-[.9rem] font-[680]">{result.inRange ? "Inside the requested range" : "Closest achievable result"}</p><p className="mt-1 text-[.8rem] leading-[1.5] text-[var(--muted)]">{result.inRange ? "The rewritten PDF is inside the size range you entered." : "This best-effort rewrite could not reach the range. Try a wider range or a lower-resolution source PDF."}</p></div>
                <div className="grid grid-cols-2 gap-3 border-b border-[var(--border-soft)] pb-5"><div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Final size</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{formatBytes(result.blob.size)}</strong></div><div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Pages</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{result.pageCount}</strong></div></div>
                <a href={result.url} download="formpack-compressed.pdf" className="flex min-h-12 items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.82rem] font-[680] text-[var(--surface)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--signal)] active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"><Download size={17} strokeWidth={1.9} aria-hidden="true" /> Download result</a>
              </> : <>
              <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  What happens next
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  FormPack rewrites the PDF locally and reports whether the
                  result lands between your minimum and maximum size.
                </p>
              </div>
              <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  If the range cannot be reached
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  You will get the closest result with a plain explanation and a
                  suggestion to reduce dimensions or raise the maximum.
                </p>
              </div>
              </>}
            </div>
          </div>
        </section>

        <ArticleBlock
          content={toolContent["/pdf-compressor"]}
          className="tool-article"
        />

        <AdSlot slot={adSlots.toolBottom} className="mt-6" />
      </section>
    </>
  )
}

export function PhotoToPdfPage() {
  const [images, setImages] = useState<File[]>([])
  const [minKb, setMinKb] = useState("")
  const [maxKb, setMaxKb] = useState("")
  const [pageSize, setPageSize] = useState("A4")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ blob: Blob; url: string; inRange: boolean } | null>(null)
  const resultRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!result) return
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [result])

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url)
    }
  }, [result?.url])

  const addImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (!rawFiles.length) return
    try {
      const nextFiles = await normalizeImageFiles(rawFiles)
      setImages((current) => [...current, ...nextFiles])
      setResult(null)
      setError("")
    } catch {
      setError(
        "One of the HEIC images could not be converted. Try JPG or PNG copies.",
      )
    }
  }

  const removeImage = (index: number) => {
    setImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    )
    setResult(null)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return
    setImages((current) => {
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    setResult(null)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault()
    if (dragIndex !== null && dragIndex !== targetIndex) {
      moveImage(dragIndex, targetIndex)
    }
    setDragIndex(null)
  }

  const minValue = Number(minKb)
  const maxValue = Number(maxKb)
  const rangeIsValid =
    (minKb.trim().length === 0 && maxKb.trim().length === 0) ||
    (minKb.trim().length > 0 &&
      maxKb.trim().length > 0 &&
      minValue > 0 &&
      maxValue >= minValue)
  const formIsComplete = images.length >= 2 && rangeIsValid

  const handleCombine = async () => {
    if (!formIsComplete) return
    setProcessing(true)
    setError("")
    setResult(null)
    track({ name: "tool_started", tool: "photo-to-pdf" })
    try {
      const hasRange = minKb.trim().length > 0 && maxKb.trim().length > 0
      const processed = await imagesToPdfRange(
        images,
        pageSize === "Letter" ? "Letter" : "A4",
        hasRange ? minValue : 0,
        hasRange ? maxValue : Number.MAX_SAFE_INTEGER / 1024,
      )
      setResult({ ...processed, url: URL.createObjectURL(processed.blob) })
      track({
        name: "tool_completed",
        tool: "photo-to-pdf",
        inRange: processed.inRange,
      })
    } catch {
      setError("The images could not be combined in this browser. Try JPG or PNG files with valid image data.")
    } finally {
      setProcessing(false)
    }
  }

  const inputClass =
    "min-h-12 w-full rounded-s border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"

  return (
    <>
      <SeoHead
        title="Combine photos into a PDF | FormPack"
        description="Combine two or more photos into one PDF locally in your browser, with an optional target size range."
        path="/photo-to-pdf"
      />
      <section className="mx-auto w-[min(calc(100%-3rem),var(--shell))] py-[clamp(3rem,7vw,6rem)] pb-[clamp(5rem,10vw,8rem)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 pb-[clamp(2.5rem,5vw,4rem)] max-[50rem]:grid-cols-1 max-[50rem]:items-start">
          <div>
            <div className="inline-flex items-center gap-[.55rem] text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              <span className="home-kicker-dot" aria-hidden="true" />
              Photo to PDF / local processing
            </div>
            <h1 className="my-4 max-w-[10ch] text-[clamp(3.2rem,7vw,6rem)] font-[680] leading-[.9] tracking-[-.075em] [text-wrap:balance]">
              Put every required image in one file.
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] text-[var(--muted)] [text-wrap:pretty]">
              Add a photo, signature, or thumb impression. FormPack will place
              each image on its own PDF page on this device.
            </p>
          </div>
          <div className="max-[50rem]:max-w-none">
            <PrivacyNotice compact />
          </div>
        </div>

        <AdSlot slot={adSlots.toolTop} className="mb-6" />

        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] gap-px border border-[var(--border)] bg-[var(--border)] max-[50rem]:grid-cols-1">
          <section
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-labelledby="photo-pdf-source-title"
          >
            <div
              className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]"
              id="photo-pdf-source-title"
            >
              01 / Add your images
            </div>
            {images.length === 0 ? (
              <label className="relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-dashed border-[var(--border)] bg-[var(--canvas)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--ink)] hover:bg-[var(--raised)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80">
                <input
                  type="file"
                  accept="image/jpeg,image/png,.heic,.heif,image/heic,image/heif"
                  multiple
                  onChange={addImages}
                  className="absolute h-px w-px overflow-hidden opacity-0"
                />
                <span className="flex flex-col items-center gap-[.6rem] [&>svg]:mb-2 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.5]">
                  <ImagePlus aria-hidden="true" />
                  <strong className="text-[1.08rem] tracking-[-.02em]">
                    Choose your first image
                  </strong>
                  <small className="max-w-[28ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">
                    JPG or PNG. Add more after this one.
                  </small>
                </span>
                <span className="inline-flex min-h-11 items-center gap-[.45rem] border border-[var(--ink)] bg-[var(--surface)] px-[.85rem] py-[.65rem] text-[.82rem] font-bold text-[var(--ink)]">
                  Choose an image <ArrowRight size={15} aria-hidden="true" />
                </span>
              </label>
            ) : (
              <div
                className="mt-4 border border-[var(--border)] bg-[var(--canvas)]"
                aria-live="polite"
              >
                {images.map((image, index) => (
                  <div
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--border-soft)] bg-[var(--surface)] p-4 last:border-b-0"
                    draggable
                    key={`${image.name}-${image.lastModified}-${index}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onDrop={(event) => onDrop(event, index)}
                  >
                    <GripVertical
                      className="cursor-grab text-[var(--quiet)]"
                      size={18}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[.9rem]">
                        {image.name}
                      </strong>
                      <span className="text-[.76rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                        Page {index + 1} · {formatBytes(image.size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="grid min-h-9 min-w-9 place-items-center border border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--raised)] disabled:cursor-not-allowed disabled:opacity-40"
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        disabled={index === 0}
                        aria-label={`Move ${image.name} up`}
                      >
                        <ArrowUp
                          size={15}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        className="grid min-h-9 min-w-9 place-items-center border border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--raised)] disabled:cursor-not-allowed disabled:opacity-40"
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        disabled={index === images.length - 1}
                        aria-label={`Move ${image.name} down`}
                      >
                        <ArrowDown
                          size={15}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        className="grid min-h-9 min-w-9 place-items-center border border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--raised)] disabled:cursor-not-allowed disabled:opacity-40"
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove ${image.name}`}
                      >
                        <Trash2
                          size={16}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                ))}
                <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 border-t border-[var(--border)] bg-[var(--canvas)] px-4 text-[.82rem] font-bold text-[var(--ink)] hover:bg-[var(--raised)]">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,.heic,.heif,image/heic,image/heif"
                    multiple
                    onChange={addImages}
                    className="absolute h-px w-px overflow-hidden opacity-0"
                  />
                  <Plus size={16} aria-hidden="true" /> Add another image
                </label>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4 text-[.76rem] text-[var(--muted)] [text-wrap:pretty]">
              <span>
                {images.length === 0
                  ? "No images selected"
                  : `${images.length} ${images.length === 1 ? "image" : "images"} ready to arrange`}
              </span>
              <span className="whitespace-nowrap text-[var(--proof)] [font-family:var(--font-mono)]">
                One image = one page
              </span>
            </div>
          </section>

          <form
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              02 / Set the PDF rule
            </div>
            <div className="mt-4 border-b border-[var(--border)] pb-5">
              <h2 className="m-0 text-[1.45rem] leading-[1.1] tracking-[-.035em]">
                Output settings
              </h2>
              <p className="mt-[.45rem] text-[.86rem] text-[var(--muted)]">
                A4 is the safe default for application portals.
              </p>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[.78rem] font-semibold text-[var(--muted)]">
                Target file size <span className="font-normal">(optional)</span>
              </legend>
              <div className="mt-[.55rem] grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    Minimum
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="75"
                      value={minKb}
                      onChange={(event) => setMinKb(event.target.value)}
                      aria-invalid={minKb.length > 0 && minValue <= 0}
                      className={inputClass}
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      KB
                    </span>
                  </div>
                </label>
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    Maximum
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="200"
                      value={maxKb}
                      onChange={(event) => setMaxKb(event.target.value)}
                      aria-invalid={maxKb.length > 0 && maxValue < minValue}
                      className={inputClass}
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      KB
                    </span>
                  </div>
                </label>
              </div>
              <small className="mt-[.6rem] block text-[.75rem] leading-[1.45] text-[var(--muted)] [text-wrap:pretty]">
                Leave both blank when the portal only asks for a PDF.
              </small>
            </fieldset>

            <label className="mt-5 flex min-w-0 flex-col gap-[.45rem]">
              <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                Page size
              </span>
              <select
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value)}
              >
                <option>A4</option>
                <option>Letter</option>
                <option>Original image ratio</option>
              </select>
            </label>

            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5">
              <span
                className="text-[.76rem] text-[var(--muted)] [text-wrap:pretty]"
                role="status"
              >
                {error
                  ? error
                  : processing
                    ? "Building the PDF locally…"
                    : result
                      ? "Result ready below."
                      : formIsComplete
                        ? "Ready to build the PDF locally."
                        : images.length < 2
                          ? "Add at least two images to continue."
                          : rangeIsValid
                            ? "Add an optional size range or continue."
                            : "Set a valid minimum and maximum."}
              </span>
              <button
                className="inline-flex min-h-[3.25rem] w-full items-center justify-between gap-4 border border-[var(--signal)] bg-[var(--signal)] px-4 py-[.8rem] font-bold text-[var(--ink)] transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-[var(--signal-hover)] active:scale-[.96] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--raised)] disabled:text-[var(--quiet)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
                type="submit"
                disabled={!formIsComplete || processing}
                onClick={() => void handleCombine()}
              >
                {processing ? "Building…" : result ? "Build again" : "Combine & compress"}{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        <section
          ref={resultRef}
          className="mt-[clamp(2rem,4vw,3rem)] border border-[var(--ink)] bg-[var(--surface)]"
          aria-labelledby="photo-pdf-output-title"
        >
          <div className="flex items-end justify-between gap-8 border-b border-[var(--border)] p-5 max-[50rem]:flex-col max-[50rem]:items-start max-[50rem]:gap-4">
            <div>
              <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                03 / Check the result
              </div>
              <h2
                className="mt-[.65rem] text-[1.45rem] leading-[1.1] tracking-[-.035em]"
                id="photo-pdf-output-title"
              >
                Your combined PDF will appear here.
              </h2>
            </div>
            <span className={`whitespace-nowrap text-[.68rem] uppercase tracking-[.05em] [font-family:var(--font-mono)] max-[50rem]:whitespace-normal ${result?.inRange ? "text-[var(--ready)]" : "text-[var(--proof)]"}`}>
              {result ? (result.inRange ? "In range" : "Closest result") : "Waiting for output"}
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)] gap-px bg-[var(--border)] max-[50rem]:grid-cols-1">
            <div className="flex min-h-[17rem] flex-col items-center justify-center bg-[var(--canvas)] p-[clamp(1.25rem,3vw,2rem)] text-center [&>svg]:mb-4 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.5]">
              {result ? <iframe src={result.url} title="Combined PDF preview" className="h-64 w-full max-w-[22rem] rounded border border-[var(--border)] bg-white" /> : <><FileText size={42} aria-hidden="true" /><strong className="text-[1.05rem]">PDF preview</strong><p className="mt-2 max-w-[34ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">Run the local pass to preview your ordered images as PDF pages.</p></>}
            </div>
            <div className="grid content-center gap-5 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]">
              {result ? <>
                <div className="border-b border-[var(--border-soft)] pb-5"><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Result status</span><p className="mt-[.45rem] text-[.9rem] font-[680]">{result.inRange ? "Inside the requested range" : "Closest achievable result"}</p><p className="mt-1 text-[.8rem] leading-[1.5] text-[var(--muted)]">{result.inRange ? "The ordered images are combined into a PDF inside your requested range." : "The PDF is ready, but the optional range could not be reached with these images. Try a wider range or smaller source images."}</p></div>
                <div className="grid grid-cols-2 gap-3 border-b border-[var(--border-soft)] pb-5"><div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Final size</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{formatBytes(result.blob.size)}</strong></div><div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Pages</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{images.length}</strong></div></div>
                <a href={result.url} download="formpack-images.pdf" className="flex min-h-12 items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.82rem] font-[680] text-[var(--surface)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--signal)] active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"><Download size={17} strokeWidth={1.9} aria-hidden="true" /> Download result</a>
              </> : <>
              <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  What happens next
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  Each image becomes one page, in the order you set, and stays
                  inside your browser.
                </p>
              </div>
              <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  If a size range is set
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  FormPack adjusts image quality until the combined PDF reaches
                  the closest possible result.
                </p>
              </div>
              </>}
            </div>
          </div>
        </section>

        <ArticleBlock
          content={toolContent["/photo-to-pdf"]}
          className="tool-article"
        />

        <AdSlot slot={adSlots.toolBottom} className="mt-6" />
      </section>
    </>
  )
}

export function ImageDimensionsPage() {
  const [source, setSource] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [sourceDimensions, setSourceDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [targetWidth, setTargetWidth] = useState("")
  const [targetHeight, setTargetHeight] = useState("")
  const [outputFormat, setOutputFormat] = useState("Keep original")
  const [fit, setFit] = useState<FitMode>("cover")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{
    blob: Blob
    url: string
    width: number
    height: number
    format: ImageOutputFormat
  } | null>(null)

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url)
    }
  }, [result])

  useEffect(() => {
    if (!source) {
      setPreviewUrl("")
      setSourceDimensions(null)
      return
    }

    const nextUrl = URL.createObjectURL(source)
    const image = new Image()
    image.onload = () => {
      setSourceDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.src = nextUrl
    setPreviewUrl(nextUrl)

    return () => {
      image.onload = null
      URL.revokeObjectURL(nextUrl)
    }
  }, [source])

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setResult(null)
    setError("")
    try {
      setSource(await normalizeImageFile(file))
    } catch {
      setError("The HEIC image could not be converted. Try a JPG or PNG copy.")
    }
  }

  const dimensionsAreValid =
    targetWidth.trim().length > 0 &&
    targetHeight.trim().length > 0 &&
    Number(targetWidth) > 0 &&
    Number(targetHeight) > 0
  const formIsComplete = Boolean(source && dimensionsAreValid)

  const handleResize = async () => {
    if (!source || !dimensionsAreValid) return
    setProcessing(true)
    setError("")
    try {
      const width = Number(targetWidth)
      const height = Number(targetHeight)
      const format: ImageOutputFormat =
        outputFormat === "PNG"
          ? "PNG"
          : outputFormat === "JPEG"
            ? "JPEG"
            : source.type === "image/png"
              ? "PNG"
              : "JPEG"
      const blob = await imageToBlob(source, width, height, format, undefined, fit)
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        width,
        height,
        format,
      })
    } catch (processingError) {
      setError(
        processingError instanceof Error
          ? processingError.message
          : "The image could not be resized in this browser.",
      )
    } finally {
      setProcessing(false)
    }
  }

  const inputClass =
    "min-h-12 w-full rounded-s border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"

  return (
    <>
      <SeoHead
        title="Resize an image to exact dimensions | FormPack"
        description="Resize a JPG or PNG image to exact pixel dimensions locally in your browser."
        path="/quick-tools/image-dimensions"
      />
      <section className="mx-auto w-[min(calc(100%-3rem),var(--shell))] py-[clamp(3rem,7vw,6rem)] pb-[clamp(5rem,10vw,8rem)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 pb-[clamp(2.5rem,5vw,4rem)] max-[50rem]:grid-cols-1 max-[50rem]:items-start">
          <div>
            <div className="inline-flex items-center gap-[.55rem] text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              <span className="home-kicker-dot" aria-hidden="true" />
              Image dimensions / local processing
            </div>
            <h1 className="my-4 max-w-[10ch] text-[clamp(3.2rem,7vw,6rem)] font-[680] leading-[.9] tracking-[-.075em] [text-wrap:balance]">
              Make every pixel match the form.
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] text-[var(--muted)] [text-wrap:pretty]">
              Upload one image and enter the exact width and height your portal
              asks for. The resized file stays on this device.
            </p>
          </div>
          <div className="max-[50rem]:max-w-none">
            <PrivacyNotice compact />
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] gap-px border border-[var(--border)] bg-[var(--border)] max-[50rem]:grid-cols-1">
          <section
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-labelledby="dimensions-source-title"
          >
            <div
              className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]"
              id="dimensions-source-title"
            >
              01 / Add your image
            </div>
            <label
              className={
                source
                  ? "relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-[var(--ink)] bg-[var(--raised)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80"
                  : "relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-dashed border-[var(--border)] bg-[var(--canvas)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--ink)] hover:bg-[var(--raised)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80"
              }
            >
              <input
                type="file"
                accept="image/jpeg,image/png,.heic,.heif,image/heic,image/heif"
                onChange={onFile}
                className="absolute h-px w-px overflow-hidden opacity-0"
              />
              {source && previewUrl ? (
                <span className="flex max-h-64 w-full max-w-[18rem] items-center justify-center overflow-hidden bg-[var(--surface)] [background-image:linear-gradient(45deg,var(--raised)_25%,transparent_25%),linear-gradient(-45deg,var(--raised)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--raised)_75%),linear-gradient(-45deg,transparent_75%,var(--raised)_75%)] [background-position:0_0,0_.5rem,.5rem_-.5rem,-.5rem_0] [background-size:1rem_1rem] [outline:1px_solid_oklch(0_0_0_/_0.1)]">
                  <img
                    className="max-h-64 max-w-full object-contain [outline:1px_solid_oklch(0_0_0_/_0.1)]"
                    src={previewUrl}
                    alt="Selected image preview"
                  />
                </span>
              ) : (
                <span className="flex flex-col items-center gap-[.6rem] [&>svg]:mb-2 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.5]">
                  <ImagePlus aria-hidden="true" />
                  <strong className="text-[1.08rem] tracking-[-.02em]">
                    Choose a JPG or PNG
                  </strong>
                  <small className="max-w-[28ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">
                    Use your camera, gallery, or device storage.
                  </small>
                </span>
              )}
              <span className="inline-flex min-h-11 items-center gap-[.45rem] border border-[var(--ink)] bg-[var(--surface)] px-[.85rem] py-[.65rem] text-[.82rem] font-bold text-[var(--ink)]">
                {source ? "Choose another image" : "Choose an image"}
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </label>
            <div
              className="mt-4 grid grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,.85fr))] gap-4 border-t border-[var(--border)] pt-4 max-[32rem]:grid-cols-1 max-[32rem]:gap-[.85rem]"
              aria-live="polite"
            >
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Source file
                </span>
                <strong className="[overflow-wrap:anywhere] text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {source?.name ?? "No image selected"}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Current size
                </span>
                <strong className="text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {source ? formatBytes(source.size) : "—"}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Dimensions
                </span>
                <strong className="text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {sourceDimensions
                    ? `${sourceDimensions.width} × ${sourceDimensions.height} px`
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          <form
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              02 / Set the pixel rule
            </div>
            <div className="mt-4 border-b border-[var(--border)] pb-5">
              <h2 className="m-0 text-[1.45rem] leading-[1.1] tracking-[-.035em]">
                Exact dimensions
              </h2>
              <p className="mt-[.45rem] text-[.86rem] text-[var(--muted)]">
                Use the width and height printed beside the upload field.
              </p>
            </div>
            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[.78rem] font-semibold text-[var(--muted)]">
                Target dimensions
              </legend>
              <div className="mt-[.55rem] grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    Width
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="600"
                      value={targetWidth}
                      onChange={(event) => setTargetWidth(event.target.value)}
                      aria-invalid={
                        targetWidth.length > 0 && Number(targetWidth) <= 0
                      }
                      className={inputClass}
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      px
                    </span>
                  </div>
                </label>
                <label className="flex min-w-0 flex-col gap-[.45rem]">
                  <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                    Height
                  </span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="800"
                      value={targetHeight}
                      onChange={(event) => setTargetHeight(event.target.value)}
                      aria-invalid={
                        targetHeight.length > 0 && Number(targetHeight) <= 0
                      }
                      className={inputClass}
                    />
                    <span className="grid min-w-12 place-items-center rounded-e border border-s border-[var(--border)] bg-[var(--raised)] text-[.7rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                      px
                    </span>
                  </div>
                </label>
              </div>
              <small className="mt-[.6rem] block text-[.75rem] leading-[1.45] text-[var(--muted)] [text-wrap:pretty]">
                Exact pixel dimensions can change the image’s aspect ratio. Copy
                the portal rule precisely.
              </small>
            </fieldset>
            <label className="mt-5 flex min-w-0 flex-col gap-[.45rem]">
              <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                Output format
              </span>
              <select
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                value={outputFormat}
                onChange={(event) => setOutputFormat(event.target.value)}
              >
                <option>Keep original</option>
                <option>JPEG</option>
                <option>PNG</option>
              </select>
            </label>
            <label className="mt-5 flex min-w-0 flex-col gap-[.45rem]">
              <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                Fit mode
              </span>
              <select
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                value={fit}
                onChange={(event) => setFit(event.target.value as FitMode)}
              >
                <option value="cover">Crop to fill (recommended)</option>
                <option value="contain">Fit inside (add borders)</option>
                <option value="stretch">Stretch to exact dimensions</option>
              </select>
              <small className="text-[.75rem] leading-[1.45] text-[var(--muted)] [text-wrap:pretty]">
                “Crop to fill” avoids stretching the image. Use “Stretch” only
                when the portal expects the exact pixels regardless of shape.
              </small>
            </label>
            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5">
              <span
                className="text-[.76rem] text-[var(--muted)] [text-wrap:pretty]"
                role="status"
              >
                {error ||
                  (processing
                    ? "Resizing locally…"
                    : formIsComplete
                      ? "Ready for the local resize engine."
                      : "Add an image and complete both pixel fields.")}
              </span>
              <button
                className={
                  formIsComplete && !processing
                    ? "inline-flex min-h-[3.25rem] w-full items-center justify-between gap-4 border border-[var(--signal)] bg-[var(--signal)] px-4 py-[.8rem] font-bold text-[var(--ink)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--signal-hover)] active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
                    : "inline-flex min-h-[3.25rem] w-full cursor-not-allowed items-center justify-between gap-4 border border-[var(--border)] bg-[var(--raised)] px-4 py-[.8rem] font-bold text-[var(--quiet)]"
                }
                type="submit"
                disabled={!formIsComplete || processing}
                onClick={handleResize}
              >
                {processing ? "Resizing…" : "Resize image"} <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        <section
          className="mt-[clamp(3rem,7vw,6rem)] border border-[var(--ink)] bg-[var(--surface)]"
          aria-labelledby="dimensions-output-title"
        >
          <div className="flex items-end justify-between gap-8 border-b border-[var(--border)] p-5 max-[50rem]:flex-col max-[50rem]:items-start max-[50rem]:gap-4">
            <div>
              <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                03 / Check the result
              </div>
              <h2
                className="mt-[.65rem] text-[1.45rem] leading-[1.1] tracking-[-.035em]"
                id="dimensions-output-title"
              >
                {result ? "Your exact-size image is ready." : "Your exact-size image will appear here."}
              </h2>
            </div>
            <span className="whitespace-nowrap text-[.68rem] uppercase tracking-[.05em] text-[var(--proof)] [font-family:var(--font-mono)] max-[50rem]:whitespace-normal">
              Preview shell
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)] gap-px bg-[var(--border)] max-[50rem]:grid-cols-1">
            <div className="flex min-h-[17rem] flex-col items-center justify-center bg-[var(--canvas)] p-[clamp(1.25rem,3vw,2rem)] text-center [&>svg]:mb-4 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.5]">
              {result ? (
                <img
                  src={result.url}
                  alt="Resized image preview"
                  className="max-h-64 max-w-full border border-[var(--border)] object-contain bg-white"
                />
              ) : (
                <>
                  <ImagePlus size={42} aria-hidden="true" />
                  <strong className="text-[1.05rem]">Result preview</strong>
                  <p className="mt-2 max-w-[34ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">
                    The processing pass will show the resized image, final
                    dimensions, and output format here.
                  </p>
                </>
              )}
            </div>
            <div className="grid content-center gap-5 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]">
              {result ? (
                <>
                  <div className="border-b border-[var(--border-soft)] pb-5">
                    <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Result status</span>
                    <p className="mt-[.45rem] text-[.9rem] font-[680]">Exact dimensions applied</p>
                    <p className="mt-1 text-[.8rem] leading-[1.5] text-[var(--muted)]">The image was resized locally and is ready for a visual check before upload.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-b border-[var(--border-soft)] pb-5">
                    <div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Dimensions</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{result.width} × {result.height} px</strong></div>
                    <div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">File size</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{formatBytes(result.blob.size)}</strong></div>
                  </div>
                  <a href={result.url} download={`formpack-resized.${result.format === "PNG" ? "png" : "jpg"}`} className="flex min-h-12 items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.82rem] font-[680] text-[var(--surface)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--signal)] active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"><Download size={17} strokeWidth={1.9} aria-hidden="true" /> Download resized image</a>
                </>
              ) : <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  What happens next
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  FormPack resizes the image locally to the exact width and
                  height you entered.
                </p>
              </div>}
              <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Keep the portal rule visible
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  If the result looks stretched, check whether the portal
                  expects a crop or a different aspect ratio.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ArticleBlock
          content={toolContent["/quick-tools/image-dimensions"]}
          className="tool-article"
        />
      </section>
    </>
  )
}

export function SignaturePage() {
  const initialSearch = new URLSearchParams(window.location.search)
  const presetSlug = initialSearch.get("preset") ?? undefined
  const fieldKind = initialSearch.get("field") ?? undefined
  const preset = presetSlug ? getExamPreset(presetSlug) : undefined
  const presetField =
    preset?.fields.find((field) => field.kind === fieldKind) ??
    preset?.fields.find((field) => field.kind === "signature")
  const signatureRuleHref = presetField
    ? `/photo-compressor?${buildRuleQuery({
        min: String(presetField.minKb),
        max: String(presetField.maxKb),
        w: String(presetField.width ?? ""),
        h: String(presetField.height ?? ""),
        format: presetField.format,
        preset: preset?.slug,
        field: presetField.kind,
      })}`
    : ""

  const [source, setSource] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [sourceDimensions, setSourceDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [cropPreset, setCropPreset] = useState("3:1 signature strip")
  const [removeBackground, setRemoveBackground] = useState(true)
  const [trimEdges, setTrimEdges] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null)

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url)
    }
  }, [result])

  useEffect(() => {
    if (!source) {
      setPreviewUrl("")
      setSourceDimensions(null)
      return
    }

    const nextUrl = URL.createObjectURL(source)
    const image = new Image()
    image.onload = () => {
      setSourceDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.src = nextUrl
    setPreviewUrl(nextUrl)

    return () => {
      image.onload = null
      URL.revokeObjectURL(nextUrl)
    }
  }, [source])

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setResult(null)
    setError("")
    try {
      setSource(await normalizeImageFile(file))
    } catch {
      setError(
        "The HEIC signature could not be converted. Try a JPG or PNG copy.",
      )
    }
  }

  const handlePrepareSignature = async () => {
    if (!source) return
    setProcessing(true)
    setError("")
    try {
      const blob = await cropSignature(
        source,
        cropPreset,
        trimEdges,
        removeBackground,
      )
      setResult({ blob, url: URL.createObjectURL(blob) })
    } catch (processingError) {
      setError(
        processingError instanceof Error
          ? processingError.message
          : "The signature could not be prepared in this browser.",
      )
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <SeoHead
        title="Prepare a signature for an application form | FormPack"
        description="Crop and clean a signature image locally in your browser for a government or application form."
        path="/quick-tools/signature"
      />
      <section className="mx-auto w-[min(calc(100%-3rem),var(--shell))] py-[clamp(3rem,7vw,6rem)] pb-[clamp(5rem,10vw,8rem)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 pb-[clamp(2.5rem,5vw,4rem)] max-[50rem]:grid-cols-1 max-[50rem]:items-start">
          <div>
            <div className="inline-flex items-center gap-[.55rem] text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              <span className="home-kicker-dot" aria-hidden="true" />
              Signature cleanup / local processing
            </div>
            <h1 className="my-4 max-w-[10ch] text-[clamp(3.2rem,7vw,6rem)] font-[680] leading-[.9] tracking-[-.075em] [text-wrap:balance]">
              Make your signature portal-ready.
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] text-[var(--muted)] [text-wrap:pretty]">
              Crop the empty space and clean the background around one
              signature. Your source file stays on this device.
            </p>
            {presetField && preset ? (
              <div className="preset-rule-banner">
                <div>
                  <strong>
                    {preset.exam}: {presetField.label}
                  </strong>
                  <span>
                    {presetField.format} · {presetField.minKb}–
                    {presetField.maxKb} KB · {presetField.dimensionsLabel}
                  </span>
                </div>
                <a href={signatureRuleHref}>Compress to this range →</a>
              </div>
            ) : null}
          </div>
          <div className="max-[50rem]:max-w-none">
            <PrivacyNotice compact />
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] gap-px border border-[var(--border)] bg-[var(--border)] max-[50rem]:grid-cols-1">
          <section
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            aria-labelledby="signature-source-title"
          >
            <div
              className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]"
              id="signature-source-title"
            >
              01 / Add your signature
            </div>
            <label
              className={
                source
                  ? "relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-[var(--ink)] bg-[var(--raised)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80"
                  : "relative mt-4 flex min-h-96 cursor-pointer flex-col items-center justify-center gap-5 border border-dashed border-[var(--border)] bg-[var(--canvas)] p-6 text-center transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--ink)] hover:bg-[var(--raised)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)] has-[input:focus-visible]:outline-offset-[3px] max-[32rem]:min-h-80"
              }
            >
              <input
                type="file"
                accept="image/jpeg,image/png,.heic,.heif,image/heic,image/heif"
                onChange={onFile}
                className="absolute h-px w-px overflow-hidden opacity-0"
              />
              {source && previewUrl ? (
                <span className="flex max-h-64 w-full max-w-[18rem] items-center justify-center overflow-hidden bg-[var(--surface)] [background-image:linear-gradient(45deg,var(--raised)_25%,transparent_25%),linear-gradient(-45deg,var(--raised)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--raised)_75%),linear-gradient(-45deg,transparent_75%,var(--raised)_75%)] [background-position:0_0,0_.5rem,.5rem_-.5rem,-.5rem_0] [background-size:1rem_1rem] [outline:1px_solid_oklch(0_0_0_/_0.1)]">
                  <img
                    className="max-h-64 max-w-full object-contain [outline:1px_solid_oklch(0_0_0_/_0.1)]"
                    src={previewUrl}
                    alt="Selected signature preview"
                  />
                </span>
              ) : (
                <span className="flex flex-col items-center gap-[.6rem] [&>svg]:mb-2 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.5]">
                  <ImagePlus aria-hidden="true" />
                  <strong className="text-[1.08rem] tracking-[-.02em]">
                    Choose a signature image
                  </strong>
                  <small className="max-w-[28ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">
                    JPG or PNG with the ink clearly visible.
                  </small>
                </span>
              )}
              <span className="inline-flex min-h-11 items-center gap-[.45rem] border border-[var(--ink)] bg-[var(--surface)] px-[.85rem] py-[.65rem] text-[.82rem] font-bold text-[var(--ink)]">
                {source ? "Choose another signature" : "Choose a signature"}
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </label>
            <div
              className="mt-4 grid grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,.85fr))] gap-4 border-t border-[var(--border)] pt-4 max-[32rem]:grid-cols-1 max-[32rem]:gap-[.85rem]"
              aria-live="polite"
            >
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Source file
                </span>
                <strong className="[overflow-wrap:anywhere] text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {source?.name ?? "No signature selected"}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Current size
                </span>
                <strong className="text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {source ? formatBytes(source.size) : "—"}
                </strong>
              </div>
              <div className="flex min-w-0 flex-col gap-[.35rem]">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Dimensions
                </span>
                <strong className="text-[.78rem] [font-family:var(--font-mono)] [font-variant-numeric:tabular-nums]">
                  {sourceDimensions
                    ? `${sourceDimensions.width} × ${sourceDimensions.height} px`
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          <form
            className="min-w-0 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              02 / Clean the signature
            </div>
            <div className="mt-4 border-b border-[var(--border)] pb-5">
              <h2 className="m-0 text-[1.45rem] leading-[1.1] tracking-[-.035em]">
                Crop &amp; clean up
              </h2>
              <p className="mt-[.45rem] text-[.86rem] text-[var(--muted)]">
                Start from the shape most portals expect.
              </p>
            </div>
            <label className="mt-5 flex min-w-0 flex-col gap-[.45rem]">
              <span className="text-[.78rem] font-semibold text-[var(--muted)]">
                Crop shape
              </span>
              <select
                className="min-h-12 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-[.7rem] text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)] focus:outline-offset-0"
                value={cropPreset}
                onChange={(event) => setCropPreset(event.target.value)}
              >
                <option>3:1 signature strip</option>
                <option>Freeform crop</option>
                <option>1:1 square</option>
              </select>
            </label>
            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[.78rem] font-semibold text-[var(--muted)]">
                Cleanup options
              </legend>
              <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-[.86rem]">
                <input
                  className="h-4 w-4 accent-[var(--signal)]"
                  type="checkbox"
                  checked={trimEdges}
                  onChange={(event) => setTrimEdges(event.target.checked)}
                />
                <span>Trim empty edges</span>
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[.86rem]">
                <input
                  className="h-4 w-4 accent-[var(--signal)]"
                  type="checkbox"
                  checked={removeBackground}
                  onChange={(event) =>
                    setRemoveBackground(event.target.checked)
                  }
                />
                <span>Clean the white background</span>
              </label>
            </fieldset>
            <div className="mt-5 border border-[var(--border)] bg-[var(--canvas)] p-4">
              <div className="flex items-start gap-3">
                <SlidersHorizontal
                  className="mt-0.5 shrink-0 text-[var(--proof)]"
                  size={18}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <p className="text-[.78rem] leading-[1.5] text-[var(--muted)] [text-wrap:pretty]">
                  Keep the ink dark enough to pass a visual review. FormPack
                  will never decide whether a portal considers the signature
                  acceptable.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5">
              <span
                className="text-[.76rem] text-[var(--muted)] [text-wrap:pretty]"
                role="status"
              >
                {error ||
                  (processing
                    ? "Cleaning locally…"
                    : source
                      ? "Ready for the local cleanup engine."
                      : "Add a signature image to continue.")}
              </span>
              <button
                className={
                  source && !processing
                    ? "inline-flex min-h-[3.25rem] w-full items-center justify-between gap-4 border border-[var(--signal)] bg-[var(--signal)] px-4 py-[.8rem] font-bold text-[var(--ink)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--signal-hover)] active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
                    : "inline-flex min-h-[3.25rem] w-full cursor-not-allowed items-center justify-between gap-4 border border-[var(--border)] bg-[var(--raised)] px-4 py-[.8rem] font-bold text-[var(--quiet)]"
                }
                type="submit"
                disabled={!source || processing}
                onClick={handlePrepareSignature}
              >
                {processing ? "Preparing…" : "Prepare signature"} <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        <section
          className="mt-[clamp(3rem,7vw,6rem)] border border-[var(--ink)] bg-[var(--surface)]"
          aria-labelledby="signature-output-title"
        >
          <div className="flex items-end justify-between gap-8 border-b border-[var(--border)] p-5 max-[50rem]:flex-col max-[50rem]:items-start max-[50rem]:gap-4">
            <div>
              <div className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                03 / Check the result
              </div>
              <h2
                className="mt-[.65rem] text-[1.45rem] leading-[1.1] tracking-[-.035em]"
                id="signature-output-title"
              >
                {result ? "Your cleaned signature is ready." : "Your cleaned signature will appear here."}
              </h2>
            </div>
            <span className="whitespace-nowrap text-[.68rem] uppercase tracking-[.05em] text-[var(--proof)] [font-family:var(--font-mono)] max-[50rem]:whitespace-normal">
              Preview shell
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)] gap-px bg-[var(--border)] max-[50rem]:grid-cols-1">
            <div className="flex min-h-[17rem] flex-col items-center justify-center bg-[var(--canvas)] p-[clamp(1.25rem,3vw,2rem)] text-center [&>svg]:mb-4 [&>svg]:h-11 [&>svg]:w-11 [&>svg]:text-[var(--proof)] [&>svg]:[stroke-width:1.5]">
              {result ? (
                <img
                  src={result.url}
                  alt="Prepared signature preview"
                  className="max-h-64 max-w-full border border-[var(--border)] object-contain bg-white"
                />
              ) : (
                <>
                  <ImagePlus size={42} aria-hidden="true" />
                  <strong className="text-[1.05rem]">Signature preview</strong>
                  <p className="mt-2 max-w-[34ch] text-[.82rem] text-[var(--muted)] [text-wrap:pretty]">
                    The processing pass will show the cropped signature and final
                    file here.
                  </p>
                </>
              )}
            </div>
            <div className="grid content-center gap-5 bg-[var(--surface)] p-[clamp(1.25rem,3vw,2rem)]">
              {result ? (
                <>
                  <div className="border-b border-[var(--border-soft)] pb-5">
                    <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Result status</span>
                    <p className="mt-[.45rem] text-[.9rem] font-[680]">Cleanup pass complete</p>
                    <p className="mt-1 text-[.8rem] leading-[1.5] text-[var(--muted)]">Review the ink and crop visually before using the file in an application.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-b border-[var(--border-soft)] pb-5">
                    <div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">Output</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">JPG</strong></div>
                    <div><span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">File size</span><strong className="mt-1 block text-[.9rem] [font-family:var(--font-mono)]">{formatBytes(result.blob.size)}</strong></div>
                  </div>
                  <a href={result.url} download="formpack-signature.jpg" className="flex min-h-12 items-center justify-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.82rem] font-[680] text-[var(--surface)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--signal)] active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"><Download size={17} strokeWidth={1.9} aria-hidden="true" /> Download signature</a>
                </>
              ) : <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  What happens next
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  FormPack trims and cleans the image locally, keeping the
                  signature easy to inspect before download.
                </p>
              </div>}
              <div className="border-b border-[var(--border-soft)] pb-5 last:border-b-0 last:pb-0">
                <span className="text-[.68rem] uppercase tracking-[.05em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                  Keep the official rule nearby
                </span>
                <p className="mt-[.45rem] text-[.86rem] leading-[1.55] text-[var(--muted)] [text-wrap:pretty]">
                  Check the required format, size, and ratio against the current
                  portal instructions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ArticleBlock
          content={toolContent["/quick-tools/signature"]}
          className="tool-article"
        />
      </section>
    </>
  )
}

export function HomePage() {
  const { t, locale } = useI18n()
  const contentLang = locale === "hi" ? "en" : undefined

  return (
    <>
      <SeoHead
        title="FormPack — Exact-size photo and PDF tools"
        description="Compress exam photos and PDFs into the exact upload-size range, privately in your browser. No account and no file uploads."
        path="/"
      />
      <section className="home-hero shell-width">
        <div className="home-hero-copy">
          <div className="home-kicker">
            <span className="home-kicker-dot" aria-hidden="true" />
            {t("home.kicker")}
          </div>
          <h1>{t("home.title")}</h1>
          <p className="home-hero-intro">{t("home.intro")}</p>
          <div className="home-hero-actions">
            <ActionLink to="/photo-compressor">{t("home.ctaPhoto")}</ActionLink>
            <Link className="home-secondary-action" to="/pdf-compressor">
              {t("home.ctaPdf")} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-hero-trust">
            <span>
              <LockKeyhole size={15} aria-hidden="true" /> {t("home.noAccount")}
            </span>
            <span>
              <ShieldCheck size={15} aria-hidden="true" />{" "}
              {t("home.localFiles")}
            </span>
          </div>
        </div>

        <div
          className="range-workspace"
          aria-label="Example exact-size result"
          lang={contentLang}
        >
          <div className="range-workspace-bar">
            <span>Illustrative result</span>
            <span className="range-workspace-route">photo / compress</span>
          </div>
          <div className="range-workspace-body">
            <div className="range-workspace-file">
              <span className="range-file-icon">
                <SlotIcon slot={{ kind: "photo" }} />
              </span>
              <span>
                <strong>candidate-photo.jpg</strong>
                <small>JPG · 1200 × 1600 px · source 182 KB</small>
              </span>
            </div>
            <div className="range-rule-head">
              <span>Target upload range</span>
              <strong>20–50 KB</strong>
            </div>
            <div className="range-ruler" aria-hidden="true">
              <div className="range-ruler-labels">
                <span>0 KB</span>
                <span>20 KB</span>
                <span>50 KB</span>
                <span>200 KB</span>
              </div>
              <div className="range-ruler-track">
                <span className="range-ruler-zone" />
                <span className="range-ruler-pin" />
              </div>
            </div>
            <div className="range-result">
              <div>
                <span>Output size</span>
                <strong>32 KB</strong>
              </div>
              <span className="range-pass">
                <CheckCircle2 size={15} aria-hidden="true" /> Inside range
              </span>
            </div>
          </div>
          <div className="range-workspace-footer">
            <span>Target dimensions preserved</span>
            <span>Result state preview</span>
          </div>
        </div>
      </section>

      <section className="home-argument">
        <div className="shell-width home-argument-grid">
          <div className="home-section-lead">
            <span className="eyebrow">{t("home.why")}</span>
            <h2>{t("home.whyTitle")}</h2>
            <p>{t("home.whyBody")}</p>
          </div>
          <div className="home-proof-list">
            <div>
              <span className="home-proof-index">01</span>
              <div>
                <h3>{t("home.proof1Title")}</h3>
                <p>{t("home.proof1Body")}</p>
              </div>
            </div>
            <div>
              <span className="home-proof-index">02</span>
              <div>
                <h3>{t("home.proof2Title")}</h3>
                <p>{t("home.proof2Body")}</p>
              </div>
            </div>
            <div>
              <span className="home-proof-index">03</span>
              <div>
                <h3>{t("home.proof3Title")}</h3>
                <p>{t("home.proof3Body")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-tools shell-width">
        <div className="home-section-lead">
          <span className="eyebrow">{t("home.toolsKicker")}</span>
          <h2>{t("home.toolsTitle")}</h2>
          <p>{t("home.toolsIntro")}</p>
        </div>
        <div className="home-tool-grid">
          <Link className="home-tool-card" to="/photo-compressor">
            <span className="home-tool-label" lang={contentLang}>
              Photo
            </span>
            <span className="home-tool-icon">
              <SlotIcon slot={{ kind: "photo" }} />
            </span>
            <h3>{t("home.toolPhoto")}</h3>
            <p>{t("home.toolPhotoBody")}</p>
            <span className="home-tool-action">
              {t("home.openPhoto")} <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
          <Link className="home-tool-card" to="/pdf-compressor">
            <span className="home-tool-label" lang={contentLang}>
              PDF
            </span>
            <span className="home-tool-icon">
              <SlotIcon slot={{ kind: "pdf" }} />
            </span>
            <h3>{t("home.toolPdf")}</h3>
            <p>{t("home.toolPdfBody")}</p>
            <span className="home-tool-action">
              {t("home.openPdf")} <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
          <Link className="home-tool-card" to="/photo-to-pdf">
            <span className="home-tool-label" lang={contentLang}>
              Photo → PDF
            </span>
            <span className="home-tool-icon">
              <ImagePlus size={22} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h3>{t("home.toolCombine")}</h3>
            <p>{t("home.toolCombineBody")}</p>
            <span className="home-tool-action">
              {t("home.combineImages")} <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        </div>
        <div className="home-tool-links">
          <Link className="text-link" to="/batch">
            {t("home.batchLink")} →
          </Link>
          <Link className="text-link" to="/file-checker">
            {t("home.checkerLink")} →
          </Link>
        </div>
      </section>

      <section className="guide-teaser-section shell-width">
        <div className="section-heading">
          <span className="eyebrow">{t("home.presetsKicker")}</span>
          <h2>{t("home.presetsTitle")}</h2>
          <p>{t("home.presetsIntro")}</p>
        </div>
        <div className="guide-teaser-grid">
          {examPresets.slice(0, 3).map((preset) => (
            <Link
              className="guide-teaser-card"
              key={preset.slug}
              to="/presets/$slug"
              params={{ slug: preset.slug }}
            >
              <span className="guide-card-audience" lang={contentLang}>
                {preset.authority}
              </span>
              <h3 lang={contentLang}>{preset.exam}</h3>
              <p lang={contentLang}>{preset.summary}</p>
              <span className="text-link">{t("home.openPreset")} →</span>
            </Link>
          ))}
        </div>
        <Link className="text-link guide-index-link" to="/presets">
          {t("home.allPresets")} →
        </Link>
      </section>

      <section className="guide-teaser-section shell-width">
        <div className="section-heading">
          <span className="eyebrow">{t("home.guidesKicker")}</span>
          <h2>{t("home.guidesTitle")}</h2>
          <p>{t("home.guidesIntro")}</p>
        </div>
        <div className="guide-teaser-grid">
          {seoGuides.slice(0, 3).map((guide) => (
            <Link
              className="guide-teaser-card"
              key={guide.slug}
              to="/guides/$slug"
              params={{ slug: guide.slug }}
            >
              <span lang={contentLang}>{guide.audience}</span>
              <h3 lang={contentLang}>{guide.title}</h3>
              <p lang={contentLang}>{guide.summary}</p>
              <span className="text-link">{t("home.readChecklist")} →</span>
            </Link>
          ))}
        </div>
        <Link className="text-link guide-index-link" to="/guides">
          {t("home.allGuides")} →
        </Link>
      </section>

      <section className="privacy-section shell-width">
        <PrivacyNotice />
        <div className="privacy-detail">
          <h2>{t("home.privacyTitle")}</h2>
          <div className="check-columns">
            <div>
              <span className="column-label">{t("home.canCheck")}</span>
              <ul>
                <CheckLine ready>{t("home.check1")}</CheckLine>
                <CheckLine ready>{t("home.check2")}</CheckLine>
                <CheckLine ready>{t("home.check3")}</CheckLine>
              </ul>
            </div>
            <div>
              <span className="column-label">{t("home.youReview")}</span>
              <ul>
                <CheckLine ready={false}>{t("home.review1")}</CheckLine>
                <CheckLine ready={false}>{t("home.review2")}</CheckLine>
                <CheckLine ready={false}>{t("home.review3")}</CheckLine>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div className="shell-width closing-inner">
          <div>
            <h2>{t("home.closingTitle")}</h2>
            <p>{t("home.closingBody")}</p>
          </div>
          <ActionLink to="/photo-compressor">{t("home.start")}</ActionLink>
        </div>
      </section>

      <section className="shell-width home-article">
        <ArticleBlock content={homeContent} />
      </section>
    </>
  )
}

export function CategoryPage() {
  const { category, setCategory } = usePack()
  const presets = useQuery({
    queryKey: ["starter-presets", category],
    queryFn: async () => [
      {
        id: "three-file",
        name: "Photo, signature, and certificate",
        detail: "A common three-file starting point",
      },
      {
        id: "custom",
        name: "Review requirements myself",
        detail: "Use editable starter values for each file",
      },
    ],
    staleTime: Infinity,
  })

  return (
    <PageFrame
      title="What are you applying for?"
      intro="This only changes the starting point. Every file rule stays editable."
      aside={<PrivacyNotice compact />}
    >
      <div className="selection-layout">
        <fieldset className="selection-list">
          <legend>Application category</legend>
          {categories.map((item) => (
            <label className="selection-row" key={item.id}>
              <input
                type="radio"
                name="category"
                value={item.id}
                checked={category === item.id}
                onChange={() => setCategory(item.id)}
              />
              <span className="radio-mark" aria-hidden="true" />
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="preset-panel">
          <div className="panel-heading">
            <span>Starting pattern</span>
            <strong>
              {categories.find((item) => item.id === category)?.label}
            </strong>
          </div>
          <div className="preset-list">
            {presets.isPending ? (
              <p role="status">Loading starting patterns…</p>
            ) : (
              presets.data?.map((preset, index) => (
                <Link
                  to="/prepare/requirements"
                  className="preset-row"
                  key={preset.id}
                >
                  <span className="preset-index">{index + 1}</span>
                  <span>
                    <strong>{preset.name}</strong>
                    <small>{preset.detail}</small>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ))
            )}
          </div>
          <p className="preset-notice">
            Starter patterns are generic. Verify every value against the
            instructions on your official form.
          </p>
        </div>
      </div>
    </PageFrame>
  )
}

function fieldActionLabel(field: ExamPreset["fields"][number]) {
  if (field.kind === "photo") return "Open photo tool"
  if (field.kind === "pdf") return "Open PDF tool"
  return "Open signature tool"
}

export function PresetsPage() {
  return (
    <PageFrame
      title="Exam file presets"
      intro="Start with the photo, signature, and document values commonly published for your exam. Confirm every value against the current official notice."
      seo={{
        title: "Exam photo and signature presets | FormPack",
        description:
          "Browse exam-specific photo, signature, thumb impression, and declaration rules for SSC, IBPS, SBI, RRB, NTA, and other applications.",
        path: "/presets",
      }}
    >
      <div className="guide-grid">
        {examPresets.map((preset) => (
          <Link
            className="guide-card"
            key={preset.slug}
            to="/presets/$slug"
            params={{ slug: preset.slug }}
          >
            <span className="guide-card-audience">{preset.authority}</span>
            <h2>{preset.exam}</h2>
            <p>{preset.summary}</p>
            <ul className="preset-fields">
              {preset.fields.map((field) => (
                <li key={field.kind}>
                  <strong>{field.label}:</strong> {field.format} ·{" "}
                  {field.minKb}–{field.maxKb} KB · {field.dimensionsLabel}
                </li>
              ))}
            </ul>
            <span className="text-link">Open preset →</span>
          </Link>
        ))}
      </div>
      <p className="preset-disclaimer">
        These presets are a preparation reference, not an official approval.
        Exam requirements can change between cycles. Always open the current
        notice before submitting.
      </p>
    </PageFrame>
  )
}

export function PresetPage() {
  const { slug } = useParams({ from: "/presets/$slug" })
  const preset = getExamPreset(slug)

  if (!preset) return <NotFoundPage />

  const presetPath = `/presets/${preset.slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${preset.exam} photo and signature requirements`,
        description: preset.summary,
        url: `${SITE_URL}${presetPath}`,
        datePublished: preset.updatedAt,
        dateModified: preset.updatedAt,
        author: { "@type": "Organization", name: SITE.author },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE_URL,
        },
        isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Exam presets",
            item: `${SITE_URL}/presets`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: preset.exam,
            item: `${SITE_URL}${presetPath}`,
          },
        ],
      },
    ],
  }

  return (
    <PageFrame
      title={`${preset.exam} photo and signature requirements`}
      intro={preset.summary}
      seo={{
        title: `${preset.exam} photo and signature requirements | FormPack`,
        description: preset.summary,
        path: presetPath,
        type: "article",
        jsonLd,
      }}
    >
      <article className="guide-article">
        <div className="guide-article-meta">
          <span>{preset.authority}</span>
          <span>{preset.cycle}</span>
          <span>Last updated {formatDate(preset.updatedAt)}</span>
        </div>

        <div className="preset-actions">
          <RuleLinkButton
            href={presetFieldHref(preset, preset.fields[0])}
            label="Copy rule link"
          />
        </div>

        <section>
          <h2 id="preset-rules-title">Upload rules</h2>
          <div
            className="preset-table-wrap"
            tabIndex={0}
            role="region"
            aria-labelledby="preset-rules-title"
          >
            <table className="preset-table">
              <caption className="sr-only">
                {preset.exam} upload rules
              </caption>
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  <th scope="col">Format</th>
                  <th scope="col">Size</th>
                  <th scope="col">Dimensions</th>
                  <th scope="col">Prepare</th>
                </tr>
              </thead>
              <tbody>
                {preset.fields.map((field) => (
                  <tr key={field.kind}>
                    <td data-label="Field">
                      <strong>{field.label}</strong>
                      {field.notes ? <small>{field.notes}</small> : null}
                    </td>
                    <td data-label="Format">{field.format}</td>
                    <td data-label="Size">
                      {field.minKb}–{field.maxKb} KB
                    </td>
                    <td data-label="Dimensions">{field.dimensionsLabel}</td>
                    <td data-label="Prepare">
                      <a href={presetFieldHref(preset, field)}>
                        {fieldActionLabel(field)} →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>How to prepare the files</h2>
          <ol>
            {preset.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2>Important notes</h2>
          <ul>
            {preset.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Official source</h2>
          <p className="preset-source">
            <a
              href={preset.source.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {preset.source.label}
            </a>
          </p>
          {preset.guideSlug ? (
            <p className="preset-guide-link">
              <Link
                to="/guides/$slug"
                params={{ slug: preset.guideSlug }}
              >
                Read the full preparation guide →
              </Link>
            </p>
          ) : null}
        </section>

        <section className="guide-cta">
          <h2>Ready to prepare a file?</h2>
          <p>
            Use the values above, then compare the result with the current
            official notice before uploading.
          </p>
          <div className="guide-cta-actions">
            <a
              className="action-link"
              href={presetFieldHref(preset, preset.fields[0])}
            >
              <span>{fieldActionLabel(preset.fields[0])}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link
              className="action-link action-link-secondary"
              to="/presets"
            >
              <span>Browse all presets</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <nav className="related-guides" aria-label="Related exam presets">
          <h2>Related exam presets</h2>
          <div>
            {examPresets
              .filter((item) => item.slug !== preset.slug)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.slug}
                  to="/presets/$slug"
                  params={{ slug: item.slug }}
                >
                  {item.exam} →
                </Link>
              ))}
          </div>
        </nav>
      </article>
    </PageFrame>
  )
}

export function GuideIndexPage() {
  return (
    <PageFrame
      title="Application file checklists and guides"
      intro="Use these focused checklists to translate a portal's upload rule into measurable checks and a final human review."
    >
      <div className="guide-index-intro">
        <p>
          FormPack is a local, browser-based utility. These guides explain
          common requirements without pretending that a generic preset can
          replace the current instructions from an official portal.
        </p>
      </div>
      <div className="guide-grid">
        {seoGuides.map((guide) => (
          <Link
            className="guide-card"
            key={guide.slug}
            to="/guides/$slug"
            params={{ slug: guide.slug }}
          >
            <span className="guide-card-audience">{guide.audience}</span>
            <h2>{guide.title}</h2>
            <p>{guide.description}</p>
            <span className="text-link">Open guide →</span>
          </Link>
        ))}
      </div>
    </PageFrame>
  )
}

export function GuidePage() {
  const { slug } = useParams({ from: "/guides/$slug" })
  const guide = getSeoGuide(slug)

  if (!guide) return <NotFoundPage />

  const guidePath = `/guides/${guide.slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        url: `${SITE_URL}${guidePath}`,
        datePublished: guide.updatedAt,
        dateModified: guide.updatedAt,
        author: { "@type": "Organization", name: SITE.author },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE_URL,
        },
        isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE_URL },
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
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: `${SITE_URL}/guides`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: `${SITE_URL}${guidePath}`,
          },
        ],
      },
    ],
  }

  return (
    <PageFrame
      title={guide.title}
      intro={guide.summary}
      seo={{
        title: guide.seoTitle,
        description: guide.description,
        path: guidePath,
        type: "article",
        jsonLd,
      }}
    >
      <article className="guide-article">
        <div className="guide-article-meta">
          <span>{guide.audience}</span>
          <span>By {SITE.author}</span>
          <span>Last updated {formatDate(guide.updatedAt)}</span>
        </div>
        <ArticleBody
          sections={guide.sections}
          faqs={guide.faqs}
          sources={guide.sources}
        />
        <section className="guide-cta">
          <h2>Ready to check a file?</h2>
          <p>
            FormPack measures format and size locally, then leaves visual
            judgment with you.
          </p>
          <div className="guide-cta-actions">
            <ActionLink to="/prepare">Prepare an application pack</ActionLink>
            <ActionLink to="/quick-tools" secondary>
              Use a quick tool
            </ActionLink>
          </div>
        </section>
        <nav className="related-guides" aria-label="Related guides">
          <h2>Related checklists</h2>
          <div>
            {guide.relatedSlugs.map((relatedSlug) => {
              const related = getSeoGuide(relatedSlug)
              if (!related) return null
              return (
                <Link
                  key={related.slug}
                  to="/guides/$slug"
                  params={{ slug: related.slug }}
                >
                  {related.title} →
                </Link>
              )
            })}
          </div>
        </nav>
      </article>
    </PageFrame>
  )
}

export function RequirementsPage() {
  const { slots, updateRequirement } = usePack()
  const [selectedId, setSelectedId] = useState(slots[0].id)
  const selected = slots.find((slot) => slot.id === selectedId) ?? slots[0]
  const sizeIsValid = selected.requirement.maxSizeKb > 0
  const dimensionsAreValid = selected.requirement.dimensions.trim().length > 0
  const filenameIsValid = selected.requirement.filename.trim().length > 0
  const allRequirementsAreComplete = slots.every((slot) =>
    requirementIsComplete(slot.requirement),
  )

  return (
    <PageFrame
      title="Set the rule for each file."
      intro="Copy each rule from your form and verify every starting value before continuing."
      aside={
        <div className="count-plate">
          <strong>{slots.length}</strong>
          <span>required files</span>
        </div>
      }
    >
      <div className="workspace-layout">
        <div className="slot-sidebar" aria-label="Required files">
          {slots.map((slot) => (
            <button
              type="button"
              className={
                slot.id === selected.id ? "slot-tab is-active" : "slot-tab"
              }
              onClick={() => setSelectedId(slot.id)}
              key={slot.id}
            >
              <span className="slot-tab-icon">
                <SlotIcon slot={slot} />
              </span>
              <span>
                <strong>{slot.name}</strong>
                <small>{slot.requirement.format}</small>
              </span>
              <StatusLabel status={slot.status} />
            </button>
          ))}
        </div>

        <form
          className="requirements-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="form-head">
            <div>
              <span>File requirement</span>
              <h2>{selected.name}</h2>
            </div>
            <span className="local-chip">
              <LockKeyhole size={14} aria-hidden="true" /> Saved in this tab
            </span>
          </div>
          <div className="field-grid">
            <label>
              <span>Output format</span>
              <select
                value={selected.requirement.format}
                onChange={(event) =>
                  updateRequirement(selected.id, "format", event.target.value)
                }
              >
                <option>JPG</option>
                <option>PNG</option>
                <option>WebP</option>
                <option>PDF</option>
              </select>
            </label>
            <label>
              <span>Maximum file size</span>
              <div className="input-with-unit">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  aria-invalid={!sizeIsValid}
                  aria-describedby={sizeIsValid ? undefined : "max-size-error"}
                  value={selected.requirement.maxSizeKb}
                  onChange={(event) =>
                    updateRequirement(
                      selected.id,
                      "maxSizeKb",
                      Number(event.target.value),
                    )
                  }
                />
                <span>KB</span>
              </div>
              {!sizeIsValid ? (
                <small className="field-error" id="max-size-error">
                  Enter a limit greater than 0 KB.
                </small>
              ) : null}
            </label>
            <label className="field-wide">
              <span>Dimensions, ratio, or page limit</span>
              <input
                aria-invalid={!dimensionsAreValid}
                value={selected.requirement.dimensions}
                onChange={(event) =>
                  updateRequirement(
                    selected.id,
                    "dimensions",
                    event.target.value,
                  )
                }
                placeholder="For example, 600 × 800 px"
              />
              {!dimensionsAreValid ? (
                <small className="field-error">
                  Enter the dimension, ratio, or page rule shown by the portal.
                </small>
              ) : null}
            </label>
            <label className="field-wide">
              <span>Required filename</span>
              <input
                aria-invalid={!filenameIsValid}
                value={selected.requirement.filename}
                onChange={(event) =>
                  updateRequirement(selected.id, "filename", event.target.value)
                }
                placeholder="For example, photo.jpg"
              />
              {!filenameIsValid ? (
                <small className="field-error">
                  Enter the filename required by the portal.
                </small>
              ) : null}
            </label>
          </div>
          <div className="rule-summary">
            <span>Plain-language rule</span>
            <p>
              Make {selected.name.toLowerCase()} a {selected.requirement.format}{" "}
              file under {selected.requirement.maxSizeKb} KB, following “
              {selected.requirement.dimensions}”, and name it{" "}
              {selected.requirement.filename}.
            </p>
          </div>
          <div className="form-actions">
            <div className="form-action-copy">
              <Link className="text-link" to="/prepare">
                Back to category
              </Link>
              {!allRequirementsAreComplete ? (
                <span role="status">Complete every file rule to continue.</span>
              ) : null}
            </div>
            <ActionLink
              to="/prepare/files"
              disabled={!allRequirementsAreComplete}
            >
              Continue to files
            </ActionLink>
          </div>
        </form>
      </div>
    </PageFrame>
  )
}

export function FilesPage() {
  const { slots, attachFile } = usePack()
  const attached = slots.filter((slot) => slot.source).length

  const onFile = async (slotId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      attachFile(slotId, await normalizeImageFile(file))
    } catch {
      attachFile(slotId, file)
    }
  }

  return (
    <PageFrame
      title="Add files from this device."
      intro="Files are inspected in your browser. Nothing is sent to FormPack."
      aside={
        <div className="count-plate">
          <strong>
            {attached}/{slots.length}
          </strong>
          <span>files added</span>
        </div>
      }
    >
      <PrivacyNotice />
      <div className="upload-ledger">
        {slots.map((slot) => (
          <section className="upload-row" key={slot.id}>
            <div className="upload-name">
              <span className="slot-icon">
                <SlotIcon slot={slot} />
              </span>
              <div>
                <h2>{slot.name}</h2>
                <p>
                  {slot.requirement.format} · under {slot.requirement.maxSizeKb}{" "}
                  KB · {slot.requirement.dimensions}
                </p>
              </div>
            </div>
            <div className="upload-result">
              {slot.source ? (
                <>
                  <strong>{slot.source.name}</strong>
                  <span>
                    {formatBytes(slot.source.size)} ·{" "}
                    {slot.source.type || "Unknown type"}
                  </span>
                  {slot.status === "not-ready" ? (
                    <small className="upload-error" role="status">
                      {!fileTypeMatches(
                        slot.requirement.format,
                        slot.source.type,
                      )
                        ? `Choose a ${slot.requirement.format} file.`
                        : slot.source.size === 0
                          ? "Choose a file that is not empty."
                          : `Choose a file under ${slot.requirement.maxSizeKb} KB.`}
                    </small>
                  ) : null}
                </>
              ) : (
                <span>No file selected</span>
              )}
            </div>
            <StatusLabel status={slot.status} />
            <label className="file-button">
              <input
                type="file"
                accept={
                  slot.kind === "pdf"
                    ? "application/pdf"
                    : "image/*,.heic,.heif,image/heic,image/heif"
                }
                onChange={(event) => onFile(slot.id, event)}
              />
              <span>{slot.source ? "Replace file" : "Choose file"}</span>
            </label>
            {slot.source ? (
              <Link
                className="inspect-link"
                to="/prepare/file/$slotId"
                params={{ slotId: slot.id }}
              >
                Inspect <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : null}
          </section>
        ))}
      </div>
      <div className="flow-actions">
        <p>
          Camera capture appears automatically when your browser supports it.
        </p>
        <ActionLink to="/prepare/check">Check this pack</ActionLink>
      </div>
    </PageFrame>
  )
}

export function FileWorkspacePage() {
  const { slotId } = useParams({ from: "/prepare/file/$slotId" })
  const { slots, setStatus } = usePack()
  const slot = slots.find((item) => item.id === slotId)
  const sourceFile = slot?.source?.file
  const [previewUrl, setPreviewUrl] = useState("")
  const [previewFailed, setPreviewFailed] = useState(false)

  useEffect(() => {
    if (!sourceFile) {
      setPreviewUrl("")
      setPreviewFailed(false)
      return
    }

    const nextUrl = URL.createObjectURL(sourceFile)
    setPreviewUrl(nextUrl)
    setPreviewFailed(false)

    return () => URL.revokeObjectURL(nextUrl)
  }, [sourceFile])

  if (!slot) {
    return (
      <PageFrame
        title="File not found"
        intro="Return to your file list and choose a file slot."
      >
        <ActionLink to="/prepare/files">Return to files</ActionLink>
      </PageFrame>
    )
  }

  const typePass = Boolean(
    slot.source && fileTypeMatches(slot.requirement.format, slot.source.type),
  )
  const sizePass = Boolean(
    slot.source &&
      slot.source.size > 0 &&
      slot.source.size <= slot.requirement.maxSizeKb * 1024,
  )
  const mechanicalPass = typePass && sizePass
  const mechanicalFailure = Boolean(slot.source) && !mechanicalPass
  const isReady = slot.status === "ready"
  const hasPreview = Boolean(previewUrl && slot.source && !previewFailed)

  return (
    <PageFrame
      title={`Inspect ${slot.name.toLowerCase()}.`}
      intro="Check the measurable rule, then use the visual checklist before you mark this file ready."
      aside={
        <div className="flex items-center gap-2 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden="true" />
          Step 3 / 5 · Fix
        </div>
      }
    >
      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(19rem,.85fr)] items-start gap-5 max-[56rem]:grid-cols-1">
        <section
          className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--raised)]"
          aria-labelledby="workspace-preview-title"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 max-[35rem]:flex-col">
            <div>
              <p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">
                Source file
              </p>
              <h2
                id="workspace-preview-title"
                className="text-[1.05rem] font-[680] tracking-[-.02em]"
              >
                Review the candidate
              </h2>
            </div>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[.68rem] text-[var(--muted)] [font-family:var(--font-mono)]">
              Local preview
            </span>
          </div>

          <div className="flex min-h-[25rem] items-center justify-center bg-[var(--canvas)] p-6 max-[35rem]:min-h-[20rem]">
            {hasPreview && slot.kind !== "pdf" ? (
              <img
                src={previewUrl}
                alt={`${slot.name} candidate preview`}
                onError={() => setPreviewFailed(true)}
                className="max-h-[23rem] max-w-full rounded-[calc(var(--radius-sm)-2px)] border border-[var(--border)] bg-white object-contain shadow-[0_14px_35px_rgba(19,33,46,.12)]"
              />
            ) : hasPreview && slot.kind === "pdf" ? (
              <iframe
                src={previewUrl}
                title={`${slot.name} document preview`}
                onError={() => setPreviewFailed(true)}
                className="h-[23rem] w-full rounded-[calc(var(--radius-sm)-2px)] border border-[var(--border)] bg-white shadow-[0_14px_35px_rgba(19,33,46,.12)]"
              />
            ) : (
              <div className="flex max-w-[27rem] flex-col items-center text-center">
                <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--quiet)] shadow-[0_8px_20px_rgba(19,33,46,.06)]">
                  <SlotIcon slot={slot} />
                </span>
                <strong className="max-w-full break-words text-[.95rem]">
                  {slot.source?.name ?? "No file added yet"}
                </strong>
                <p className="mt-2 max-w-[34ch] text-[.82rem] leading-[1.55] text-[var(--muted)]">
                  {slot.source
                    ? previewFailed
                      ? "The file could not be previewed here, but its measured checks are still available."
                      : "Reselect this file from the file list to load its local preview."
                    : "Choose a source file from the upload ledger to begin the review."}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4 max-[35rem]:items-start max-[35rem]:flex-col">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--canvas)] text-[var(--muted)]">
                <SlotIcon slot={slot} />
              </span>
              <div className="min-w-0">
                <strong className="block truncate text-[.82rem]">
                  {slot.source?.name ?? "Waiting for a file"}
                </strong>
                <span className="block truncate text-[.72rem] text-[var(--muted)] [font-family:var(--font-mono)]">
                  {slot.source
                    ? `${formatBytes(slot.source.size)} · ${slot.source.type || "Unknown type"}`
                    : "No source selected"}
                </span>
              </div>
            </div>
            <Link
              to="/prepare/files"
              className="inline-flex min-h-11 shrink-0 items-center text-[.78rem] font-[680] text-[var(--ink)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:decoration-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            >
              {slot.source ? "Replace file" : "Choose file"}
            </Link>
          </div>
        </section>

        <section
          className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]"
          aria-labelledby="workspace-checks-title"
        >
          <div className="border-b border-[var(--border)] px-5 py-4">
            <p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              Target rule
            </p>
            <div className="flex items-start justify-between gap-3">
              <h2
                id="workspace-checks-title"
                className="max-w-[20ch] text-[1.05rem] font-[680] tracking-[-.02em]"
              >
                {slot.requirement.filename}
              </h2>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[.67rem] font-[680] [font-family:var(--font-mono)] ${mechanicalPass ? "bg-[var(--ready-soft)] text-[var(--ready)]" : "bg-[var(--canvas)] text-[var(--quiet)]"}`}
              >
                {mechanicalPass ? "Measured pass" : "Needs file"}
              </span>
            </div>
          </div>

          <dl className="divide-y divide-[var(--border-soft)]">
            <div className="grid grid-cols-[minmax(5rem,.7fr)_minmax(0,1fr)] gap-4 px-5 py-4">
              <dt className="text-[.76rem] text-[var(--muted)]">Format</dt>
              <dd className="m-0 flex min-w-0 items-start justify-between gap-3 text-right">
                <span className="min-w-0 break-words text-[.76rem] [font-family:var(--font-mono)]">
                  {slot.source?.type || "Waiting for a file"}
                </span>
                <span className={`shrink-0 text-[.68rem] font-[680] ${typePass ? "text-[var(--ready)]" : "text-[var(--quiet)]"}`}>
                  {typePass ? "Pass" : "Check"}
                </span>
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(5rem,.7fr)_minmax(0,1fr)] gap-4 px-5 py-4">
              <dt className="text-[.76rem] text-[var(--muted)]">File size</dt>
              <dd className="m-0 flex min-w-0 items-start justify-between gap-3 text-right">
                <span className="min-w-0 break-words text-[.76rem] [font-family:var(--font-mono)]">
                  {slot.source
                    ? `${formatBytes(slot.source.size)} / ${slot.requirement.maxSizeKb} KB max`
                    : "Waiting for a file"}
                </span>
                <span className={`shrink-0 text-[.68rem] font-[680] ${sizePass ? "text-[var(--ready)]" : "text-[var(--quiet)]"}`}>
                  {sizePass ? "Pass" : "Check"}
                </span>
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(5rem,.7fr)_minmax(0,1fr)] gap-4 px-5 py-4">
              <dt className="text-[.76rem] text-[var(--muted)]">Visual rule</dt>
              <dd className="m-0 flex min-w-0 items-start justify-between gap-3 text-right">
                <span className="min-w-0 break-words text-[.76rem] [font-family:var(--font-mono)]">
                  {slot.requirement.dimensions}
                </span>
                <span className="shrink-0 text-[.68rem] font-[680] text-[var(--signal)]">
                  Review
                </span>
              </dd>
            </div>
          </dl>

          <div className="mx-5 my-5 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--canvas)]">
            <div className="flex gap-3 border-b border-[var(--border-soft)] px-4 py-4">
              <ScanSearch className="mt-0.5 shrink-0 text-[var(--signal)]" size={18} strokeWidth={1.8} aria-hidden="true" />
              <div>
                <h3 className="text-[.84rem] font-[680]">Visual review</h3>
                <p className="mt-1 text-[.76rem] leading-[1.5] text-[var(--muted)]">
                  A browser can measure the file. You confirm whether the content is usable.
                </p>
              </div>
            </div>
            <ul className="divide-y divide-[var(--border-soft)]">
              {["Content is clear and legible", "Framing or placement follows the rule", "Background and contrast look acceptable"].map((item) => (
                <li key={item} className="flex items-center gap-3 px-4 py-3 text-[.75rem] text-[var(--muted)]">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[.62rem] text-[var(--quiet)] [font-family:var(--font-mono)]">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-5 pb-5">
            <button
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.84rem] font-[680] text-[var(--surface)] transition-[transform,opacity,background-color] duration-150 ease-out hover:bg-[var(--signal)] active:scale-[.98] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--raised)] disabled:text-[var(--quiet)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
              type="button"
              disabled={!slot.source || mechanicalFailure || isReady}
              onClick={() => setStatus(slot.id, "ready")}
            >
              <CheckCircle2 size={18} strokeWidth={1.9} aria-hidden="true" />
              {isReady ? "File marked ready" : "Mark file as ready"}
            </button>
            {mechanicalFailure ? (
              <p className="mt-3 text-center text-[.75rem] leading-[1.45] text-[var(--danger)]" role="status">
                Replace this file before confirming. Its format or size does not meet the target rule.
              </p>
            ) : !slot.source ? (
              <p className="mt-3 text-center text-[.75rem] leading-[1.45] text-[var(--muted)]" role="status">
                Add a file to unlock the measured checks and ready action.
              </p>
            ) : null}
          </div>
          <Link
            className="flex items-center justify-center border-t border-[var(--border)] px-5 py-4 text-[.78rem] font-[680] text-[var(--ink)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:decoration-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--focus)]"
            to="/prepare/check"
          >
            Review the complete pack →
          </Link>
        </section>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-y border-[var(--border-soft)] py-4 max-[46rem]:items-start max-[46rem]:flex-col">
        <div className="flex items-start gap-2.5 text-[.76rem] leading-[1.5] text-[var(--muted)]">
          <LockKeyhole className="mt-0.5 shrink-0 text-[var(--signal)]" size={16} strokeWidth={1.8} aria-hidden="true" />
          <p>
            <strong className="font-[680] text-[var(--ink)]">Private by default.</strong>{" "}
            The file stays in this browser while you inspect it.
          </p>
        </div>
        <Link
          to="/prepare/files"
          className="inline-flex min-h-11 shrink-0 items-center text-[.78rem] font-[680] text-[var(--ink)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:decoration-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
        >
          Back to file list
        </Link>
      </div>
    </PageFrame>
  )
}

export function CheckPage() {
  const { slots } = usePack()
  const readyCount = slots.filter((slot) => slot.status === "ready").length

  return (
    <PageFrame
      title="Check every rule before download."
      intro="A green result means the measured file rule passes. It does not mean an authority has approved the file."
      aside={
        <div className="count-plate">
          <strong>
            {readyCount}/{slots.length}
          </strong>
          <span>files ready</span>
        </div>
      }
    >
      <div className="check-ledger">
        {slots.map((slot) => {
          const sizePass = Boolean(
            slot.source &&
            slot.source.size > 0 &&
            slot.source.size <= slot.requirement.maxSizeKb * 1024,
          )
          const typePass = Boolean(
            slot.source &&
            fileTypeMatches(slot.requirement.format, slot.source.type),
          )
          return (
            <section className="check-row" key={slot.id}>
              <div className="check-row-head">
                <div className="upload-name">
                  <span className="slot-icon">
                    <SlotIcon slot={slot} />
                  </span>
                  <div>
                    <h2>{slot.name}</h2>
                    <p>{slot.source?.name ?? "No source file"}</p>
                  </div>
                </div>
                <StatusLabel status={slot.status} />
              </div>
              <div className="rule-results">
                <div data-pass={typePass}>
                  <span>Format</span>
                  <strong>
                    {typePass
                      ? "Pass"
                      : slot.source
                        ? `Needs ${slot.requirement.format}`
                        : "Needs a file"}
                  </strong>
                </div>
                <div data-pass={sizePass}>
                  <span>File size</span>
                  <strong>
                    {sizePass
                      ? "Pass"
                      : slot.source
                        ? slot.source.size === 0
                          ? "File is empty"
                          : `Over ${slot.requirement.maxSizeKb} KB`
                        : "Needs a file"}
                  </strong>
                </div>
                <div data-pass={slot.status === "ready"}>
                  <span>Visual review</span>
                  <strong>
                    {slot.status === "ready" ? "Confirmed" : "Review manually"}
                  </strong>
                </div>
              </div>
              <Link to="/prepare/file/$slotId" params={{ slotId: slot.id }}>
                Inspect {slot.name.toLowerCase()}
              </Link>
            </section>
          )
        })}
      </div>
      <div className="flow-actions">
        <p>
          Complete each missing rule before using these files on the official
          portal.
        </p>
        <ActionLink to="/prepare/download">Continue to download</ActionLink>
      </div>
    </PageFrame>
  )
}

export function DownloadPage() {
  const { slots } = usePack()
  const allReady = slots.every((slot) => slot.status === "ready")
  const readyFiles = slots.filter((slot) => slot.status === "ready" && slot.source?.file)
  const canBuildPackage = allReady && readyFiles.length === slots.length
  const [packageUrl, setPackageUrl] = useState("")
  const [isBuilding, setIsBuilding] = useState(false)
  const [packageError, setPackageError] = useState("")

  useEffect(() => {
    return () => {
      if (packageUrl) URL.revokeObjectURL(packageUrl)
    }
  }, [packageUrl])

  const buildPackage = async () => {
    if (!canBuildPackage) return

    setIsBuilding(true)
    setPackageError("")

    try {
      const names = new Set<string>()
      const entries: Record<string, Uint8Array> = {}

      for (const slot of readyFiles) {
        if (!slot.source?.file) continue
        const preferredName = slot.requirement.filename.trim() || slot.source.name
        const extensionIndex = preferredName.lastIndexOf(".")
        const baseName =
          extensionIndex > 0 ? preferredName.slice(0, extensionIndex) : preferredName
        const extension = extensionIndex > 0 ? preferredName.slice(extensionIndex) : ""
        let fileName = preferredName
        let copy = 2
        while (names.has(fileName)) {
          fileName = `${baseName} (${copy})${extension}`
          copy += 1
        }
        names.add(fileName)
        entries[fileName] = new Uint8Array(await slot.source.file.arrayBuffer())
      }

      const archive = zipSync(entries, { level: 6 })
      const nextUrl = URL.createObjectURL(
        new Blob([archive], { type: "application/zip" }),
      )
      setPackageUrl(nextUrl)
      track({ name: "package_built", fileCount: readyFiles.length })
    } catch {
      setPackageError("The ZIP could not be built in this browser. Try selecting the files again.")
    } finally {
      setIsBuilding(false)
    }
  }

  return (
    <PageFrame
      title="Your pack is ready to leave this browser."
      intro="Build a tidy ZIP from the files you reviewed, then upload each named file to the official form."
      aside={
        <div className="flex items-center gap-2 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">
          <span className={`h-1.5 w-1.5 rounded-full ${canBuildPackage ? "bg-[var(--ready)]" : "bg-[var(--signal)]"}`} aria-hidden="true" />
          Step 5 / 5 · Download
        </div>
      }
    >
      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(19rem,.9fr)] items-start gap-5 max-[56rem]:grid-cols-1">
        <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]" aria-labelledby="package-title">
          <div className="border-b border-[var(--border)] px-5 py-5">
            <p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">
              Application package
            </p>
            <div className="flex items-start gap-4">
              <span className={`mt-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${canBuildPackage ? "bg-[var(--ready-soft)] text-[var(--ready)]" : "bg-[var(--canvas)] text-[var(--signal)]"}`}>
                <FileArchive size={24} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div>
                <h2 id="package-title" className="text-[1.3rem] font-[680] tracking-[-.03em]">
                  {canBuildPackage ? "Ready to package" : "Complete the review first"}
                </h2>
                <p className="mt-1 text-[.82rem] leading-[1.5] text-[var(--muted)]">
                  {readyFiles.length} of {slots.length} files have passed the measured and visual checks.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5">
            <div className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--canvas)] p-4">
              <LockKeyhole className="mt-0.5 shrink-0 text-[var(--signal)]" size={17} strokeWidth={1.8} aria-hidden="true" />
              <p className="text-[.76rem] leading-[1.5] text-[var(--muted)]">
                The ZIP is assembled locally. FormPack does not upload the files or keep a copy.
              </p>
            </div>
            {packageUrl ? (
              <a
                href={packageUrl}
                download="formpack-application-pack.zip"
                className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.84rem] font-[680] text-[var(--surface)] transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--signal)] active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
              >
                <Download size={18} strokeWidth={1.9} aria-hidden="true" />
                Download formpack-application-pack.zip
              </a>
            ) : (
              <button
                type="button"
                onClick={buildPackage}
                disabled={!canBuildPackage || isBuilding}
                className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[.84rem] font-[680] text-[var(--surface)] transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-[var(--signal)] active:scale-[.96] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--raised)] disabled:text-[var(--quiet)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]"
              >
                <Download size={18} strokeWidth={1.9} aria-hidden="true" />
                {isBuilding ? "Building ZIP locally…" : "Build ZIP locally"}
              </button>
            )}
            {packageError ? <p className="text-[.75rem] leading-[1.45] text-[var(--danger)]" role="status">{packageError}</p> : null}
            {!canBuildPackage ? (
              <p className="text-[.75rem] leading-[1.45] text-[var(--muted)]" role="status">
                Return to the check step and mark every file ready before building the package.
              </p>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]" aria-labelledby="submission-title">
          <div className="border-b border-[var(--border)] px-5 py-5">
            <p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Submission checklist</p>
            <h2 id="submission-title" className="text-[1.05rem] font-[680] tracking-[-.02em]">Upload each file carefully</h2>
          </div>
          <ul className="divide-y divide-[var(--border-soft)]">
            {slots.map((slot) => (
              <li key={slot.id} className="flex items-start gap-3 px-5 py-4">
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${slot.status === "ready" ? "bg-[var(--ready-soft)] text-[var(--ready)]" : "bg-[var(--canvas)] text-[var(--quiet)]"}`}>
                  <CheckCircle2 size={13} strokeWidth={2.3} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <strong className="block text-[.78rem]">{slot.name}</strong>
                  <span className="mt-1 block break-words text-[.74rem] leading-[1.4] text-[var(--muted)]">
                    Upload <span className="[font-family:var(--font-mono)]">{slot.requirement.filename}</span> in the portal field labelled “{slot.name}”.
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-[var(--border)] px-5 py-4 text-[.74rem] leading-[1.5] text-[var(--muted)]">
            Always compare the final files with the latest instructions on the official form.
          </p>
        </section>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-y border-[var(--border-soft)] py-4 max-[46rem]:items-start max-[46rem]:flex-col">
        <p className="text-[.76rem] leading-[1.5] text-[var(--muted)]">Need to change a file? You can return to the review list without losing the pack.</p>
        <Link to="/prepare/check" className="inline-flex min-h-11 shrink-0 items-center text-[.78rem] font-[680] text-[var(--ink)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:decoration-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]">Back to checks</Link>
      </div>
    </PageFrame>
  )
}

export function FixPage({
  stage = "start",
}: {
  stage?: "start" | "requirements" | "file" | "result"
}) {
  const { draft, updateDraft, attachFile, reset } = useFix()
  const [previewUrl, setPreviewUrl] = useState("")
  const sourceFile = draft.source?.file

  useEffect(() => {
    if (!sourceFile) {
      setPreviewUrl("")
      return
    }
    const nextUrl = URL.createObjectURL(sourceFile)
    setPreviewUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [sourceFile])

  const errors = [
    "File is too large",
    "File is too small",
    "Wrong dimensions",
    "Wrong format",
    "Photo or signature is unclear",
    "PDF is too large",
    "Another error",
  ]

  const minValue = Number(draft.minKb)
  const maxValue = Number(draft.maxKb)
  const ruleReady = Boolean(
    draft.format &&
      draft.minKb.trim() &&
      draft.maxKb.trim() &&
      minValue > 0 &&
      maxValue >= minValue &&
      draft.dimensions.trim() &&
      draft.filename.trim(),
  )
  const fileMatches = Boolean(
    draft.source &&
      draft.source.size > 0 &&
      draft.source.size <= maxValue * 1024 &&
      fileTypeMatches(draft.format, draft.source.type),
  )

  if (stage === "requirements") {
    return (
      <PageFrame
        title="Copy the portal rule."
        intro="The rejected message tells you where to look. Copy the exact values from the upload field so the next check has something concrete to compare."
        aside={<span className="text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Fix 2 / 4</span>}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(18rem,.72fr)] items-start gap-5 max-[56rem]:grid-cols-1">
          <form className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]" onSubmit={(event) => event.preventDefault()}>
            <div className="border-b border-[var(--border)] px-5 py-5">
              <p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Rule details</p>
              <h2 className="text-[1.2rem] font-[680] tracking-[-.025em]">What should the replacement file meet?</h2>
            </div>
            <div className="grid gap-5 p-5">
              <label className="grid gap-2 text-[.78rem] font-[680] text-[var(--muted)]">
                Accepted format
                <select className="min-h-12 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-base font-normal text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]" value={draft.format} onChange={(event) => updateDraft({ format: event.target.value as "JPG" | "PNG" | "PDF" })}>
                  <option>JPG</option>
                  <option>PNG</option>
                  <option>PDF</option>
                </select>
              </label>
              <fieldset className="grid gap-2 border-0 p-0">
                <legend className="text-[.78rem] font-[680] text-[var(--muted)]">File-size range</legend>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-2 text-[.75rem] text-[var(--muted)]">Minimum (KB)<input className="min-h-12 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]" type="number" min="1" inputMode="numeric" value={draft.minKb} onChange={(event) => updateDraft({ minKb: event.target.value })} placeholder="20" /></label>
                  <label className="grid gap-2 text-[.75rem] text-[var(--muted)]">Maximum (KB)<input className="min-h-12 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-base text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]" type="number" min="1" inputMode="numeric" value={draft.maxKb} onChange={(event) => updateDraft({ maxKb: event.target.value })} placeholder="50" /></label>
                </div>
              </fieldset>
              <label className="grid gap-2 text-[.78rem] font-[680] text-[var(--muted)]">Dimensions or page rule<input className="min-h-12 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-base font-normal text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]" value={draft.dimensions} onChange={(event) => updateDraft({ dimensions: event.target.value })} placeholder="600 × 800 px or up to 10 pages" /></label>
              <label className="grid gap-2 text-[.78rem] font-[680] text-[var(--muted)]">Required filename<input className="min-h-12 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-base font-normal text-[var(--ink)] outline-0 focus:border-[var(--focus)] focus:outline-2 focus:outline-[color-mix(in_oklch,var(--focus)_28%,transparent)]" value={draft.filename} onChange={(event) => updateDraft({ filename: event.target.value })} placeholder="photo.jpg" /></label>
              <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-5 max-[35rem]:items-start max-[35rem]:flex-col">
                <span className="text-[.75rem] leading-[1.45] text-[var(--muted)]" role="status">{ruleReady ? "Rule ready to compare." : "Complete every field to continue."}</span>
                <ActionLink to="/fix/file" disabled={!ruleReady}>Continue to file</ActionLink>
              </div>
            </div>
          </form>

          <aside className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--canvas)] p-5">
            <div className="flex gap-3">
              <FileWarning className="mt-0.5 shrink-0 text-[var(--signal)]" size={18} strokeWidth={1.8} aria-hidden="true" />
              <div>
                <h2 className="text-[.86rem] font-[680]">Selected rejection</h2>
                <p className="mt-2 text-[.8rem] leading-[1.5] text-[var(--muted)]">{draft.reason || "No rejection reason selected yet."}</p>
              </div>
            </div>
            <p className="mt-5 border-t border-[var(--border-soft)] pt-4 text-[.75rem] leading-[1.5] text-[var(--muted)]">If the portal gives a range, copy both ends. Leave a little headroom instead of aiming at the hard maximum.</p>
          </aside>
        </div>
      </PageFrame>
    )
  }

  if (stage === "file") {
    return (
      <PageFrame
        title="Add the rejected file."
        intro="Keep the original file on this device. FormPack will compare its format and size against the rule you copied."
        aside={<span className="text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Fix 3 / 4</span>}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(18rem,.72fr)] items-start gap-5 max-[56rem]:grid-cols-1">
          <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]" aria-labelledby="fix-file-title">
            <div className="border-b border-[var(--border)] px-5 py-5">
              <p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Source file</p>
              <h2 id="fix-file-title" className="text-[1.2rem] font-[680] tracking-[-.025em]">Choose the file the portal rejected</h2>
            </div>
            <label className="mx-5 mt-5 flex min-h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] bg-[var(--canvas)] p-6 text-center transition-colors duration-150 hover:border-[var(--ink)] hover:bg-[var(--raised)] has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-[var(--focus)]">
              <input className="sr-only" type="file" accept={draft.format === "PDF" ? "application/pdf" : "image/*,.heic,.heif,image/heic,image/heif"} onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; void normalizeImageFile(file).then((normalized) => attachFile(normalized)).catch(() => attachFile(file)) }} />
              {previewUrl && draft.format !== "PDF" ? <img src={previewUrl} alt="Rejected file preview" className="max-h-36 max-w-[12rem] rounded border border-[var(--border)] bg-white object-contain [outline:1px_solid_oklch(0_0_0_/_0.1)]" /> : <span className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--quiet)]"><FileWarning size={22} strokeWidth={1.6} aria-hidden="true" /></span>}
              <strong className="max-w-full break-words text-[.86rem]">{draft.source?.name ?? "Choose a file"}</strong>
              <span className="text-[.75rem] text-[var(--muted)]">{draft.source ? "Choose another file" : `Accepted: ${draft.format}`}</span>
            </label>
            <div className="mx-5 my-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5">
              <div><span className="block text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Current size</span><strong className="mt-1 block text-[.8rem] [font-family:var(--font-mono)]">{draft.source ? formatBytes(draft.source.size) : "—"}</strong></div>
              <div><span className="block text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Current type</span><strong className="mt-1 block break-words text-[.8rem] [font-family:var(--font-mono)]">{draft.source?.type || "—"}</strong></div>
            </div>
            <div className="border-t border-[var(--border)] px-5 py-4"><ActionLink to="/fix/result" disabled={!fileMatches}>Review the correction</ActionLink>{draft.source && !fileMatches ? <p className="mt-3 text-[.75rem] leading-[1.45] text-[var(--danger)]" role="status">This file still misses the copied format or size rule.</p> : null}</div>
          </section>

          <aside className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]" aria-label="Copied rule summary">
            <div className="border-b border-[var(--border)] px-5 py-5"><p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Copied rule</p><h2 className="text-[1.05rem] font-[680]">{draft.filename || "Unnamed output"}</h2></div>
            <dl className="divide-y divide-[var(--border-soft)]"><div className="flex justify-between gap-4 px-5 py-4 text-[.76rem]"><dt className="text-[var(--muted)]">Format</dt><dd className="m-0 [font-family:var(--font-mono)]">{draft.format}</dd></div><div className="flex justify-between gap-4 px-5 py-4 text-[.76rem]"><dt className="text-[var(--muted)]">Size</dt><dd className="m-0 [font-family:var(--font-mono)]">{draft.minKb || "—"}–{draft.maxKb || "—"} KB</dd></div><div className="flex justify-between gap-4 px-5 py-4 text-[.76rem]"><dt className="text-[var(--muted)]">Visual rule</dt><dd className="m-0 max-w-[12rem] text-right [font-family:var(--font-mono)]">{draft.dimensions || "—"}</dd></div></dl>
          </aside>
        </div>
      </PageFrame>
    )
  }

  if (stage === "result") {
    return (
      <PageFrame
        title="Review the correction."
        intro="A measured pass tells you the file is inside the copied rule. Visual quality still needs your eyes before you submit."
        aside={<span className="text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Fix 4 / 4</span>}
      >
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(18rem,.9fr)] items-start gap-5 max-[56rem]:grid-cols-1">
          <section className={`overflow-hidden rounded-[var(--radius-md)] border bg-[var(--surface)] ${fileMatches ? "border-[var(--ready)]" : "border-[var(--danger)]"}`} aria-labelledby="fix-result-title">
            <div className="flex items-start gap-4 border-b border-[var(--border)] px-5 py-5">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${fileMatches ? "bg-[var(--ready-soft)] text-[var(--ready)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}><CheckCircle2 size={22} strokeWidth={1.9} aria-hidden="true" /></span>
              <div><p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Mechanical review</p><h2 id="fix-result-title" className="text-[1.25rem] font-[680] tracking-[-.025em]">{fileMatches ? "Inside the copied rule" : "Still outside the copied rule"}</h2><p className="mt-1 text-[.8rem] leading-[1.5] text-[var(--muted)]">{draft.source ? `${draft.source.name} · ${formatBytes(draft.source.size)}` : "No rejected file has been added yet."}</p></div>
            </div>
            <div className="grid gap-3 p-5"><div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3 text-[.78rem]"><span className="text-[var(--muted)]">Format</span><strong className={draft.source && fileTypeMatches(draft.format, draft.source.type) ? "text-[var(--ready)]" : "text-[var(--danger)]"}>{draft.source?.type || "Needs a file"}</strong></div><div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3 text-[.78rem]"><span className="text-[var(--muted)]">File size</span><strong className={draft.source && draft.source.size <= maxValue * 1024 ? "text-[var(--ready)]" : "text-[var(--danger)]"}>{draft.source ? `${formatBytes(draft.source.size)} / ${draft.maxKb} KB max` : "Needs a file"}</strong></div><div className="flex items-center justify-between text-[.78rem]"><span className="text-[var(--muted)]">Visual review</span><strong className="text-[var(--signal)]">Still required</strong></div></div>
          </section>
          <aside className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--canvas)] p-5"><div><p className="mb-1 text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Next move</p><h2 className="text-[1.05rem] font-[680]">{fileMatches ? "Choose how to prepare it" : "Change the file or rule"}</h2></div><p className="text-[.78rem] leading-[1.5] text-[var(--muted)]">{fileMatches ? "The checks are complete for the values you copied. Use a focused tool if the file still needs resizing, compression, or cleanup." : "Return to the file step to choose a smaller file or revisit the exact values from the portal."}</p><div className="grid gap-2">{fileMatches ? <ActionLink to={draft.format === "PDF" ? "/pdf-compressor" : "/photo-compressor"}>Open a focused tool</ActionLink> : <ActionLink to="/fix/file">Change the file</ActionLink>}<ActionLink to="/fix" secondary>Fix another rejection</ActionLink></div></aside>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame
      title="What did the portal reject?"
      intro="Start with the message closest to what you saw. We’ll turn it into a short, measurable review."
      aside={<span className="text-[.68rem] uppercase tracking-[.06em] text-[var(--quiet)] [font-family:var(--font-mono)]">Fix 1 / 4</span>}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(18rem,.72fr)] items-start gap-5 max-[56rem]:grid-cols-1">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
        {errors.map((error) => (
          <Link to="/fix/requirements" key={error} onClick={() => updateDraft({ reason: error })} className="group flex min-h-14 items-center gap-3 border-b border-[var(--border-soft)] px-5 py-4 text-[.82rem] transition-colors last:border-b-0 hover:bg-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--focus)]">
            <FileWarning size={18} strokeWidth={1.7} className="shrink-0 text-[var(--signal)]" aria-hidden="true" />
            <span className="flex-1">{error}</span>
            <ArrowRight size={18} className="text-[var(--quiet)] transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        ))}
        </div>
        <aside className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--canvas)] p-5"><div className="flex gap-3"><ScanSearch className="mt-0.5 shrink-0 text-[var(--signal)]" size={18} strokeWidth={1.8} aria-hidden="true" /><div><h2 className="text-[.86rem] font-[680]">Why start here?</h2><p className="mt-2 text-[.78rem] leading-[1.5] text-[var(--muted)]">A rejection message is a clue, not a complete specification. We’ll ask for the exact format, size, and visual rule next.</p></div></div><button type="button" className="mt-5 inline-flex min-h-11 items-center text-[.75rem] font-[680] text-[var(--ink)] underline decoration-[var(--border)] underline-offset-4" onClick={reset}>Clear previous fix</button></aside>
      </div>
    </PageFrame>
  )
}

export function QuickToolsPage({ tool }: { tool?: string }) {
  const selected = quickTools.find((item) => item.to.endsWith(tool ?? ""))

  if (tool && selected) {
    return (
      <PageFrame
        title={selected.title}
        intro={selected.description}
        aside={<PrivacyNotice compact />}
      >
        <div className="stage-placeholder">
          <ScanSearch size={34} strokeWidth={1.4} aria-hidden="true" />
          <p>
            This focused tool will reuse the same local processing engine as an
            application pack, with one rule and one file.
          </p>
          <ActionLink to="/prepare/requirements">
            Use the guided pack instead
          </ActionLink>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame
      title="Fix one file without making a pack."
      intro="Quick tools are for a single known rule. Use the guided pack when a form needs several files."
      aside={<PrivacyNotice compact />}
    >
      <div className="quick-tool-list">
        {quickTools.map((item, index) => (
          <Link to={item.to} className="quick-tool-row" key={item.title}>
            <span>{index + 1}</span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </PageFrame>
  )
}

function PolicyPage({ content }: { content: ArticleContent }) {
  return (
    <PageFrame title={content.title} intro={content.intro[0]}>
      <article className="prose-page">
        <p className="page-updated">
          Last updated {formatDate(content.updatedAt)}
        </p>
        <ArticleBody
          sections={content.sections}
          faqs={content.faqs}
          sources={content.sources}
        />
      </article>
    </PageFrame>
  )
}

export function PrivacyPage() {
  return <PolicyPage content={sitePages.privacy} />
}

export function AboutPage() {
  return <PolicyPage content={sitePages.about} />
}

export function LimitationsPage() {
  return <PolicyPage content={sitePages.limitations} />
}

export function TermsPage() {
  return <PolicyPage content={sitePages.terms} />
}

export function EditorialPage() {
  return <PolicyPage content={sitePages.editorial} />
}

export function CookiesPage() {
  return <PolicyPage content={sitePages.cookies} />
}

export function ContactPage() {
  return (
    <PageFrame
      title={sitePages.contact.title}
      intro={sitePages.contact.intro[0]}
    >
      <article className="prose-page">
        <p className="contact-email">
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
        <ArticleBody
          sections={sitePages.contact.sections}
          faqs={sitePages.contact.faqs}
        />
      </article>
    </PageFrame>
  )
}

export function NotFoundPage() {
  return (
    <PageFrame
      title="Page not found"
      intro="This route is not part of the FormPack workflow."
    >
      <ActionLink to="/">Return home</ActionLink>
    </PageFrame>
  )
}
