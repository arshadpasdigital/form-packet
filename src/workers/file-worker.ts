import {
  compressImageToRange,
  cropSignature,
  imageToBlob,
  imagesToPdfRange,
  type FitMode,
  type ImageOutputFormat,
} from "@/lib/file-processing"
import { compressPdfToRange, readPdfPageCount } from "@/lib/pdf-processing"

type FilePayload = {
  name: string
  type: string
  size: number
  buffer: ArrayBuffer
}

type WorkerRequest = {
  id: number
  op:
    | "compressImage"
    | "cropSignature"
    | "resizeImage"
    | "imagesToPdf"
    | "compressPdf"
    | "readPdfPageCount"
  files: FilePayload[]
  width?: number
  height?: number
  format?: ImageOutputFormat
  fit?: FitMode
  minKb?: number
  maxKb?: number
  quality?: number
  preset?: string
  trimEdges?: boolean
  removeBackground?: boolean
  pageSize?: "A4" | "Letter"
}

type WorkerResult = {
  buffer: ArrayBuffer
  type: string
  width?: number
  height?: number
  inRange?: boolean
  pageCount?: number
  format?: ImageOutputFormat
}

type WorkerResponse =
  | { id: number; ok: true; result: WorkerResult }
  | { id: number; ok: false; error: string }

function toFile(payload: FilePayload) {
  return new File([payload.buffer], payload.name, { type: payload.type })
}

async function blobToResult(blob: Blob, extra: Partial<WorkerResult> = {}) {
  return {
    buffer: await blob.arrayBuffer(),
    type: blob.type,
    ...extra,
  }
}

async function handle(request: WorkerRequest): Promise<WorkerResult> {
  switch (request.op) {
    case "compressImage": {
      const processed = await compressImageToRange(
        toFile(request.files[0]),
        request.width ?? 0,
        request.height ?? 0,
        request.format ?? "JPEG",
        request.minKb ?? 0,
        request.maxKb ?? 0,
        request.fit ?? "cover",
      )
      return blobToResult(processed.blob, {
        width: processed.width,
        height: processed.height,
        inRange: processed.inRange,
        format: request.format ?? "JPEG",
      })
    }
    case "cropSignature": {
      const blob = await cropSignature(
        toFile(request.files[0]),
        request.preset ?? "3:1 signature strip",
        request.trimEdges ?? true,
        request.removeBackground ?? true,
      )
      return blobToResult(blob, { format: "JPEG" })
    }
    case "resizeImage": {
      const blob = await imageToBlob(
        toFile(request.files[0]),
        request.width ?? 0,
        request.height ?? 0,
        request.format ?? "JPEG",
        request.quality,
        request.fit ?? "cover",
      )
      return blobToResult(blob, {
        width: request.width,
        height: request.height,
        format: request.format ?? "JPEG",
      })
    }
    case "imagesToPdf": {
      const processed = await imagesToPdfRange(
        request.files.map(toFile),
        request.pageSize ?? "A4",
        request.minKb ?? 0,
        request.maxKb ?? Number.MAX_SAFE_INTEGER / 1024,
      )
      return blobToResult(processed.blob, { inRange: processed.inRange })
    }
    case "compressPdf": {
      const processed = await compressPdfToRange(
        toFile(request.files[0]),
        request.minKb ?? 0,
        request.maxKb ?? 0,
      )
      return blobToResult(processed.blob, {
        pageCount: processed.pageCount,
        inRange: processed.inRange,
      })
    }
    case "readPdfPageCount": {
      const pageCount = await readPdfPageCount(toFile(request.files[0]))
      return { buffer: new ArrayBuffer(0), type: "application/pdf", pageCount }
    }
  }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  try {
    const result = await handle(request)
    ;(self as unknown as Worker).postMessage(
      { id: request.id, ok: true, result } satisfies WorkerResponse,
      [result.buffer],
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed."
    ;(self as unknown as Worker).postMessage({
      id: request.id,
      ok: false,
      error: message,
    } satisfies WorkerResponse)
  }
}
