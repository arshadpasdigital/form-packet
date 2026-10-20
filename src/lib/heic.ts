export function isHeicFile(file: File) {
  const name = file.name.toLowerCase()
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  )
}

export async function normalizeImageFile(file: File) {
  if (!isHeicFile(file)) return file

  const { default: heic2any } = await import("heic2any")
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  })
  const blob = Array.isArray(converted) ? converted[0] : converted
  if (!blob) throw new Error("The HEIC image could not be converted.")

  const base = file.name.replace(/\.(heic|heif)$/i, "") || "photo"
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" })
}

export async function normalizeImageFiles(files: File[]) {
  return Promise.all(files.map((file) => normalizeImageFile(file)))
}
