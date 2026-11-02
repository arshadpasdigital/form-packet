import { SITE, type Faq, type SourceLink } from "./content"
import { examPresets, type ExamPreset } from "./exam-presets"

export type ExamFamily = {
  slug: string
  name: string
  seoTitle: string
  description: string
  intro: string[]
  exams: ExamPreset[]
  differences: string[]
  steps: string[]
  rejectionReasons: string[]
  notes: string[]
  faqs: Faq[]
  sources: SourceLink[]
  updatedAt: string
}

function exams(...slugs: string[]): ExamPreset[] {
  return slugs.map((slug) => {
    const exam = examPresets.find((item) => item.slug === slug)
    if (!exam) throw new Error(`Unknown exam preset: ${slug}`)
    return exam
  })
}

export const examFamilies: ExamFamily[] = [
  {
    slug: "ssc-exams",
    name: "SSC exams",
    seoTitle: "SSC photo and signature requirements: CGL, CHSL, MTS, GD | FormPack",
    description:
      "Compare the photo and signature rules for SSC CGL, CHSL, MTS and GD Constable applications, with preparation steps and the reasons an upload is rejected.",
    intro: [
      "SSC CGL, CHSL, MTS and GD Constable applications all go through the Staff Selection Commission's online application system, and all four ask for the same two uploads: a photograph and a signature. The values commonly published for the four exams are also the same in this reference, so a photo and signature prepared for one SSC post will normally satisfy the others.",
      "The practical difference between these exams is the post, the eligibility conditions and the cycle timetable, not the shape of the upload field. That is why one page can cover all four without asking you to learn a separate set of numbers for each notification.",
      "This page lists the shared photo and signature values, explains what the portal measures, and walks through the mistakes that make a correctly sized SSC file fail. Treat every number as a starting point and copy the exact rule from the notice attached to your application.",
    ],
    exams: exams("ssc-cgl", "ssc-chsl", "ssc-mts", "ssc-gd"),
    differences: [
      "CGL, CHSL, MTS and GD Constable use a 200 × 230 px photograph and a 140 × 60 px signature in the current presets.",
      "The photo range is usually 20–50 KB and the signature range is usually 10–20 KB, both commonly JPG.",
      "Some posts add a later document-verification stage, but the online application still begins with the same two uploads.",
      "The notice for your cycle remains authoritative; byte ranges and dimensions can change between years.",
      "GD Constable and MTS applicants often work from a phone, so check the orientation and crop rather than letting the browser stretch the image.",
    ],
    steps: [
      "Open the SSC notice for your post and write the photo and signature rules down separately, including units.",
      "Start from the original camera or scanner file, not a screenshot, chat attachment, or forwarded copy.",
      "Crop the photo to a 200 × 230 frame with the face centred against a plain light background.",
      "Export a JPEG and aim for the middle of 20–50 KB rather than the exact ceiling.",
      "Scan the signature on plain white paper with dark ink and crop it to 140 × 60 px.",
      "Keep the whole signature inside the frame and export a JPEG in the 10–20 KB range.",
      "Run both files through the checker to confirm the real format, pixel dimensions, and byte size.",
      "Keep the originals until the application is submitted and the fee status is confirmed.",
    ],
    rejectionReasons: [
      "The photo is below the 20 KB minimum even though it looks fine on screen.",
      "The portal reads the real file type, so a renamed PNG still fails as a JPG.",
      "A phone photo is thousands of pixels wide and gets squeezed into 200 × 230 instead of being cropped.",
      "HEIC files from an iPhone are not accepted by the upload field.",
      "The signature scan includes the edge of the paper, a table, or a shadow.",
      "The signature is cut off at the top or bottom because the crop was too tight.",
      "The filename contains spaces or an unusual extension that the field rejects.",
    ],
    notes: [
      "Requirements can change between SSC cycles; the current notice always takes precedence.",
      "The values here are a preparation reference, not an approval from the Commission.",
      "Keep a copy of the original photo and signature after you submit.",
      "Do not edit a file to remove a feature that the notice asks you to show.",
    ],
    faqs: [
      {
        question: "Do CGL, CHSL, MTS and GD Constable use the same photo size?",
        answer:
          "In the values commonly published for these four exams, yes: a 20–50 KB JPG around 200 × 230 px. Confirm the figure in the notice for your cycle before uploading.",
      },
      {
        question: "Why does an SSC photo under 50 KB still get rejected?",
        answer:
          "The portal may also check the minimum size, pixel dimensions, real format, face position, or background. Measure every published rule, not only the maximum.",
      },
      {
        question: "Can I reuse the same photo and signature for two SSC applications?",
        answer:
          "If both forms are for the same cycle and the files still meet the rule, reuse is usually fine. Check each notice, because a later cycle can change the range.",
      },
      {
        question: "Does SSC accept a PNG photo?",
        answer:
          "The presets here use JPG, which is the usual format for SSC uploads. If the notice lists only JPG or JPEG, export a real JPEG rather than renaming the file.",
      },
      {
        question: "What should I do if my signature is only 8 KB?",
        answer:
          "Rescan or re-export at a higher quality setting so the file reaches the minimum naturally. Adding bytes to a faint image does not make it more readable.",
      },
      {
        question: "Is a phone selfie acceptable for the SSC photo?",
        answer:
          "A recent colour photo with a plain light background can qualify, but follow the visual example in the notice. Avoid filters, heavy shadows, and cropped head or shoulders.",
      },
    ],
    sources: [
      { label: "Staff Selection Commission", url: "https://ssc.gov.in/" },
      {
        label: "SSC exam photo and signature guide",
        url: "https://www.formpack.online/guides/ssc-exam-photo-signature-requirements",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  {
    slug: "bank-exams",
    name: "Bank exams",
    seoTitle: "Bank exam photo, signature, thumb and declaration rules | FormPack",
    description:
      "IBPS PO, IBPS Clerk and SBI PO upload rules for the photo, signature, left thumb impression and handwritten declaration, with a preparation workflow.",
    intro: [
      "Bank recruitment applications are the most field-heavy of the exam families covered here. IBPS PO and IBPS Clerk ask for four separate uploads — photograph, signature, left thumb impression and handwritten declaration — while the SBI PO preset on this page lists the photograph and signature, with the advertisement deciding whether more fields apply.",
      "Each field has its own byte range and pixel frame. The most common mistake is to apply the photo rule to every file and then wonder why the declaration or thumb impression is rejected.",
      "This page brings the three bank presets together, shows which values are shared and which belong to a single field, and explains how to capture the thumb impression and handwritten declaration so they survive a manual review.",
    ],
    exams: exams("ibps-po", "ibps-clerk", "sbi-po"),
    differences: [
      "IBPS PO and IBPS Clerk share identical published values: photo 20–50 KB at 200 × 230, signature 10–20 KB at 140 × 60, left thumb 20–50 KB at 240 × 240, declaration 50–100 KB at 800 × 400.",
      "SBI PO's preset covers the photograph and signature; check the SBI advertisement for any additional field.",
      "The thumb impression is square at 240 × 240, while the declaration is a wide landscape frame at 800 × 400.",
      "The declaration is not a second signature: it is a handwritten sentence requested in the notification.",
      "IBPS and SBI publish separate notices, so a file prepared for one bank is not automatically valid for the other.",
    ],
    steps: [
      "Copy each field's format, size, and dimensions from the current notification into four separate notes.",
      "Prepare the photograph in the 200 × 230 frame and export it in the 20–50 KB range.",
      "Crop the signature to 140 × 60 and export it in the 10–20 KB range.",
      "Ink the left thumb evenly on plain paper, capture it flat without a shadow, and crop to 240 × 240.",
      "Write the exact declaration sentence from the notification on plain white paper.",
      "Crop the declaration to the 800 × 400 frame and export it in the 50–100 KB range.",
      "Check every file separately with the checker; do not assume one field's result applies to another.",
      "Upload the files in the order the portal shows and keep all originals until the application is confirmed.",
    ],
    rejectionReasons: [
      "Using the photo's 20–50 KB range for the signature.",
      "A declaration written with a different sentence, or with words missing.",
      "A thumb impression cropped at an edge or covered by the phone's shadow.",
      "A scanned declaration uploaded sideways or upside down.",
      "A signature typed in a font instead of written by hand.",
      "A file that passes the byte check but sits outside 240 × 240 or 800 × 400.",
      "Forgetting the minimum on the thumb impression and submitting a 9 KB file.",
    ],
    notes: [
      "Bank notifications are published per recruitment cycle; the current one always wins over a preset.",
      "The values here are a preparation reference, not an approval from IBPS or SBI.",
      "Keep the original thumb impression and declaration until the application is confirmed.",
      "Do not reuse the photo, signature, thumb, and declaration rule interchangeably.",
    ],
    faqs: [
      {
        question: "Which thumb impression do bank exams require?",
        answer:
          "The commonly published rule is the left thumb impression. Follow the current notification if it names a different hand or a different field.",
      },
      {
        question: "Do IBPS PO and IBPS Clerk need the same four files?",
        answer:
          "In the values used here, yes: photo, signature, left thumb impression, and handwritten declaration. Confirm each field in the notice for your cycle.",
      },
      {
        question: "Is a handwritten declaration required for SBI PO?",
        answer:
          "The SBI PO preset here lists the photograph and signature. Read the SBI advertisement for that recruitment, because it decides whether a declaration or thumb impression is also required.",
      },
      {
        question: "Can I use the photo file for the thumb impression?",
        answer:
          "No. They are different documents with different content, dimensions, and size ranges.",
      },
      {
        question: "Why is my declaration rejected when the file size is correct?",
        answer:
          "The sentence may differ from the notification, the writing may be unclear, the image may be rotated, or the crop may fall outside the required frame.",
      },
      {
        question: "How do I avoid a smudged thumb impression?",
        answer:
          "Use even ink on plain paper, press flat without rocking your thumb, and capture the impression straight on with no shadow. Inspect it at normal zoom before cropping.",
      },
      {
        question: "Can I prepare bank files on a phone?",
        answer:
          "Yes, but crop to the exact frame and check the orientation before export. A phone's default camera output is much larger than any of these ranges.",
      },
    ],
    sources: [
      { label: "Institute of Banking Personnel Selection", url: "https://www.ibps.in/" },
      { label: "State Bank of India", url: "https://sbi.co.in/" },
      {
        label: "Bank exam photo and signature guide",
        url: "https://www.formpack.online/guides/bank-exam-photo-signature-requirements",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  {
    slug: "railway-exams",
    name: "Railway exams",
    seoTitle: "RRB photo and signature requirements: NTPC, Group D, ALP | FormPack",
    description:
      "Railway Recruitment Board photo and signature rules for NTPC, Group D and ALP, including the 320 × 240 photo frame and 160 × 80 signature.",
    intro: [
      "RRB NTPC, Group D and ALP applications use a different file shape from SSC and bank forms. The photo is a landscape 320 × 240 frame in the current presets, and the signature is a wide 160 × 80 frame. Both are smaller in bytes than the equivalent SSC files, with a 15–40 KB photo range and a 10–40 KB signature range.",
      "That landscape photo trips up applicants who reuse a portrait file. Stretching a 200 × 230 portrait into 320 × 240 changes the proportions of the face, and a manual reviewer notices it quickly.",
      "This page covers the three railway presets, explains the frame shapes, and gives a preparation sequence that keeps the face and signature in proportion.",
    ],
    exams: exams("rrb-ntpc", "rrb-group-d", "rrb-alp"),
    differences: [
      "The photo range is 15–40 KB at 320 × 240, which is a landscape 4:3 frame.",
      "The signature range is 10–40 KB at 160 × 80, which is a wide 2:1 frame.",
      "The three RRB exams share these values in the current presets, but notices are published per cycle and can differ by region or post.",
      "The photo maximum is lower than SSC's, so a portrait file cropped from the same source may need a different quality setting.",
      "Check whether the portal asks for a live capture; if it does, the stored file is not the upload.",
    ],
    steps: [
      "Open the RRB notification for your cycle and copy the photo and signature instructions into a note.",
      "Capture a recent colour photo with a plain background and keep the full head and shoulders in frame.",
      "Crop to 320 × 240 in landscape orientation instead of squeezing a portrait file.",
      "Export a JPEG in the 15–40 KB range and inspect it for stretching at normal zoom.",
      "Write the signature on plain white paper and crop to the 160 × 80 frame.",
      "Export the signature in the 10–40 KB range with the whole signature visible.",
      "Check both files for real format, dimensions, byte size, and orientation.",
      "Keep the originals until the application is submitted and the fee is confirmed.",
    ],
    rejectionReasons: [
      "Uploading a portrait crop into the 320 × 240 field, which stretches the face.",
      "Compressing a large image down to 15 KB until it looks soft or blocky.",
      "A signature taller than 80 px, so the top of the letters is cut off.",
      "Using the SSC 200 × 230 frame on an RRB form.",
      "Overshooting 40 KB because the quality slider jumped between steps.",
      "A phone photo with the wrong orientation applied by the gallery app.",
      "A scanned signature with table lines or a page edge in the frame.",
    ],
    notes: [
      "RRB notices are published per cycle; the current notification takes precedence over any preset.",
      "The values here are a preparation reference, not an approval from the Railway Recruitment Board.",
      "Keep the original photo and signature until the application is confirmed.",
      "Do not rotate or stretch a file to make it fit a frame; crop it to the right proportions.",
    ],
    faqs: [
      {
        question: "What is the RRB photo size?",
        answer:
          "A commonly published rule is 15–40 KB JPG around 320 × 240 px. Confirm the figure in the notification for your cycle.",
      },
      {
        question: "What is the RRB signature size?",
        answer:
          "A commonly published rule is 10–40 KB JPG around 160 × 80 px. The photo uses a different range and frame.",
      },
      {
        question: "Why is the RRB photo landscape instead of portrait?",
        answer:
          "That is the frame used in the presets here. Do not stretch a portrait image to fill it; crop the source to 320 × 240 so the face keeps its proportions.",
      },
      {
        question: "Can I use the same files for NTPC and Group D?",
        answer:
          "The published values are the same in this reference, but the notices are separate. If both applications use the same cycle rule, a correctly prepared file can be reused.",
      },
      {
        question: "Why does a photo under 40 KB get rejected?",
        answer:
          "The portal may be checking dimensions, format, orientation, or the 15 KB minimum. A passing byte size is only one part of the rule.",
      },
      {
        question: "Can I use a selfie for the RRB photo?",
        answer:
          "Use the visual example in the notification. A plain background and a clearly visible face matter more than how the photo was captured.",
      },
    ],
    sources: [
      { label: "Indian Railways", url: "https://indianrailways.gov.in/" },
      {
        label: "RRB photo and signature guide",
        url: "https://www.formpack.online/guides/rrb-exam-photo-signature-requirements",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  {
    slug: "nta-exams",
    name: "NTA exams",
    seoTitle: "NTA photo, signature and thumb rules: NEET UG and JEE Main | FormPack",
    description:
      "NEET UG and JEE Main upload rules for the photo, signature and thumb impression, with the wide NTA size ranges explained.",
    intro: [
      "NEET UG and JEE Main are conducted by the National Testing Agency, and both presets on this page use three uploads: a photograph, a signature and a thumb impression. The striking part of the NTA rules is the width of the permitted byte ranges: 10–200 KB for the photo, 4–30 KB for the signature and 10–200 KB for the thumb impression.",
      "A wide range is not permission to ignore size. It shifts the risk to dimensions, clarity and format, because a 150 KB photo and a 15 KB photo can both pass the byte check while only one looks acceptable.",
      "This page compares the two NTA presets, explains how to prepare three different frames, and lists the errors that show up most often in NTA uploads.",
    ],
    exams: exams("neet-ug", "jee-main"),
    differences: [
      "The photo range is 10–200 KB at 200 × 230; the signature is 4–30 KB at 140 × 60; the thumb impression is 10–200 KB at 240 × 240.",
      "NEET UG and JEE Main share these values in the current presets; the information bulletin for your session is authoritative.",
      "The signature has the smallest minimum of any family here at 4 KB, so over-compression is easy to miss.",
      "The thumb impression has the same wide range as the photo but a square 240 × 240 frame.",
      "Where a handwritten declaration is required, it is a separate field with its own sentence and size.",
    ],
    steps: [
      "Open the information bulletin for your session and write down the photo, signature, and thumb rules separately.",
      "Capture each item at a higher resolution than the final output.",
      "Crop the photo to 200 × 230 and export a JPEG comfortably inside 10–200 KB.",
      "Crop the signature to 140 × 60 and keep it above the 4 KB minimum without making it faint.",
      "Ink a left thumb impression evenly on plain paper and crop it square to 240 × 240.",
      "Export the thumb impression inside 10–200 KB and check for shadows at the edges.",
      "Inspect all three files at normal zoom and run each through the checker.",
      "Keep the originals until the application is submitted and the confirmation is saved.",
    ],
    rejectionReasons: [
      "A signature compressed to 3 KB and too faint to read.",
      "A photo that passes at 190 KB but is soft or pixelated at 200 × 230.",
      "A thumb impression captured with a shadow or at an angle.",
      "A typed signature used instead of handwriting.",
      "Confusing the photo range with the thumb impression range.",
      "A square thumb candidate squeezed into a portrait crop, or the reverse.",
      "Not re-checking after the portal displays an error on one field.",
    ],
    notes: [
      "NTA values can change between sessions; the current information bulletin takes precedence.",
      "The values here are a preparation reference, not an approval from the National Testing Agency.",
      "Keep the original photo, signature, and thumb impression until the application is confirmed.",
      "Do not pad a tiny file with extra bytes; export from a higher-resolution source instead.",
    ],
    faqs: [
      {
        question: "What is the NEET photo size?",
        answer:
          "A commonly published rule is 10–200 KB JPG around 200 × 230 px. Confirm the figure in the current information bulletin.",
      },
      {
        question: "What is the JEE Main signature size?",
        answer:
          "A commonly published rule is 4–30 KB JPG around 140 × 60 px. The photo and thumb impression use separate ranges.",
      },
      {
        question: "Why is the NTA range so wide?",
        answer:
          "The portal publishes a broad accepted band, but clarity, dimensions, and format are still checked. A file at either end of the range can fail a visual review.",
      },
      {
        question: "Can I use a digital signature for NEET or JEE?",
        answer:
          "Use a handwritten signature as instructed. A typed or digitally drawn signature may be rejected in a manual review.",
      },
      {
        question: "Why is my thumb impression rejected?",
        answer:
          "It may be outside the size or dimension range, unclear, cropped, shadowed, or in the wrong format. Compare it with the bulletin's example.",
      },
      {
        question: "Do NEET and JEE use the same three files?",
        answer:
          "The presets share the same ranges, but the bulletins are published separately. Check the bulletin for your session before assuming a file will transfer.",
      },
      {
        question: "How do I keep a signature from dropping below 4 KB?",
        answer:
          "Start from a clean, high-resolution scan and export at a moderate quality setting. If the result is still tiny, rescan with more ink coverage rather than adding bytes.",
      },
    ],
    sources: [
      { label: "National Testing Agency", url: "https://neet.nta.nic.in/" },
      { label: "JEE Main", url: "https://jeemain.nta.nic.in/" },
      {
        label: "NTA exam photo and signature guide",
        url: "https://www.formpack.online/guides/nta-exam-photo-signature-requirements",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
]

export function getExamFamily(slug: string) {
  return examFamilies.find((family) => family.slug === slug)
}

export function getExamFamilyForExam(examSlug: string) {
  return examFamilies.find((family) =>
    family.exams.some((exam) => exam.slug === examSlug)
  )
}
