import type {
  FitMode,
  ImageOutputFormat,
  ImageRangeResult,
} from "@/lib/file-processing"

export type { FitMode, ImageOutputFormat, ImageRangeResult } from "@/lib/file-processing"

type FilePayload = {
  name: string
  type: string
  size: number
  buffer: ArrayBuffer
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

type Pending = {
  resolve: (value: WorkerResult) => void
  reject: (error: Error) => void
}

let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, Pending>()

function rejectAll(error: Error) {
  for (const entry of pending.values()) entry.reject(error)
  pending.clear()
}

function getWorker() {
  if (worker) return worker

  worker = new Worker(new URL("../workers/file-worker.ts", import.meta.url), {
    type: "module",
  })
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const entry = pending.get(event.data.id)
    if (!entry) return
    pending.delete(event.data.id)
    if (event.data.ok) entry.resolve(event.data.result)
    else entry.reject(new Error(event.data.error))
  }
  worker.onerror = (event) => {
    rejectAll(new Error(event.message || "The local processing worker failed."))
  }

  return worker
}

async function callWorker(
  op: string,
  files: File[],
  extras: Record<string, unknown> = {},
) {
  const target = getWorker()
  const id = nextId
  nextId += 1

  const payloads: FilePayload[] = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: await file.arrayBuffer(),
    })),
  )

  return new Promise<WorkerResult>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    target.postMessage(
      { id, op, files: payloads, ...extras },
      payloads.map((payload) => payload.buffer),
    )
  })
}

function toBlob(result: WorkerResult) {
  return new Blob([result.buffer], { type: result.type })
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
  const result = await callWorker("compressImage", [file], {
    width,
    height,
    format,
    minKb,
    maxKb,
    fit,
  })
  return {
    blob: toBlob(result),
    width: result.width ?? width,
    height: result.height ?? height,
    inRange: result.inRange ?? false,
  }
}

export async function cropSignature(
  file: File,
  preset: string,
  trimEdges: boolean,
  removeBackground: boolean,
) {
  const result = await callWorker("cropSignature", [file], {
    preset,
    trimEdges,
    removeBackground,
  })
  return toBlob(result)
}

export async function imageToBlob(
  file: File,
  width: number,
  height: number,
  format: ImageOutputFormat,
  quality?: number,
  fit: FitMode = "cover",
) {
  const result = await callWorker("resizeImage", [file], {
    width,
    height,
    format,
    quality,
    fit,
  })
  return toBlob(result)
}

export async function imagesToPdfRange(
  files: File[],
  pageSize: "A4" | "Letter",
  minKb: number,
  maxKb: number,
) {
  const result = await callWorker("imagesToPdf", files, {
    pageSize,
    minKb,
    maxKb,
  })
  return { blob: toBlob(result), inRange: result.inRange ?? false }
}

export async function compressPdfToRange(
  file: File,
  minKb: number,
  maxKb: number,
) {
  const result = await callWorker("compressPdf", [file], { minKb, maxKb })
  return {
    blob: toBlob(result),
    pageCount: result.pageCount ?? 0,
    inRange: result.inRange ?? false,
  }
}

export async function readPdfPageCount(file: File) {
  const result = await callWorker("readPdfPageCount", [file])
  return result.pageCount ?? 0
}
