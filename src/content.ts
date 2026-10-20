export type ContentSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export type Faq = {
  question: string
  answer: string
}

export type SourceLink = {
  label: string
  url: string
}

export type ArticleContent = {
  title: string
  description: string
  intro: string[]
  sections: ContentSection[]
  faqs: Faq[]
  sources?: SourceLink[]
  updatedAt: string
}

export const SITE = {
  name: "FormPack",
  url: "https://formpack.app",
  email: "support@formpack.app",
  author: "FormPack Editorial Team",
  updatedAt: "2026-10-20",
} as const

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return value
  return `${day} ${MONTHS[month - 1]} ${year}`
}

export const homeContent: ArticleContent = {
  title: "FormPack — exact-size photo and PDF preparation",
  description:
    "Compress exam photos and PDFs into the exact upload-size range, privately in your browser. No account and no file uploads.",
  intro: [
    "FormPack is a browser-based file utility for people applying to government exams, jobs, visas, schools, and other portals that impose strict upload rules. It focuses on one narrow problem: turning an official rule such as 20–50 KB or 75–100 KB into a file that meets the measurable parts of that rule.",
    "Every tool runs on your device. Your photo, signature, or PDF is read by your browser, processed with the Canvas and PDF APIs, and downloaded back to you. FormPack does not receive the file, does not require an account, and does not keep a copy.",
  ],
  sections: [
    {
      heading: "What you can do with FormPack",
      bullets: [
        "Compress a JPG, PNG, or HEIC photo into a minimum and maximum KB range while keeping the dimensions you enter.",
        "Compress a PDF into a target size range when a portal rejects a scan for being too large.",
        "Combine a photo, signature, and thumb impression into one ordered PDF.",
        "Resize an image to exact pixel dimensions when a portal publishes width and height requirements.",
        "Crop and clean a signature image so the writing is easy to inspect before upload.",
      ],
    },
    {
      heading: "Why the exact range matters",
      paragraphs: [
        "Many portals do not accept a file that is merely smaller than the limit. They enforce a window: a photo might need to be at least 20 KB and no more than 50 KB, and a PDF might need to sit between 75 KB and 100 KB. A generic compressor that only aims for smaller can undershoot the minimum or stop at an arbitrary quality setting.",
        "FormPack works from the rule you enter. It resizes the file, adjusts output quality in a loop, and reports whether the result landed inside the range. If the range cannot be reached at the dimensions you requested, it returns the closest result and explains which setting to change.",
      ],
    },
    {
      heading: "How the workflow fits together",
      bullets: [
        "Copy the exact rule from the official form: format, minimum size, maximum size, dimensions, and filename.",
        "Choose the tool that matches the file you need to change.",
        "Add one file and enter the rule. The processing happens locally.",
        "Download the result and compare it with the portal instructions before submitting.",
        "Keep the original file until the portal confirms the upload.",
      ],
    },
    {
      heading: "Privacy is part of the design",
      paragraphs: [
        "Application photos, signatures, and identity documents are sensitive. Uploading them to an unknown converter creates a copy on someone else's server and may leave it there for an unknown period. FormPack avoids that step entirely: file analysis, resizing, compression, PDF building, and ZIP packaging all run in the browser.",
        "The site may serve advertising through Google AdSense. The AdSense script does not receive the contents of the files you process, because those files never leave your device. The privacy page explains the advertising and cookie details in more depth.",
      ],
    },
    {
      heading: "What FormPack cannot decide for you",
      paragraphs: [
        "A file can pass every measurable check and still be rejected. Face position, background colour, lighting, signature legibility, document seals, and portal-specific visual examples require human judgment. FormPack deliberately separates the checks software can make from the review you still need to do.",
        "Always use the current instructions on the official portal. Requirements change between exam cycles, and a preset or an old guide is not a substitute for the notice attached to your application.",
      ],
    },
  ],
  faqs: [
    {
      question: "Is FormPack free to use?",
      answer:
        "Yes. The tools are free and run in your browser. The site is supported by advertising.",
    },
    {
      question: "Do my files leave my device?",
      answer:
        "No. The photo, signature, and PDF tools process files locally with browser APIs. FormPack does not upload your documents to a server.",
    },
    {
      question: "Can FormPack guarantee that a portal will accept my file?",
      answer:
        "No. FormPack measures format, size, dimensions, and page count. Visual rules and portal-specific checks remain your responsibility.",
    },
    {
      question: "Does it work on a phone?",
      answer:
        "Yes. The tools are designed for mobile-first use, including budget Android phones. Very large PDFs can take longer to process on older devices.",
    },
    {
      question: "What should I do if the target range cannot be reached?",
      answer:
        "Use the closest result and read the explanation. Usually the fix is to change the dimensions, widen the maximum size, or switch from PNG to JPEG.",
    },
    {
      question: "Can I use FormPack for a visa or identity document?",
      answer:
        "Yes, but keep the original document and verify the issuing authority's current photo and document rules. FormPack cannot confirm that a document is authentic or acceptable to an authority.",
    },
  ],
  sources: [
    {
      label: "MDN: Image file type and format guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types",
    },
    {
      label: "web.dev: Compress images",
      url: "https://web.dev/articles/compress-images",
    },
  ],
  updatedAt: SITE.updatedAt,
}

export const toolContent: Record<string, ArticleContent> = {
  "/photo-compressor": {
    title: "Photo compressor",
    description:
      "Compress a JPG, PNG, or HEIC photo to the exact file-size range required by an exam or application portal. HEIC files are converted locally. Files stay in your browser.",
    intro: [
      "The photo compressor is for application photos that must land inside a specific KB window. You provide the target minimum and maximum, the pixel dimensions, and the output format. FormPack resizes the image and adjusts quality until the file fits the range, or returns the closest achievable result with an explanation.",
      "This page explains how the tool behaves, which rules it can measure, and how to recover when a portal rejects a photo for a reason the file size alone does not explain.",
    ],
    sections: [
      {
        heading: "Who this tool is for",
        bullets: [
          "Exam and government application forms that publish a photo range such as 20–50 KB.",
          "Job portals that ask for a headshot under a fixed maximum size.",
          "Visa, passport, and admission portals that combine a KB limit with pixel dimensions.",
          "Anyone who needs a smaller photo without sending the original to a cloud converter.",
        ],
      },
      {
        heading: "How the compression loop works",
        paragraphs: [
          "The tool first draws the image onto a canvas at the width and height you enter. It then exports the canvas as JPEG or PNG and checks the resulting byte size. For JPEG, it adjusts the quality setting and repeats the export until the file is inside the requested range or the search reaches its limit.",
          "PNG files do not have a quality setting. If you choose PNG, FormPack returns one PNG at the requested dimensions. If that file misses the range, switch to JPEG or change the dimensions.",
        ],
      },
      {
        heading: "How to use the tool",
        bullets: [
          "Copy the format, minimum size, maximum size, and pixel dimensions from the official form.",
          "Add one JPG, PNG, or HEIC. The tool shows the original size and dimensions; HEIC is converted to JPEG locally.",
          "Enter the minimum and maximum KB values and the exact width and height.",
          "Choose JPEG unless the portal explicitly requires PNG.",
          "Run the compression, check the reported status, and download the result.",
          "Open the downloaded file and review it before uploading.",
        ],
      },
      {
        heading: "JPEG versus PNG for application photos",
        paragraphs: [
          "JPEG is usually the right choice for photographs because it supports lossy compression and can be tuned to a target size. PNG is better for screenshots, signatures, and images with sharp edges or transparency, but it is often larger and cannot be squeezed by quality alone.",
          "Do not rename a PNG file to .jpg and assume the format changed. The bytes inside the file still identify it as PNG, and many portals check the real format rather than the extension.",
        ],
      },
      {
        heading: "Common reasons a photo is rejected",
        bullets: [
          "The file is outside the minimum or maximum size even though it looks small.",
          "The pixel dimensions or aspect ratio differ from the published rule.",
          "The format is PNG when the portal requires JPEG, or the extension does not match the real format.",
          "The filename contains spaces, unusual characters, or the wrong extension.",
          "The face is too small, off-centre, or against the wrong background.",
          "The image is blurry, over-compressed, or visibly stretched.",
        ],
      },
      {
        heading: "What the tool cannot check",
        paragraphs: [
          "FormPack measures the mechanical properties of the file. It does not detect faces, judge lighting, compare your background with the portal's example, or decide whether your expression meets an authority's rules. Those checks need your eyes and the official instructions.",
          "If a portal shows a specific example photo, compare the final file with that example at normal zoom, not only with the file-size number.",
        ],
      },
      {
        heading: "Troubleshooting an unreachable range",
        bullets: [
          "If the result is below the minimum, increase the dimensions or raise the JPEG quality by targeting a higher maximum.",
          "If the result is above the maximum, reduce the dimensions first, then lower the quality.",
          "If you requested PNG, switch to JPEG for quality-based control.",
          "If the range is extremely narrow, widen it slightly or confirm that the portal's units are KB and not KiB.",
          "If the image looks stretched, change the fit mode from stretch to crop or fit inside.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does the photo leave my device?",
        answer:
          "No. The resize and compression loop runs in your browser. The original file and the result stay on your device.",
      },
      {
        question: "Does FormPack accept HEIC or HEIF photos?",
        answer:
          "Yes. An iPhone HEIC/HEIF photo is converted to JPEG locally before compression. The conversion happens in your browser, so the original photo is not uploaded.",
      },
      {
        question: "Why does the tool ask for dimensions as well as file size?",
        answer:
          "Many portals enforce both. A file can be inside the KB range but still fail because its pixel width or height is wrong.",
      },
      {
        question: "Can I compress a PNG to an exact KB range?",
        answer:
          "PNG has no quality slider, so exact range control is limited. Use JPEG when the portal accepts it and you need a precise size.",
      },
      {
        question: "What does 'closest result' mean?",
        answer:
          "It means the requested dimensions and format could not produce a file inside the range. The tool returns the nearest file it could make and explains what to adjust.",
      },
      {
        question: "Will compressing damage the photo?",
        answer:
          "Strong compression can soften details. Check the face and any text at normal zoom. Keep the original so you can try a less aggressive setting.",
      },
      {
        question: "Can I use this for a scanned signature?",
        answer:
          "Yes, but the signature tool is better for cropping and cleaning a signature image. Use this compressor when the signature also has a strict KB limit.",
      },
    ],
    sources: [
      {
        label: "MDN: Image file type and format guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types",
      },
      {
        label: "web.dev: Compress images",
        url: "https://web.dev/articles/compress-images",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  "/pdf-compressor": {
    title: "PDF compressor",
    description:
      "Compress a PDF to the exact file-size range required by an exam or application portal. Files stay in your browser.",
    intro: [
      "The PDF compressor is for scanned certificates, identity documents, and supporting files that exceed a portal's size limit. You enter the target range, and FormPack rewrites the PDF locally at a reduced resolution until the file fits or reaches its closest achievable size.",
      "This page explains the trade-off involved, when rasterization is acceptable, and how to check that the compressed document is still readable.",
    ],
    sections: [
      {
        heading: "What the compressor does",
        paragraphs: [
          "The tool renders each page of the PDF to a canvas at a reduced resolution, converts the rendered page to an image, and rebuilds a new PDF from those images. This is called rasterization. It is effective for scanned documents because the original pages are already images.",
          "The result is a new PDF that contains images rather than the original text objects. The page count and page order are preserved, but selectable text, embedded links, and some accessibility features may be lost.",
        ],
      },
      {
        heading: "When rasterization is a good trade",
        bullets: [
          "The source is a scan or a phone photo of a document.",
          "The portal only needs a readable copy, not a searchable PDF.",
          "The document is mostly images, stamps, or handwriting.",
          "You have kept the original and can compare the result.",
        ],
      },
      {
        heading: "When not to compress this way",
        bullets: [
          "The portal explicitly requires selectable or searchable text.",
          "The PDF contains forms, signatures, or annotations that must remain interactive.",
          "The document is a born-digital certificate where text clarity is more important than size.",
          "The portal requires the original file structure for verification.",
        ],
      },
      {
        heading: "How to use the tool",
        bullets: [
          "Copy the maximum size and page limit from the portal.",
          "Add one PDF and check the page count shown by the tool.",
          "Enter the minimum and maximum KB values.",
          "Run the compression and wait for the local processing pass to finish.",
          "Open the preview and inspect small text, names, dates, stamps, and seals.",
          "Download the result only after the document is still readable.",
        ],
      },
      {
        heading: "A legibility checklist",
        bullets: [
          "Every page opens without an error.",
          "Names, dates, roll numbers, and certificate numbers are readable.",
          "Stamps, seals, and signatures are still visible.",
          "The page count matches the original.",
          "The document is not cropped at the edges.",
          "Small print has not turned into a solid grey block.",
        ],
      },
      {
        heading: "Troubleshooting",
        bullets: [
          "If the result is still too large, reduce the source resolution or split the document only when the portal allows it.",
          "If the result is below the minimum, use a wider range or a higher-resolution source.",
          "If the PDF cannot be read, try an unlocked file with a standard page structure.",
          "If the portal rejects the result, check whether it requires selectable text or a specific PDF version.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does the PDF leave my device?",
        answer:
          "No. The page rendering, compression, and PDF rebuild happen in your browser.",
      },
      {
        question: "Will the compressed PDF still have selectable text?",
        answer:
          "Usually not. The tool rebuilds the pages as images, so selectable text becomes part of the image. Keep the original if the portal requires searchable text.",
      },
      {
        question: "Why does the page count stay the same?",
        answer:
          "The compressor preserves the pages and their order. It changes how each page is stored, not how many pages exist.",
      },
      {
        question: "Can I compress a password-protected PDF?",
        answer:
          "The browser may not be able to read an encrypted PDF. Remove the password with a tool you trust, or ask the issuer for an unlocked copy.",
      },
      {
        question: "What is the best target range?",
        answer:
          "Use exactly what the portal publishes. If it gives only a maximum, set a reasonable minimum above zero and a maximum at or slightly below the limit.",
      },
      {
        question: "Can I combine this with the photo-to-PDF tool?",
        answer:
          "Yes. Build the combined PDF first, then use the PDF compressor if the result needs to be smaller.",
      },
    ],
    sources: [
      {
        label: "MDN: Media formats",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats",
      },
      {
        label: "pdf-lib documentation",
        url: "https://pdf-lib.js.org/",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  "/photo-to-pdf": {
    title: "Photo to PDF",
    description:
      "Combine two or more photos into one PDF locally in your browser, with an optional target size range.",
    intro: [
      "The photo-to-PDF tool is for forms that ask for a photo, signature, and sometimes a thumb impression in a single document. Add the images in the required order, choose a page size, and build one PDF locally.",
      "This page explains page order, page size, image quality, and the checks to make before uploading a combined document.",
    ],
    sections: [
      {
        heading: "What the tool does",
        paragraphs: [
          "Each image becomes one page in the PDF, in the order shown in the list. You can reorder the images before building the file. If you set an optional size range, the tool adjusts image quality until the combined PDF lands inside the range or reaches its closest result.",
        ],
      },
      {
        heading: "Choose the page order deliberately",
        bullets: [
          "Read the portal's field order before adding images.",
          "Put the photo first if the instructions list the photo first.",
          "Keep the signature on its own page unless the portal shows a combined example.",
          "Remove duplicate or unrelated images before building the PDF.",
          "Check the final page count against the portal's limit.",
        ],
      },
      {
        heading: "Page size and margins",
        paragraphs: [
          "A4 is a common default for application documents. Some portals expect the image to fill the page; others expect a margin. FormPack places each image on a page and preserves its aspect ratio. If the portal publishes a page size or margin, use that instruction rather than a generic default.",
          "For a signature page, a wide crop is usually more readable than a full A4 page with a small signature in the middle. Keep enough white space around the writing so the signature is not clipped.",
        ],
      },
      {
        heading: "How to use the tool",
        bullets: [
          "Add the first image, then use the add-another control for each additional image.",
          "Reorder the images until they match the portal's field order.",
          "Choose the page size requested by the portal, or A4 if none is given.",
          "Enter a target size range only if the portal publishes one.",
          "Build the PDF and inspect every page in the preview.",
          "Download the file and keep the original images until the upload is confirmed.",
        ],
      },
      {
        heading: "Troubleshooting",
        bullets: [
          "If the PDF is too large, reduce the source image dimensions or set a lower maximum.",
          "If the PDF is below the minimum, use larger source images or a higher maximum.",
          "If a page is rotated, fix the source image orientation before adding it.",
          "If the signature is unreadable, use the signature tool to crop and clean it first.",
          "If the portal rejects the PDF, check the page count, page size, and required order.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I combine more than two images?",
        answer:
          "Yes. Add as many images as the portal allows, then reorder them before building the PDF.",
      },
      {
        question: "Is the combined PDF uploaded anywhere?",
        answer:
          "No. The images and the PDF are processed in your browser and stay on your device.",
      },
      {
        question: "Can I set a target size range?",
        answer:
          "Yes. The range is optional. If you set one, the tool adjusts image quality to get as close as possible.",
      },
      {
        question: "What page size should I choose?",
        answer:
          "Use the size published by the portal. A4 is a common default when no size is specified.",
      },
      {
        question: "Will the images be stretched?",
        answer:
          "The tool preserves the aspect ratio. If an image looks stretched, check the source image before rebuilding the PDF.",
      },
    ],
    sources: [
      {
        label: "pdf-lib documentation",
        url: "https://pdf-lib.js.org/",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  "/quick-tools/image-dimensions": {
    title: "Image dimensions",
    description:
      "Resize a JPG or PNG image to exact pixel dimensions locally in your browser.",
    intro: [
      "The image dimensions tool changes the pixel width and height of a photo or graphic. It is for portals that publish exact dimensions such as 200 × 230 pixels, 600 × 800 pixels, or a specific aspect ratio.",
      "This page explains pixels versus physical size, how crop and fit modes affect the result, and how to avoid a stretched photo.",
    ],
    sections: [
      {
        heading: "Pixels are what the portal checks",
        paragraphs: [
          "A pixel is a single dot in the image grid. Pixel dimensions describe how many dots wide and high the image is. Physical dimensions such as centimetres or inches depend on how the image is printed, not on the file itself. A portal that asks for 200 × 230 pixels is checking the pixel grid, not a ruler.",
          "DPI (dots per inch) is metadata that helps a printer interpret the image. It does not change the pixel count. A 600 × 800 image is still 600 × 800 whether it is tagged 72 DPI or 300 DPI.",
        ],
      },
      {
        heading: "Aspect ratio and fit modes",
        bullets: [
          "Crop to fill keeps the target dimensions and removes the excess edges. Use it when the face can stay centred.",
          "Fit inside shows the whole image and adds empty space around it. Use it when nothing may be cropped.",
          "Stretch forces the exact dimensions but can distort faces and text. Avoid it for application photos.",
        ],
      },
      {
        heading: "How to use the tool",
        bullets: [
          "Add one JPG or PNG and note the original dimensions.",
          "Enter the exact width and height from the portal.",
          "Choose the fit mode that matches the portal's example.",
          "Resize the image and inspect the preview.",
          "Download the result and compare it with the published dimensions.",
        ],
      },
      {
        heading: "Common mistakes",
        bullets: [
          "Changing only one dimension and accidentally changing the aspect ratio.",
          "Confusing centimetres with pixels.",
          "Assuming DPI changes the file's pixel size.",
          "Using stretch when the portal expects a crop.",
          "Resizing a very small source image up and expecting sharp detail.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does resizing change the file format?",
        answer:
          "The tool keeps the source format by default and lets you choose an output format when the portal requires one.",
      },
      {
        question: "What is the difference between crop and fit?",
        answer:
          "Crop fills the frame and removes excess edges. Fit shows the whole image and may add empty space.",
      },
      {
        question: "Can I resize a signature to 140 × 60 pixels?",
        answer:
          "Yes. Use the crop mode that preserves the writing, then inspect the result at normal zoom.",
      },
      {
        question: "Is the image uploaded?",
        answer:
          "No. The resize happens locally in your browser.",
      },
    ],
    sources: [
      {
        label: "MDN: Image file type and format guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  "/quick-tools/signature": {
    title: "Signature preparation",
    description:
      "Crop, clean, and prepare a signature image locally in your browser.",
    intro: [
      "The signature tool crops a scanned or photographed signature, removes extra background, and produces a clean JPG that is easier to review and upload. It is for forms that ask for a handwritten signature image with a specific ratio or file-size limit.",
      "This page explains what makes a signature image acceptable, how to capture it cleanly, and which problems the tool cannot fix.",
    ],
    sections: [
      {
        heading: "What a good signature image looks like",
        bullets: [
          "The full signature is visible, including the final stroke.",
          "The writing is dark against a plain, light background.",
          "There are no browser edges, table edges, or stray marks.",
          "The image is cropped close to the writing with a small margin.",
          "The aspect ratio matches the portal's example.",
          "The strokes remain readable at normal zoom.",
        ],
      },
      {
        heading: "Capture the signature cleanly",
        bullets: [
          "Sign on plain white paper with the pen requested by the form, if one is specified.",
          "Use even lighting and avoid a shadow across the writing.",
          "Hold the phone parallel to the paper to avoid perspective distortion.",
          "Leave space around the signature so the crop does not clip a stroke.",
          "Use the highest resolution your phone camera offers.",
        ],
      },
      {
        heading: "Crop, contrast, and background",
        paragraphs: [
          "The tool can trim the edges and remove a plain background. It cannot reconstruct a stroke that was cut off in the original, fix a heavily blurred photo, or make a faint pencil signature look like ink. If the source is poor, capture it again.",
          "After processing, inspect the signature at normal size. A signature that looks fine in a thumbnail can lose thin strokes when the file is compressed for a portal.",
        ],
      },
      {
        heading: "Common mistakes",
        bullets: [
          "Submitting a screenshot with the browser or file-manager edges visible.",
          "Using a transparent PNG when the portal only accepts JPG.",
          "Stretching the signature to meet a ratio instead of recropping it.",
          "Compressing so aggressively that the thin strokes disappear.",
          "Cropping the final stroke or the date written beside the signature.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does the signature leave my device?",
        answer:
          "No. The crop and cleanup run in your browser.",
      },
      {
        question: "Can the tool remove a shadow?",
        answer:
          "It can clean a plain background, but a strong shadow across the writing is best fixed by taking a new photo.",
      },
      {
        question: "What format does the tool produce?",
        answer:
          "The signature tool produces a JPG. If the portal requires another format, use the photo compressor or image dimensions tool.",
      },
      {
        question: "Can I set an exact file size?",
        answer:
          "Use the photo compressor for an exact KB range. The signature tool focuses on crop and clarity.",
      },
    ],
    sources: [
      {
        label: "MDN: Image file type and format guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  "/batch": {
    title: "Batch photo compressor",
    description:
      "Compress multiple JPG, PNG, WebP, or HEIC images to an exact KB range in one local batch.",
    intro: [
      "The batch compressor applies one size and dimension rule to several images at once. It is for coaching centers, cyber cafes, families, and anyone preparing more than one application on the same device.",
      "Every file is processed in your browser with the same local worker used by the single-photo compressor. You can download each result separately or build one ZIP.",
    ],
    sections: [
      {
        heading: "What the batch tool does",
        paragraphs: [
          "Select multiple images, enter the minimum and maximum file size, and choose whether to resize them to exact dimensions. The tool processes each file in sequence and reports the final size and whether it landed inside the range.",
          "If you leave the width and height empty, each image keeps its original dimensions. That is useful when the portal only enforces a KB limit and does not publish a pixel rule.",
        ],
      },
      {
        heading: "When to use a batch",
        bullets: [
          "Several applicants need the same photo or signature rule.",
          "A coaching center or cyber cafe is preparing files for a group.",
          "You have multiple scans that need the same PDF or image limit.",
          "You want one ZIP instead of downloading files one by one.",
        ],
      },
      {
        heading: "How to use the batch compressor",
        bullets: [
          "Open the batch tool and choose multiple JPG, PNG, WebP, or HEIC images.",
          "Enter the minimum and maximum KB values from the official form.",
          "Optionally enter the exact width and height for every output.",
          "Choose JPEG unless the portal requires PNG.",
          "Run the batch and review each file's status and final size.",
          "Download individual results or build one ZIP.",
        ],
      },
      {
        heading: "Dimensions and ranges",
        paragraphs: [
          "A batch uses one rule for every file. If the images have different shapes, a fixed width and height can crop some of them more than others. Use the crop-to-fill mode for photos and fit-inside only when nothing may be cut off.",
          "If the range cannot be reached for a file, the tool returns the closest result and marks it. A very small image may not have enough detail to reach a large KB target, and a very large image may not compress below a tight maximum without losing legibility.",
        ],
      },
      {
        heading: "What the batch tool cannot check",
        paragraphs: [
          "The batch tool measures format, size, and dimensions. It does not detect faces, judge backgrounds, or compare each image with a portal's visual example. Those checks still need human review.",
          "Always keep the originals until the portal confirms the upload. A batch result is a prepared copy, not an official approval.",
        ],
      },
      {
        heading: "Troubleshooting",
        bullets: [
          "If a file fails, remove it and try a JPG or PNG copy.",
          "If the result is below the minimum, raise the dimensions or use a higher-quality source.",
          "If the result is above the maximum, lower the dimensions before lowering quality.",
          "If PNG misses the range, switch the batch to JPEG.",
          "If the browser runs out of memory, process fewer files at a time.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do the batch files leave my device?",
        answer:
          "No. Every image is processed locally in the browser. The ZIP is assembled on the device as well.",
      },
      {
        question: "Can I use different rules for different files?",
        answer:
          "The batch applies one rule to all selected files. Use the single-photo compressor when each file needs a different range or dimension.",
      },
      {
        question: "Does the batch accept HEIC photos?",
        answer:
          "Yes. HEIC/HEIF files are converted to JPEG locally before the batch rule is applied. The original files stay on your device.",
      },
      {
        question: "Can I keep the original dimensions?",
        answer:
          "Yes. Leave the width and height fields empty and each image keeps its own dimensions.",
      },
      {
        question: "Why did one file fail?",
        answer:
          "The browser may not be able to decode the file, or the file may be corrupt. Remove it and try a JPG or PNG copy.",
      },
      {
        question: "How many files can I process?",
        answer:
          "It depends on the device's memory. Start with 10–20 photos on a budget phone and add more if the browser stays responsive.",
      },
      {
        question: "Is the ZIP uploaded anywhere?",
        answer:
          "No. The ZIP is built in the browser with the files you already processed locally.",
      },
    ],
    sources: [
      {
        label: "MDN: Image file type and format guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types",
      },
      {
        label: "web.dev: Compress images",
        url: "https://web.dev/articles/compress-images",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  "/file-checker": {
    title: "File pass checker",
    description:
      "Check a photo, signature, or PDF against an upload rule locally before you submit it.",
    intro: [
      "The file pass checker measures one file against the rule you enter. It reports whether the format, file size, dimensions, and PDF page count match, and it flags the parts you still need to review yourself.",
      "The check runs in your browser. The file is not uploaded, and the result is a measurement, not a guarantee that a portal will approve it.",
    ],
    sections: [
      {
        heading: "What the checker measures",
        bullets: [
          "The file's real format, such as JPEG, PNG, or PDF.",
          "The file size in KB, including a minimum and maximum range.",
          "Pixel dimensions for an image.",
          "The page count for a PDF, compared with a maximum.",
          "The filename and extension, if you compare them manually.",
        ],
      },
      {
        heading: "How to use the checker",
        bullets: [
          "Load an exam preset or enter the rule from the official form.",
          "Add one photo, signature, HEIC image, or PDF.",
          "Run the check and review each measured row.",
          "Use the linked compressor if the file misses a rule.",
          "Complete the visual review before uploading to the portal.",
        ],
      },
      {
        heading: "Measured pass is not official approval",
        paragraphs: [
          "A file can pass every measurable check and still be rejected. Face position, background colour, lighting, signature legibility, document seals, and portal-specific examples require human judgment.",
          "Use the checker as a fast pre-flight test. It tells you whether the mechanical parts are right; it does not replace the official instructions.",
        ],
      },
      {
        heading: "Troubleshooting",
        bullets: [
          "If the file cannot be read, try a JPG or PNG copy, or an unlocked PDF.",
          "If the size fails, use the photo or PDF compressor to reach the range.",
          "If the dimensions fail, use the image dimensions tool.",
          "If a HEIC file is rejected by the portal, convert it to JPEG locally first.",
          "If the page count is too high, check whether the portal allows separate uploads.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does the file leave my device?",
        answer:
          "No. The checker reads the file locally in your browser. The file is not uploaded.",
      },
      {
        question: "Does a passing result guarantee approval?",
        answer:
          "No. It means the measured properties match the rule you entered. The portal may apply visual or manual checks that the tool cannot see.",
      },
      {
        question: "Can I check a HEIC photo?",
        answer:
          "Yes. A HEIC/HEIF file is converted to JPEG locally before the dimensions and size are checked.",
      },
      {
        question: "Can I check a PDF?",
        answer:
          "Yes. The checker can measure the PDF size and page count. Use the PDF compressor if it exceeds a limit.",
      },
      {
        question: "Why is the filename check manual?",
        answer:
          "The checker shows the file you selected, but the portal's exact filename pattern is a separate rule. Compare it with the instruction before uploading.",
      },
    ],
    sources: [
      {
        label: "MDN: Image file type and format guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
}

export const sitePages = {
  about: {
    title: "About FormPack",
    description:
      "Learn why FormPack prepares application files locally, how the tools work, and what the site can and cannot verify.",
    intro: [
      "FormPack helps applicants turn a strict upload rule into a file that passes its measurable checks without sending the file anywhere.",
    ],
    sections: [
      {
        heading: "Why FormPack exists",
        paragraphs: [
          "Exam, job, visa, and admission portals reject files for reasons software can measure: the wrong format, the wrong byte size, or the wrong dimensions. Those rejections are frustrating because the rule is often printed in a single line beside the upload field.",
          "FormPack turns that line into a small, explicit workflow. You enter the rule, add one file, and get a result that is measured against the rule. The goal is not to replace the official instructions; it is to remove the avoidable mechanical failures.",
        ],
      },
      {
        heading: "How the tools work",
        paragraphs: [
          "The site is a static React application. Images are drawn onto a canvas, resized, and exported with the browser's image encoder. PDFs are rendered page by page and rebuilt with pdf-lib. ZIP packaging uses fflate. Heavy loops run in a Web Worker so the interface stays usable on a low-end phone.",
          "There is no document-processing server. The application bundle is served as static files, and the file work happens inside the browser tab.",
        ],
      },
      {
        heading: "How content is reviewed",
        paragraphs: [
          "Guides are written to explain a measurable rule, the practical steps, and the limits of what a browser can check. Each guide lists the date it was last updated and links to the official source where one is available.",
          "When a portal changes a requirement, the guide is updated rather than left as a generic checklist. If you find an error, use the contact page and include the guide URL and the official instruction.",
        ],
      },
      {
        heading: "How FormPack is funded",
        paragraphs: [
          "The tools are free. The site may display advertising through Google AdSense. Advertising does not have access to the files you process, because the files never leave your device.",
        ],
      },
      {
        heading: "What FormPack is not",
        paragraphs: [
          "FormPack is not an official application portal, a government service, or a document-verification service. It cannot guarantee that a portal or authority will approve a file. Always check the latest official instructions before you submit.",
        ],
      },
    ],
    faqs: [
      {
        question: "Who runs FormPack?",
        answer:
          "FormPack is maintained by a small editorial and engineering team. Contact support@formpack.app for corrections, privacy requests, or partnership questions.",
      },
      {
        question: "Can I suggest a guide?",
        answer:
          "Yes. Send the exam or portal name, the exact upload rule, and a link to the official instruction.",
      },
      {
        question: "Does FormPack store my files?",
        answer:
          "No. The tools process files in the browser, and the site does not receive the documents.",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  privacy: {
    title: "Your documents stay on your device",
    description:
      "FormPack processes application files locally in your browser and does not receive your documents.",
    intro: [
      "FormPack is designed so sensitive application files do not need to leave your browser. This page explains what the site collects, how advertising works, and the choices you have.",
    ],
    sections: [
      {
        heading: "Local file processing",
        paragraphs: [
          "File analysis, image preparation, PDF preparation, and package creation run in your browser. FormPack does not need an account or cloud document storage for the core workflow, and it does not receive the files you add.",
          "When you close or refresh the tab, the processed files and previews are released by the browser. Download any result you want to keep before leaving the page.",
        ],
      },
      {
        heading: "What the site may collect",
        bullets: [
          "Standard technical information that a web host or content delivery network records, such as the requested URL, browser type, and approximate region.",
          "Privacy-safe product events if an analytics endpoint is configured, such as a workflow starting or finishing and whether a result landed inside the requested range.",
          "Advertising-related data collected by Google AdSense as described below.",
        ],
      },
      {
        heading: "What the site does not collect",
        bullets: [
          "The contents of your photos, signatures, or PDFs.",
          "Filenames or file previews in analytics events.",
          "The requirement values you type into the tools.",
          "An account identity, because there is no account system.",
        ],
      },
      {
        heading: "Advertising and cookies",
        paragraphs: [
          "FormPack may show advertising served by Google AdSense. Google and its partners may use cookies or similar technologies to serve ads based on prior visits to this or other websites. Advertising does not have access to the files you process.",
          "You can opt out of personalised advertising in Google's Ads Settings at https://www.google.com/settings/ads. You can also use the opt-out choices at https://www.aboutads.info/choices/ or manage cookies in your browser. Blocking advertising cookies does not affect the file tools.",
          "For more information about how Google uses information from sites that use its services, see https://policies.google.com/technologies/partner-sites.",
        ],
      },
      {
        heading: "Your choices and rights",
        paragraphs: [
          "You can use the tools without creating an account. You can block or delete cookies through your browser. If you are in a region with data-protection rights, you can contact support@formpack.app to ask about access, correction, or deletion of any personal data the site holds about you.",
          "Because the site does not receive your documents, a request about a processed file usually cannot be fulfilled by FormPack: the file was never on a FormPack server.",
        ],
      },
      {
        heading: "Data retention",
        paragraphs: [
          "Files and previews remain in your browser tab for the duration of the workflow and are released when you close or refresh the page. Server or analytics logs, if any, are kept only as long as needed for security, troubleshooting, and aggregate measurement.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "FormPack is intended for people preparing their own application files. It is not directed at children under 13, and the site does not knowingly collect personal information from children.",
        ],
      },
      {
        heading: "Changes and contact",
        paragraphs: [
          "This policy may be updated when the site's features or advertising arrangements change. The date at the top of the page shows the latest revision. Questions can be sent to support@formpack.app.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are my files uploaded?",
        answer:
          "No. The tools process files in your browser. FormPack does not receive the documents.",
      },
      {
        question: "Does AdSense see my files?",
        answer:
          "No. The advertising script runs on the page, but it does not receive the contents of files processed by the local tools.",
      },
      {
        question: "How do I opt out of personalised ads?",
        answer:
          "Use Google's Ads Settings or the opt-out choices at aboutads.info. You can also block cookies in your browser.",
      },
      {
        question: "How do I request deletion of data?",
        answer:
          "Email support@formpack.app with the request. Because documents are never uploaded, there is usually no stored file to delete.",
      },
    ],
    sources: [
      {
        label: "Google Ads Settings",
        url: "https://www.google.com/settings/ads",
      },
      {
        label: "Google: How Google uses information from sites that use its services",
        url: "https://policies.google.com/technologies/partner-sites",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  contact: {
    title: "Contact FormPack",
    description:
      "Questions, corrections, or feedback about FormPack's tools and guides.",
    intro: [
      "Questions, corrections, or feedback about the tools and the guides are welcome.",
    ],
    sections: [
      {
        heading: "Email",
        paragraphs: [
          "Reach the maintainer at support@formpack.app. Include the page URL and the exact instruction you are checking so the response can be specific.",
        ],
      },
      {
        heading: "Reporting a content error",
        paragraphs: [
          "If a guide quotes an outdated size or dimension, send the guide URL, the current official instruction, and the source. Corrections are reviewed before the page is updated.",
        ],
      },
      {
        heading: "Privacy and advertising",
        paragraphs: [
          "For a privacy request or an advertising question, use the same email address and describe the request in the subject line. Do not send identity documents unless a specific request requires them; the site does not need them to answer a normal question.",
        ],
      },
      {
        heading: "Do not send documents",
        paragraphs: [
          "Please do not attach application photos, signatures, or documents. FormPack is a local tool and cannot inspect individual files.",
        ],
      },
    ],
    faqs: [
      {
        question: "How quickly will I get a reply?",
        answer:
          "Replies are usually sent within a few business days. Include enough detail to make the question actionable.",
      },
      {
        question: "Can you check my file for me?",
        answer:
          "No. The site does not receive files, and the maintainer cannot inspect an application document remotely.",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  limitations: {
    title: "What FormPack can and cannot confirm",
    description:
      "FormPack measures file format and size locally; visual review and portal approval remain your responsibility.",
    intro: [
      "Mechanical checks are useful evidence, not a guarantee that a third-party portal will approve a file.",
    ],
    sections: [
      {
        heading: "Reliable mechanical checks",
        paragraphs: [
          "FormPack can measure file type, byte size, pixel dimensions, aspect ratio, orientation, filename, and PDF page count when the browser supports the file. It can also rebuild an image or PDF to a target size range and report whether the result landed inside the range.",
        ],
      },
      {
        heading: "Human review still matters",
        paragraphs: [
          "Background quality, face position, signature clarity, legibility, and unusual portal instructions require your judgment. Always check the latest official instructions before submission.",
        ],
      },
      {
        heading: "Portal approval is outside the tool",
        paragraphs: [
          "A portal can enforce rules that are not visible in the file: a live face check, a document authenticity check, a manual review, or a requirement that changes between cycles. FormPack cannot predict or guarantee those outcomes.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does a passing result mean the portal will accept the file?",
        answer:
          "No. It means the measured properties match the values you entered. The portal may apply other checks.",
      },
      {
        question: "What should I keep after processing?",
        answer:
          "Keep the original file and the downloaded result until the portal confirms the upload.",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  terms: {
    title: "Terms of Use",
    description:
      "The terms that apply when you use FormPack's browser-based file tools and guides.",
    intro: [
      "These terms explain the basis on which you may use FormPack. They are a plain-language summary, not legal advice.",
    ],
    sections: [
      {
        heading: "Acceptance",
        paragraphs: [
          "By using FormPack, you agree to these terms. If you do not agree, do not use the site.",
        ],
      },
      {
        heading: "What the service is",
        paragraphs: [
          "FormPack provides browser-based file preparation tools and educational content. It is not an official application portal, a government service, or a document-verification service.",
        ],
      },
      {
        heading: "Your responsibilities",
        bullets: [
          "Use only files you have the right to process.",
          "Check the current official instructions for your application.",
          "Keep the original file until the portal confirms the upload.",
          "Do not use the site to create fraudulent or misleading documents.",
          "Do not attempt to disrupt the site or access it in an unauthorised way.",
        ],
      },
      {
        heading: "No guarantee of approval",
        paragraphs: [
          "FormPack measures file properties and aims to produce a result inside the range you enter. It cannot guarantee that a portal, employer, university, embassy, or authority will accept a file.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "The site's text, design, and code are protected by applicable intellectual property laws. You may use the tools for personal application preparation. You may not republish the site's content as your own without permission.",
        ],
      },
      {
        heading: "Advertising and third-party links",
        paragraphs: [
          "The site may display advertising and may link to third-party websites. FormPack does not control those sites and is not responsible for their content, availability, or privacy practices.",
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          "The site is provided on an as-is basis. To the extent permitted by law, FormPack is not liable for losses arising from reliance on a processed file, a missed deadline, a rejected application, or an interruption in the service.",
        ],
      },
      {
        heading: "Changes and contact",
        paragraphs: [
          "These terms may be updated when the service changes. The date on the page shows the latest revision. Questions can be sent to support@formpack.app.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I use FormPack for a commercial service?",
        answer:
          "The tools are intended for personal application preparation. Contact support@formpack.app before using the site as part of a commercial service.",
      },
      {
        question: "Are the guides legal or official advice?",
        answer:
          "No. They are practical explanations. The official instructions for your application always take precedence.",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  editorial: {
    title: "Editorial Policy",
    description:
      "How FormPack researches, writes, reviews, and updates its file-preparation guides.",
    intro: [
      "FormPack publishes practical guides about application file requirements. This page explains how the content is produced and how corrections are handled.",
    ],
    sections: [
      {
        heading: "What we publish",
        paragraphs: [
          "We publish explanations of measurable upload rules, step-by-step preparation workflows, troubleshooting guides, and privacy explainers for people preparing application files.",
        ],
      },
      {
        heading: "How we research",
        bullets: [
          "Start with the official notice or portal instruction for the application.",
          "Record the exact values, units, and filename rules rather than paraphrasing them.",
          "Separate measured requirements from visual checks that need human judgment.",
          "Link to the official source where one is available.",
          "Avoid presenting a generic preset as an authority-approved rule.",
        ],
      },
      {
        heading: "How we review",
        paragraphs: [
          "Guides are reviewed for accuracy, clarity, and consistency with the tool's actual behaviour. A guide should say what the tool can measure, what it cannot measure, and what the applicant still needs to check.",
        ],
      },
      {
        heading: "Updates and corrections",
        paragraphs: [
          "Each guide shows the date it was last updated. When a portal changes a requirement, the guide is revised. If you find an error, send the page URL, the current official instruction, and the source to support@formpack.app.",
        ],
      },
      {
        heading: "Advertising independence",
        paragraphs: [
          "Advertising supports the site, but it does not determine the editorial content. Advertisers do not review or approve guides, and advertising is not presented as advice.",
        ],
      },
      {
        heading: "Limits",
        paragraphs: [
          "FormPack is not an official authority. The instructions published by the application portal or issuing authority always take precedence over a FormPack guide.",
        ],
      },
    ],
    faqs: [
      {
        question: "Who writes the guides?",
        answer:
          "The FormPack editorial and engineering team writes and reviews the guides, using official application instructions as the primary source.",
      },
      {
        question: "How do I report an error?",
        answer:
          "Email support@formpack.app with the page URL and the correct official instruction. Include a link to the source if you have one.",
      },
      {
        question: "Do advertisers influence the content?",
        answer:
          "No. Advertising is separate from editorial content and does not determine which guides are published or what they say.",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
  cookies: {
    title: "Cookie Policy",
    description:
      "How FormPack and its advertising partners use cookies and similar technologies.",
    intro: [
      "This page explains the cookies and similar technologies that may be used when you visit FormPack.",
    ],
    sections: [
      {
        heading: "What cookies are",
        paragraphs: [
          "Cookies are small text files stored by your browser. They can remember preferences, measure site usage, or support advertising. Similar technologies include local storage and pixels.",
        ],
      },
      {
        heading: "Cookies used by the tools",
        paragraphs: [
          "The core file tools do not need advertising cookies to work. The application may use browser storage for a temporary session so a workflow survives a page reload. The processed file itself is not stored in a cookie.",
        ],
      },
      {
        heading: "Advertising cookies",
        paragraphs: [
          "FormPack may use Google AdSense. Google and its partners may use cookies to serve ads based on prior visits to this or other websites. This can include personalised advertising where permitted by law.",
        ],
      },
      {
        heading: "Managing cookies",
        bullets: [
          "Use your browser settings to block or delete cookies.",
          "Use Google's Ads Settings to opt out of personalised advertising.",
          "Use the opt-out choices at aboutads.info for participating advertisers.",
          "Blocking cookies may affect advertising personalisation but should not stop the file tools from working.",
        ],
      },
      {
        heading: "Consent",
        paragraphs: [
          "Where local law requires consent for advertising cookies, the site should present a consent choice before those cookies are used. You can change your choice through the consent control or your browser settings.",
        ],
      },
      {
        heading: "More information",
        paragraphs: [
          "For details about how Google uses information from sites that use its services, see https://policies.google.com/technologies/partner-sites. Questions can be sent to support@formpack.app.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do the file tools need cookies?",
        answer:
          "No. The core processing works without advertising cookies. Temporary browser storage may be used to keep a workflow during a session.",
      },
      {
        question: "How do I opt out of personalised ads?",
        answer:
          "Use Google's Ads Settings or the opt-out choices at aboutads.info. You can also manage cookies in your browser.",
      },
      {
        question: "Does blocking cookies break the tools?",
        answer:
          "No. Blocking advertising cookies should not prevent local file processing.",
      },
    ],
    sources: [
      {
        label: "Google Ads Settings",
        url: "https://www.google.com/settings/ads",
      },
      {
        label: "Google: How Google uses information from sites that use its services",
        url: "https://policies.google.com/technologies/partner-sites",
      },
    ],
    updatedAt: SITE.updatedAt,
  },
} satisfies Record<string, ArticleContent>
