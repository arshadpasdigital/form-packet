import { PDFDocument } from "pdf-lib"

export type ImageOutputFormat = "JPEG" | "PNG"

export type FitMode = "stretch" | "contain" | "cover"

export type ImageRangeResult = {
  blob: Blob
  width: number
  height: number
  inRange: boolean
}

type CanvasLike = HTMLCanvasElement | OffscreenCanvas
type Canvas2DContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function createCanvas(width: number, height: number): CanvasLike {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(Math.max(1, width), Math.max(1, height))
  }
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

function get2dContext(canvas: CanvasLike): Canvas2DContext | null {
  return canvas.getContext("2d") as Canvas2DContext | null
}

function loadImage(file: File) {
  return createImageBitmap(file)
}

function canvasToBlob(
  canvas: CanvasLike,
  type: string,
  quality?: number,
) {
  if ("convertToBlob" in canvas) {
    return (canvas as OffscreenCanvas).convertToBlob({ type, quality })
  }
  return new Promise<Blob>((resolve, reject) => {
    ;(canvas as HTMLCanvasElement).toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The browser could not encode this image.")),
      type,
      quality,
    )
  })
}

export async function imageToBlob(
  file: File,
  width: number,
  height: number,
  format: ImageOutputFormat,
  quality = 0.86,
  fit: FitMode = "cover",
) {
  const image = await loadImage(file)
  const canvas = createCanvas(width, height)
  const context = get2dContext(canvas)
  if (!context) throw new Error("The browser could not create a canvas.")

  const targetWidth = canvas.width
  const targetHeight = canvas.height
  const sourceWidth = image.width
  const sourceHeight = image.height

  if (format === "JPEG") {
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, targetWidth, targetHeight)
  } else if (fit === "contain") {
    context.clearRect(0, 0, targetWidth, targetHeight)
  }

  if (fit === "contain") {
    const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight)
    const drawWidth = sourceWidth * scale
    const drawHeight = sourceHeight * scale
    const drawX = (targetWidth - drawWidth) / 2
    const drawY = (targetHeight - drawHeight) / 2
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight)
  } else if (fit === "cover") {
    const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
    const cropWidth = targetWidth / scale
    const cropHeight = targetHeight / scale
    const cropX = (sourceWidth - cropWidth) / 2
    const cropY = (sourceHeight - cropHeight) / 2
    context.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      targetWidth,
      targetHeight,
    )
  } else {
    context.drawImage(image, 0, 0, targetWidth, targetHeight)
  }

  return canvasToBlob(
    canvas,
    format === "PNG" ? "image/png" : "image/jpeg",
    quality,
  )
}

export async function compressImageToRange(
  file: File,
  width: number,
  height: number,
  format: ImageOutputFormat,
  minKb: number,
  maxKb: number,
  fit: FitMode = "cover",
): Promise<ImageRangeResult> {
  const qualities =
    format === "PNG"
      ? [1]
      : [
          0.96, 0.92, 0.88, 0.84, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5, 0.42, 0.34,
          0.26, 0.18, 0.1,
        ]
  const candidates: Array<{ blob: Blob; quality: number; distance: number }> = []

  for (const quality of qualities) {
    const blob = await imageToBlob(file, width, height, format, quality, fit)
    const sizeKb = blob.size / 1024
    const distance =
      sizeKb < minKb
        ? minKb - sizeKb
        : sizeKb > maxKb
          ? sizeKb - maxKb
          : 0
    candidates.push({ blob, quality, distance })
    if (distance === 0 && format === "JPEG") break
  }

  const selected = candidates.reduce((best, candidate) => {
    if (candidate.distance < best.distance) return candidate
    if (candidate.distance === best.distance && candidate.quality > best.quality)
      return candidate
    return best
  })

  return {
    blob: selected.blob,
    width: Math.round(width),
    height: Math.round(height),
    inRange: selected.distance === 0,
  }
}

export async function cropSignature(
  file: File,
  preset: string,
  trimEdges: boolean,
  removeBackground: boolean,
) {
  const image = await loadImage(file)
  const sourceWidth = image.width
  const sourceHeight = image.height
  let cropWidth = sourceWidth
  let cropHeight = sourceHeight

  if (preset === "3:1 signature strip") {
    cropHeight = Math.min(sourceHeight, sourceWidth / 3)
    cropWidth = Math.min(sourceWidth, cropHeight * 3)
  } else if (preset === "1:1 square") {
    cropWidth = Math.min(sourceWidth, sourceHeight)
    cropHeight = cropWidth
  }

  const cropX = Math.max(0, (sourceWidth - cropWidth) / 2)
  const cropY = Math.max(0, (sourceHeight - cropHeight) / 2)
  const outputWidth = Math.min(1200, Math.max(300, Math.round(cropWidth)))
  const outputHeight = Math.max(
    1,
    Math.round(outputWidth * (cropHeight / cropWidth)),
  )
  const canvas = createCanvas(outputWidth, outputHeight)
  const context = get2dContext(canvas)
  if (!context) throw new Error("The browser could not create a canvas.")
  context.fillStyle = removeBackground ? "#ffffff" : "transparent"
  context.fillRect(0, 0, outputWidth, outputHeight)
  context.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  )
  if (!trimEdges) {
    // The crop preset is still applied; this flag is kept explicit for the result copy.
  }
  return canvasToBlob(canvas, "image/jpeg", 0.9)
}

async function imagesToPdf(
  files: File[],
  pageSize: "A4" | "Letter",
  quality: number,
) {
  const pdf = await PDFDocument.create()
  const pageDimensions =
    pageSize === "Letter" ? [612, 792] : [595.28, 841.89]

  for (const file of files) {
    const source = await loadImage(file)
    const maxDimension = 1600
    const ratio = source.width / source.height
    const targetWidth =
      source.width >= source.height
        ? Math.min(maxDimension, source.width)
        : Math.round(Math.min(maxDimension, source.height) * ratio)
    const targetHeight =
      source.width >= source.height
        ? Math.round(targetWidth / ratio)
        : Math.min(maxDimension, source.height)

    const imageBlob = await imageToBlob(
      file,
      targetWidth,
      targetHeight,
      "JPEG",
      quality,
      "stretch",
    )
    const imageBytes = new Uint8Array(await imageBlob.arrayBuffer())
    const image = await pdf.embedJpg(imageBytes)
    const page = pdf.addPage(pageDimensions as [number, number])
    const margin = 36
    const maxWidth = page.getWidth() - margin * 2
    const maxHeight = page.getHeight() - margin * 2
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
    const width = image.width * scale
    const height = image.height * scale
    page.drawImage(image, {
      x: (page.getWidth() - width) / 2,
      y: (page.getHeight() - height) / 2,
      width,
      height,
    })
  }

  const bytes = await pdf.save({ useObjectStreams: true })
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" })
}

export async function imagesToPdfRange(
  files: File[],
  pageSize: "A4" | "Letter",
  minKb: number,
  maxKb: number,
) {
  const qualities = [0.92, 0.84, 0.76, 0.68, 0.6, 0.5, 0.4]
  const candidates: Array<{ blob: Blob; distance: number }> = []
  for (const quality of qualities) {
    const blob = await imagesToPdf(files, pageSize, quality)
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
  const selected = candidates.reduce((best, candidate) =>
    candidate.distance < best.distance ? candidate : best,
  )
  return { blob: selected.blob, inRange: selected.distance === 0 }
}
