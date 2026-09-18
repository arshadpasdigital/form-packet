import * as pdfjs from "pdfjs-dist"
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

import { PDFDocument } from "pdf-lib"

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export type PdfRangeResult = {
  blob: Blob
  pageCount: number
  inRange: boolean
}

function createCanvas(width: number, height: number) {
  return new OffscreenCanvas(
    Math.max(1, Math.ceil(width)),
    Math.max(1, Math.ceil(height)),
  )
}

async function loadPdf(file: File) {
  const data = new Uint8Array(await file.arrayBuffer())
  return pdfjs.getDocument({ data }).promise
}

async function rasterizeLoadedPdf(
  pdf: pdfjs.PDFDocumentProxy,
  scale: number,
  quality: number,
) {
  const output = await PDFDocument.create()
  const pageCount = pdf.numPages

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    const canvas = createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext("2d")
    if (!context) throw new Error("The browser could not rasterize this PDF.")
    await page
      .render({
        canvas: context.canvas as unknown as HTMLCanvasElement,
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
      })
      .promise
    const jpeg = await canvas.convertToBlob({ type: "image/jpeg", quality })
    const imageBytes = new Uint8Array(await jpeg.arrayBuffer())
    const image = await output.embedJpg(imageBytes)
    const pageRef = output.addPage([viewport.width, viewport.height])
    pageRef.drawImage(image, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    })
  }

  const bytes = await output.save({ useObjectStreams: true })
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" })
}

export async function readPdfPageCount(file: File) {
  const pdf = await loadPdf(file)
  const pageCount = pdf.numPages
  await pdf.cleanup()
  return pageCount
}

export async function compressPdfToRange(
  file: File,
  minKb: number,
  maxKb: number,
): Promise<PdfRangeResult> {
  const sourceBytes = await file.arrayBuffer()
  const sourceSizeKb = file.size / 1024
  const pdf = await loadPdf(file)
  const pageCount = pdf.numPages

  if (sourceSizeKb >= minKb && sourceSizeKb <= maxKb) {
    await pdf.cleanup()
    return {
      blob: new Blob([sourceBytes], {
        type: file.type || "application/pdf",
      }),
      pageCount,
      inRange: true,
    }
  }

  const scales = [1, 0.85, 0.7, 0.55, 0.45, 0.35, 0.25]
  const qualities = [0.8, 0.65, 0.5, 0.4, 0.3]
  const candidates: Array<{ blob: Blob; distance: number }> = []

  for (const scale of scales) {
    for (const quality of qualities) {
      const blob = await rasterizeLoadedPdf(pdf, scale, quality)
      const sizeKb = blob.size / 1024
      const distance =
        sizeKb < minKb
          ? minKb - sizeKb
          : sizeKb > maxKb
            ? sizeKb - maxKb
            : 0
      candidates.push({ blob, distance })
      if (distance === 0) break
    }
    if (candidates.some((candidate) => candidate.distance === 0)) break
  }

  await pdf.cleanup()

  const selected = candidates.reduce((best, candidate) =>
    candidate.distance < best.distance ? candidate : best,
  )

  return {
    blob: selected.blob,
    pageCount,
    inRange: selected.distance === 0,
  }
}
