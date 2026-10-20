import { SITE } from "./content"

export type PresetFieldKind =
  | "photo"
  | "signature"
  | "thumb"
  | "declaration"
  | "pdf"

export type PresetField = {
  kind: PresetFieldKind
  label: string
  format: "JPG" | "PNG" | "PDF"
  minKb: number
  maxKb: number
  width?: number
  height?: number
  dimensionsLabel: string
  notes?: string
}

export type ExamPreset = {
  slug: string
  exam: string
  shortName: string
  authority: string
  cycle: string
  updatedAt: string
  source: {
    label: string
    url: string
  }
  summary: string
  guideSlug?: string
  fields: PresetField[]
  steps: string[]
  notes: string[]
}

const photo = (
  minKb: number,
  maxKb: number,
  width: number,
  height: number,
  notes?: string
): PresetField => ({
  kind: "photo",
  label: "Photograph",
  format: "JPG",
  minKb,
  maxKb,
  width,
  height,
  dimensionsLabel: `${width} × ${height} px`,
  notes,
})

const signature = (
  minKb: number,
  maxKb: number,
  width: number,
  height: number,
  notes?: string
): PresetField => ({
  kind: "signature",
  label: "Signature",
  format: "JPG",
  minKb,
  maxKb,
  width,
  height,
  dimensionsLabel: `${width} × ${height} px`,
  notes,
})

const thumb = (minKb: number, maxKb: number, width: number, height: number) =>
  ({
    kind: "thumb",
    label: "Left thumb impression",
    format: "JPG",
    minKb,
    maxKb,
    width,
    height,
    dimensionsLabel: `${width} × ${height} px`,
    notes: "Use a clear impression on plain paper.",
  }) satisfies PresetField

const declaration = (
  minKb: number,
  maxKb: number,
  width: number,
  height: number
) =>
  ({
    kind: "declaration",
    label: "Handwritten declaration",
    format: "JPG",
    minKb,
    maxKb,
    width,
    height,
    dimensionsLabel: `${width} × ${height} px`,
    notes: "Write the exact sentence requested in the current notice.",
  }) satisfies PresetField

const commonSteps = [
  "Open the current official notice for your exam and copy the upload rules.",
  "Capture the photo, signature, and other files at a higher resolution than the final output.",
  "Crop the signature and thumb impression to the required ratio before resizing.",
  "Use the linked FormPack tool to reach the size and dimension range.",
  "Inspect each result at normal zoom before uploading it to the portal.",
  "Keep the original files until the application is submitted successfully.",
]

const commonNotes = [
  "Requirements can change between exam cycles. The current official notice always takes precedence.",
  "The values on this page are a preparation reference, not an official approval.",
  "Compress to the middle of the range when possible; do not aim at the exact maximum.",
  "Keep a copy of the original photo and signature until the portal confirms the upload.",
]

export const examPresets: ExamPreset[] = [
  {
    slug: "ssc-cgl",
    exam: "SSC CGL",
    shortName: "SSC CGL",
    authority: "Staff Selection Commission",
    cycle: "Combined Graduate Level",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Staff Selection Commission",
      url: "https://ssc.gov.in/",
    },
    summary:
      "Photo and signature values commonly published for SSC CGL applications, with a checklist for preparing both files.",
    guideSlug: "ssc-exam-photo-signature-requirements",
    fields: [
      photo(
        20,
        50,
        200,
        230,
        "Recent colour photo with a plain light background."
      ),
      signature(10, 20, 140, 60, "Handwritten signature on plain white paper."),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "ssc-chsl",
    exam: "SSC CHSL",
    shortName: "SSC CHSL",
    authority: "Staff Selection Commission",
    cycle: "Combined Higher Secondary Level",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Staff Selection Commission",
      url: "https://ssc.gov.in/",
    },
    summary:
      "Photo and signature values commonly published for SSC CHSL applications.",
    guideSlug: "ssc-exam-photo-signature-requirements",
    fields: [
      photo(20, 50, 200, 230, "Plain light background; face centred."),
      signature(10, 20, 140, 60, "Full signature visible; no browser edges."),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "ssc-mts",
    exam: "SSC MTS",
    shortName: "SSC MTS",
    authority: "Staff Selection Commission",
    cycle: "Multi-Tasking Staff",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Staff Selection Commission",
      url: "https://ssc.gov.in/",
    },
    summary:
      "Photo and signature values commonly published for SSC MTS applications.",
    guideSlug: "ssc-exam-photo-signature-requirements",
    fields: [
      photo(20, 50, 200, 230),
      signature(10, 20, 140, 60),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "ssc-gd",
    exam: "SSC GD Constable",
    shortName: "SSC GD",
    authority: "Staff Selection Commission",
    cycle: "General Duty Constable",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Staff Selection Commission",
      url: "https://ssc.gov.in/",
    },
    summary:
      "Photo and signature values commonly published for SSC GD Constable applications.",
    guideSlug: "ssc-exam-photo-signature-requirements",
    fields: [
      photo(20, 50, 200, 230),
      signature(10, 20, 140, 60),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "ibps-po",
    exam: "IBPS PO",
    shortName: "IBPS PO",
    authority: "Institute of Banking Personnel Selection",
    cycle: "Probationary Officer",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Institute of Banking Personnel Selection",
      url: "https://www.ibps.in/",
    },
    summary:
      "Photo, signature, thumb impression, and handwritten declaration values commonly published for IBPS PO applications.",
    guideSlug: "bank-exam-photo-signature-requirements",
    fields: [
      photo(20, 50, 200, 230),
      signature(10, 20, 140, 60),
      thumb(20, 50, 240, 240),
      declaration(50, 100, 800, 400),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "ibps-clerk",
    exam: "IBPS Clerk",
    shortName: "IBPS Clerk",
    authority: "Institute of Banking Personnel Selection",
    cycle: "Clerical Cadre",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Institute of Banking Personnel Selection",
      url: "https://www.ibps.in/",
    },
    summary:
      "Photo, signature, thumb impression, and handwritten declaration values commonly published for IBPS Clerk applications.",
    guideSlug: "bank-exam-photo-signature-requirements",
    fields: [
      photo(20, 50, 200, 230),
      signature(10, 20, 140, 60),
      thumb(20, 50, 240, 240),
      declaration(50, 100, 800, 400),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "sbi-po",
    exam: "SBI PO",
    shortName: "SBI PO",
    authority: "State Bank of India",
    cycle: "Probationary Officer",
    updatedAt: SITE.updatedAt,
    source: {
      label: "State Bank of India",
      url: "https://sbi.co.in/",
    },
    summary:
      "Photo and signature values commonly published for SBI PO applications. Check the current SBI advertisement for additional fields.",
    guideSlug: "bank-exam-photo-signature-requirements",
    fields: [
      photo(20, 50, 200, 230),
      signature(10, 20, 140, 60),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "rrb-ntpc",
    exam: "RRB NTPC",
    shortName: "RRB NTPC",
    authority: "Railway Recruitment Board",
    cycle: "Non-Technical Popular Categories",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Indian Railways",
      url: "https://indianrailways.gov.in/",
    },
    summary:
      "Photo and signature values commonly published for RRB NTPC applications.",
    guideSlug: "rrb-exam-photo-signature-requirements",
    fields: [
      photo(15, 40, 320, 240),
      signature(10, 40, 160, 80),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "rrb-group-d",
    exam: "RRB Group D",
    shortName: "RRB Group D",
    authority: "Railway Recruitment Board",
    cycle: "Level 1 posts",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Indian Railways",
      url: "https://indianrailways.gov.in/",
    },
    summary:
      "Photo and signature values commonly published for RRB Group D applications.",
    guideSlug: "rrb-exam-photo-signature-requirements",
    fields: [
      photo(15, 40, 320, 240),
      signature(10, 40, 160, 80),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "rrb-alp",
    exam: "RRB ALP",
    shortName: "RRB ALP",
    authority: "Railway Recruitment Board",
    cycle: "Assistant Loco Pilot",
    updatedAt: SITE.updatedAt,
    source: {
      label: "Indian Railways",
      url: "https://indianrailways.gov.in/",
    },
    summary:
      "Photo and signature values commonly published for RRB ALP applications.",
    guideSlug: "rrb-exam-photo-signature-requirements",
    fields: [
      photo(15, 40, 320, 240),
      signature(10, 40, 160, 80),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "neet-ug",
    exam: "NEET UG",
    shortName: "NEET",
    authority: "National Testing Agency",
    cycle: "Undergraduate medical entrance",
    updatedAt: SITE.updatedAt,
    source: {
      label: "National Testing Agency",
      url: "https://neet.nta.nic.in/",
    },
    summary:
      "Photo, signature, and thumb impression values commonly published for NEET UG applications.",
    guideSlug: "nta-exam-photo-signature-requirements",
    fields: [
      photo(10, 200, 200, 230),
      signature(4, 30, 140, 60),
      thumb(10, 200, 240, 240),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
  {
    slug: "jee-main",
    exam: "JEE Main",
    shortName: "JEE Main",
    authority: "National Testing Agency",
    cycle: "Engineering entrance",
    updatedAt: SITE.updatedAt,
    source: {
      label: "National Testing Agency",
      url: "https://jeemain.nta.nic.in/",
    },
    summary:
      "Photo, signature, and thumb impression values commonly published for JEE Main applications.",
    guideSlug: "nta-exam-photo-signature-requirements",
    fields: [
      photo(10, 200, 200, 230),
      signature(4, 30, 140, 60),
      thumb(10, 200, 240, 240),
    ],
    steps: commonSteps,
    notes: commonNotes,
  },
]

export function getExamPreset(slug: string) {
  return examPresets.find((preset) => preset.slug === slug)
}

export function presetFieldHref(preset: ExamPreset, field: PresetField) {
  if (field.kind === "photo") {
    const search = new URLSearchParams({
      min: String(field.minKb),
      max: String(field.maxKb),
      w: String(field.width ?? ""),
      h: String(field.height ?? ""),
      format: field.format,
      preset: preset.slug,
    })
    return `/photo-compressor?${search.toString()}`
  }

  if (field.kind === "pdf") {
    const search = new URLSearchParams({
      min: String(field.minKb),
      max: String(field.maxKb),
      preset: preset.slug,
    })
    return `/pdf-compressor?${search.toString()}`
  }

  const search = new URLSearchParams({
    min: String(field.minKb),
    max: String(field.maxKb),
    w: String(field.width ?? ""),
    h: String(field.height ?? ""),
    field: field.kind,
    preset: preset.slug,
  })
  return `/quick-tools/signature?${search.toString()}`
}
