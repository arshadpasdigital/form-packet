import { SITE, type ContentSection, type Faq, type SourceLink } from "./content"

export type SeoGuide = {
  slug: string
  title: string
  seoTitle: string
  description: string
  summary: string
  audience: string
  updatedAt: string
  sections: ContentSection[]
  faqs: Faq[]
  sources?: SourceLink[]
  relatedSlugs: string[]
}

export const seoGuides: SeoGuide[] = [
  {
    slug: "photo-size-and-format-checklist",
    title: "Photo upload requirements: a practical size and format checklist",
    seoTitle: "Photo upload requirements checklist | FormPack",
    description:
      "A plain-language checklist for checking application photo format, file size, dimensions, filename, and visual quality before upload.",
    summary:
      "Application portals often reject a photo for one small mismatch. Check the measurable rules first, then review the parts software cannot judge.",
    audience: "For exam, government, job, school, and visa application forms",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Copy the rule before you edit anything",
        paragraphs: [
          "The first step is not compression. It is transcription. Copy the photo rule from the official form into a note so you can compare each value without relying on memory. A typical rule contains four measurable parts: format, file size, pixel dimensions, and filename.",
          "Write down the units exactly as they appear. A portal that says 20–50 KB is not the same as 20–50 KiB, and a rule that says 3.5 × 4.5 cm is not a pixel rule. If the form gives both a physical size and a pixel size, treat the pixel size as the value the upload field is most likely to check.",
        ],
        bullets: [
          "Accepted format: JPG, JPEG, PNG, or another format.",
          "Minimum and maximum file size, including the unit.",
          "Width and height in pixels, or a physical size plus a resolution.",
          "Required aspect ratio or orientation.",
          "Filename pattern and extension.",
          "Any visual examples or face-position instructions.",
        ],
      },
      {
        heading: "Format: JPG, PNG, and what portals actually check",
        paragraphs: [
          "JPEG is the usual choice for photographs because it compresses well and is accepted by most portals. PNG is useful for screenshots, signatures, and graphics with sharp edges, but it is often larger and does not have a quality slider.",
          "Portals may check the file's real content type rather than its extension. Renaming a PNG to .jpg does not convert it. If the rule says JPG, export a JPEG from an image editor or use a tool that writes a real JPEG file.",
        ],
      },
      {
        heading: "File size: KB, KiB, and headroom",
        paragraphs: [
          "File size is measured in bytes. A kilobyte is usually 1,000 bytes in portal language, while a kibibyte is 1,024 bytes. The difference is small at photo sizes, but it matters when a portal rejects a file that looks like it is exactly at the limit.",
          "Aim for the middle of the range rather than the exact ceiling. If the range is 20–50 KB, a 32–40 KB result leaves room for the portal's own rounding and for small differences between operating systems.",
        ],
      },
      {
        heading: "Pixel dimensions and aspect ratio",
        paragraphs: [
          "Pixel dimensions describe the image grid. A 200 × 230 rule means 200 pixels wide and 230 pixels high. If you resize only the width, the aspect ratio changes and the face can look stretched.",
          "When the portal gives a ratio such as 3:1 for a signature, crop to that ratio before resizing. When it gives exact dimensions, use a crop-to-fill mode for photos and a fit-inside mode only when nothing may be cut off.",
        ],
      },
      {
        heading: "Filename and visual checks",
        paragraphs: [
          "A correct file can still fail because of its name. Remove spaces, unusual punctuation, and extra dots. Keep the extension lowercase if the portal shows a lowercase example. If the portal asks for a specific name, use it exactly.",
          "Finally, open the file at normal zoom. Check the face position, background, lighting, sharpness, and whether the image is cropped at the head or shoulders. These are the checks software cannot make for you.",
        ],
      },
      {
        heading: "A final pre-upload checklist",
        bullets: [
          "The format matches the portal's accepted list.",
          "The file size is inside the range with a little headroom.",
          "The pixel dimensions match the published values.",
          "The filename follows the required pattern.",
          "The face is centred, visible, and against the expected background.",
          "The image is sharp at normal zoom and not visibly over-compressed.",
          "The original file is still saved as a backup.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why does my photo pass the size check but still get rejected?",
        answer:
          "The portal may also check dimensions, format, filename, face position, background, or image quality. Measure every published rule, not only the KB limit.",
      },
      {
        question: "Is 20 KB too small for a photo?",
        answer:
          "It depends on the dimensions and the portal. A small image can fit 20 KB without looking broken, but a large image compressed to 20 KB may lose detail. Follow the portal's range and inspect the result.",
      },
      {
        question: "Can I rename a PNG to JPG?",
        answer:
          "No. Renaming changes the filename, not the file format. Export a real JPEG instead.",
      },
      {
        question: "Should I use the photo from my phone gallery?",
        answer:
          "You can, but check the orientation, dimensions, and background. Phone photos are often much larger than the portal's limit and may need cropping.",
      },
      {
        question: "What is the difference between KB and KiB?",
        answer:
          "A kilobyte is usually 1,000 bytes; a kibibyte is 1,024 bytes. The difference is small but can matter at a strict boundary.",
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
    relatedSlugs: [
      "signature-file-requirements",
      "job-application-upload-checklist",
      "visa-application-file-checklist",
    ],
  },
  {
    slug: "signature-file-requirements",
    title: "Signature image requirements: size, format, and clarity checklist",
    seoTitle: "Signature image requirements checklist | FormPack",
    description:
      "Learn how to check a scanned signature's format, file size, proportions, filename, contrast, and legibility before submitting it.",
    summary:
      "A signature can pass a byte-size check and still be rejected if it is faint, cropped, or proportioned incorrectly. Use both mechanical and visual checks.",
    audience: "For application forms that request a handwritten signature image",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Start with the exact signature rule",
        paragraphs: [
          "Signature rules are usually stricter than photo rules about proportion. A common requirement is a wide strip such as 140 × 60 pixels, 3:1, or a specific KB range. Copy the format, size, ratio, and filename before you scan anything.",
          "If the form asks for a signature in a box on a printed page, the upload rule may still require a separate image. Read the instructions for the upload field, not only the printed form.",
        ],
      },
      {
        heading: "Capture a clean source",
        bullets: [
          "Sign on plain white paper with the pen requested by the form, if one is specified.",
          "Use even lighting and avoid a shadow across the writing.",
          "Hold the phone parallel to the paper to reduce perspective distortion.",
          "Leave a margin around the signature so the crop does not clip a stroke.",
          "Use the highest resolution your camera offers, then crop down.",
        ],
      },
      {
        heading: "Crop to the required ratio",
        paragraphs: [
          "Crop around the writing first, then adjust to the portal's ratio. Cropping to a ratio after resizing can reintroduce distortion. Keep a small, even margin so the signature does not touch the edge of the image.",
          "If the signature includes a date or a printed label, check whether the portal expects it. Remove anything the instructions do not ask for.",
        ],
      },
      {
        heading: "Contrast and background",
        paragraphs: [
          "Dark ink on a plain light background is easiest to read. A photographed signature with a grey cast or a visible table edge may pass the size check but fail a manual review. Increase contrast modestly and avoid turning thin strokes into broken lines.",
          "If the portal accepts JPG, use JPG. A transparent PNG can be useful in a document editor, but some upload portals reject transparency or convert it unpredictably.",
        ],
      },
      {
        heading: "Size, format, and filename",
        paragraphs: [
          "Signature images are often required in a narrow range such as 10–20 KB. Because the writing occupies a small part of the image, aggressive compression can erase thin strokes. Inspect the result at normal zoom, not only in a thumbnail.",
          "Use the exact filename pattern if one is given. Remove spaces and unusual characters. Keep the extension consistent with the real format.",
        ],
      },
      {
        heading: "Final check",
        bullets: [
          "The full signature is visible and not cropped.",
          "The contrast is strong enough to read at normal zoom.",
          "The aspect ratio matches the portal's example.",
          "The format and file size match the rule.",
          "There are no browser edges, shadows, or stray marks.",
          "The original scan is saved as a backup.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I use a digital signature font?",
        answer:
          "Only if the portal accepts it. Many application forms require a handwritten signature image, and a typed font may be rejected in a manual review.",
      },
      {
        question: "Why is my signature file too large?",
        answer:
          "Scans and phone photos are often several megabytes. Crop to the writing, reduce the dimensions, and use JPEG compression to reach the portal's range.",
      },
      {
        question: "Should the signature be black or blue?",
        answer:
          "Follow the instruction on the form. If no colour is specified, dark blue or black ink on white paper is usually easiest to read.",
      },
      {
        question: "Can I remove the paper background?",
        answer:
          "A plain background can be cleaned, but keep enough contrast and avoid erasing thin strokes. Check the result at normal zoom.",
      },
      {
        question: "What if the portal requires a 3:1 ratio?",
        answer:
          "Crop the signature to a 3:1 strip before resizing. Do not stretch a square scan to fit the ratio.",
      },
    ],
    sources: [
      {
        label: "MDN: Image file type and format guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "job-application-upload-checklist",
      "signature-10kb-to-20kb",
    ],
  },
  {
    slug: "reduce-pdf-size-for-application-forms",
    title: "How to reduce a PDF for an application form",
    seoTitle: "Reduce a PDF for an application form | FormPack",
    description:
      "A safe workflow for reducing a PDF to a portal's file-size and page-limit rules while keeping scans readable and verifiable.",
    summary:
      "PDF portals usually care about bytes and page count, but an unreadable certificate creates a different kind of rejection. Reduce size in measured steps.",
    audience: "For certificates, identity documents, and supporting PDFs",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Measure before you change anything",
        paragraphs: [
          "Write down the maximum PDF size, the minimum size if one is given, and the page limit. Open the file and note its current size and page count. Keep the original untouched so you can compare it after each change.",
          "If the PDF is a scan, the pages are already images. If it is a born-digital document, rasterizing it can make the file larger or destroy selectable text. Check the source before choosing a method.",
        ],
      },
      {
        heading: "Understand page count and page size",
        paragraphs: [
          "A page limit is separate from a byte limit. Removing a blank page can help, but do not delete a page that the portal treats as part of a required document. Check whether the application expects one combined PDF or separate uploads for each certificate.",
          "Page size and orientation also matter. A landscape scan in a portrait-only field may be rejected even when the byte size is correct.",
        ],
      },
      {
        heading: "How rasterization reduces size",
        paragraphs: [
          "The PDF compressor renders each page to an image at a reduced resolution and rebuilds a new PDF from those images. Because the page is stored as a compressed image rather than a complex text and vector object, the file can shrink substantially.",
          "The trade-off is that selectable text, embedded links, and some accessibility features may be lost. For a scanned certificate, that is usually acceptable. For a form that must remain fillable, it is not.",
        ],
      },
      {
        heading: "A safe reduction sequence",
        bullets: [
          "Keep the original file in a separate folder.",
          "Record the portal's maximum size and page limit.",
          "Try the least destructive change first: remove blank pages only if allowed.",
          "Use the local PDF compressor with a range just below the limit.",
          "Open every page and inspect names, dates, numbers, stamps, and seals.",
          "If the text is unreadable, use a higher-resolution source or accept a larger file if the portal allows it.",
        ],
      },
      {
        heading: "When not to compress a PDF this way",
        bullets: [
          "The portal requires selectable or searchable text.",
          "The PDF contains an interactive form, signature, or annotation.",
          "The document is a born-digital certificate where text clarity is critical.",
          "The portal asks for the original file for verification.",
        ],
      },
      {
        heading: "Legibility checklist",
        bullets: [
          "The page count matches the original.",
          "Every page opens without an error.",
          "Names, dates, roll numbers, and certificate numbers are readable.",
          "Stamps, seals, and signatures are visible.",
          "No page is cropped at the edge.",
          "Small print has not become a solid grey block.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why is my PDF still too large after compression?",
        answer:
          "The source may be very high resolution or contain many pages. Reduce the number of pages only if the portal allows it, or use a lower-resolution source.",
      },
      {
        question: "Will the compressed PDF keep its text?",
        answer:
          "The compressor rebuilds pages as images, so selectable text usually becomes part of the image. Keep the original if searchable text is required.",
      },
      {
        question: "Can I compress a signed PDF?",
        answer:
          "A digital signature may become invalid when the file is rebuilt. Check the portal's rules before compressing a digitally signed document.",
      },
      {
        question: "Should I print and rescan a PDF to make it smaller?",
        answer:
          "Usually not. Printing and rescanning can increase the size and reduce clarity. Reduce the existing scan instead.",
      },
      {
        question: "What if the portal gives only a maximum size?",
        answer:
          "Set a reasonable minimum above zero and a maximum at or slightly below the published limit.",
      },
    ],
    sources: [
      {
        label: "pdf-lib documentation",
        url: "https://pdf-lib.js.org/",
      },
    ],
    relatedSlugs: [
      "fix-file-too-large-rejection",
      "visa-application-file-checklist",
      "pdf-under-100kb",
    ],
  },
  {
    slug: "fix-file-too-large-rejection",
    title: "Fix a file-too-large rejection before you resubmit",
    seoTitle: "Fix a file-too-large rejection | FormPack",
    description:
      "A step-by-step checklist for diagnosing a file-too-large portal rejection and reducing an image or PDF without losing required detail.",
    summary:
      "A rejection message is a rule to copy, not a reason to guess. Capture the limit, measure the source, then make the smallest safe change.",
    audience:
      "For anyone resubmitting a photo, signature, or PDF after a size error",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Read the message precisely",
        paragraphs: [
          "Copy the rejection text into a note. Look for the limit, the unit, and any other rule mentioned in the same sentence. A message that says the file must be under 100 KB is different from one that says the photo must be between 20 KB and 50 KB.",
          "If the message includes a field name, match it to the upload field. A form can have different rules for a photo, a signature, and a certificate.",
        ],
      },
      {
        heading: "Measure the real file",
        paragraphs: [
          "Do not trust the filename or a file-manager preview. Check the actual byte size and the real format. A file named photo.jpg can still be a PNG or a WebP file.",
          "Record the current size, dimensions, format, and page count. That baseline tells you how far you need to move and which tool to use.",
        ],
      },
      {
        heading: "Make the smallest safe change",
        bullets: [
          "For an image, reduce the dimensions first, then adjust JPEG quality.",
          "For a PDF, reduce the page resolution before deleting pages.",
          "For a signature, crop to the writing before compressing.",
          "For a combined PDF, reduce the source images and rebuild the file.",
          "Keep the original until the replacement is accepted.",
        ],
      },
      {
        heading: "Resubmit with a checklist",
        bullets: [
          "The new file is inside the published range.",
          "The format and filename match the rule.",
          "The dimensions or page count are still correct.",
          "The visual content is still readable.",
          "The portal's confirmation page shows a successful upload.",
        ],
      },
      {
        heading: "Common traps",
        bullets: [
          "Changing the extension and assuming the bytes changed.",
          "Compressing a certificate until the small text is illegible.",
          "Forgetting that a portal can enforce more than one rule at a time.",
          "Uploading the same rejected file again after only renaming it.",
          "Deleting pages that the portal treats as one required document.",
        ],
      },
    ],
    faqs: [
      {
        question: "The portal says the file is too large, but it looks small. Why?",
        answer:
          "The portal may be measuring a different field, a different unit, or a combined upload. Check the exact field and the actual byte size.",
      },
      {
        question: "Can I just rename the file?",
        answer:
          "No. Renaming does not change the file size or format. Use a tool that actually rewrites the file.",
      },
      {
        question: "How much headroom should I leave?",
        answer:
          "Aim for the middle of the allowed range. If there is only a maximum, leave a small margin below it.",
      },
      {
        question: "What if the portal rejects the replacement too?",
        answer:
          "Compare the new file with every published rule, not only the size. The second rejection may be about dimensions, format, or page count.",
      },
    ],
    relatedSlugs: [
      "reduce-pdf-size-for-application-forms",
      "photo-size-and-format-checklist",
      "upload-rejection-messages-explained",
    ],
  },
  {
    slug: "job-application-upload-checklist",
    title: "Job application uploads: photo, signature, and PDF checklist",
    seoTitle: "Job application upload checklist | FormPack",
    description:
      "Prepare common job-portal uploads with a reusable checklist for photos, signatures, resumes, certificates, filenames, and privacy.",
    summary:
      "Recruitment portals vary by employer. Use this checklist to separate the rules you can measure from the visual details you must confirm yourself.",
    audience:
      "For job seekers preparing files for employer and recruitment portals",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Build a rule list for each field",
        paragraphs: [
          "A job application can have separate rules for a profile photo, a signature, a resume, and a certificate. Create one small requirement list for each upload field instead of one rule for the whole application.",
          "If the portal shows a sample file or a tooltip, copy that instruction. A rule that appears only in a tooltip is still part of the application.",
        ],
      },
      {
        heading: "Resume and certificate PDFs",
        paragraphs: [
          "Keep a resume as a text-based PDF unless the employer asks for a scan. Text-based PDFs are smaller, searchable, and easier for a recruiter to read. A scanned resume may look authentic but is often larger and harder to search.",
          "Check the page limit before combining certificates. A single combined PDF can be convenient, but some portals expect separate uploads for each document.",
        ],
      },
      {
        heading: "Filenames and formats",
        bullets: [
          "Use clear names such as firstname-lastname-resume.pdf.",
          "Remove spaces and unusual punctuation if the portal recommends it.",
          "Keep the extension consistent with the real format.",
          "Do not upload a draft with tracked changes or comments.",
          "Use the employer's requested format rather than a generic default.",
        ],
      },
      {
        heading: "Privacy and document hygiene",
        paragraphs: [
          "Remove unrelated personal documents from a multi-file upload. Check that a PDF does not contain hidden pages, comments, or metadata you did not intend to share. If a portal asks for an identity document, confirm why it is needed and how it will be stored.",
          "Use a local tool when you only need to resize or compress a document. Uploading an identity document to an unknown converter creates an unnecessary copy.",
        ],
      },
      {
        heading: "Final review",
        bullets: [
          "Every file matches its field's format, size, and filename rule.",
          "The resume is the final version, not a draft.",
          "The photo follows the employer's orientation and crop.",
          "The certificate PDF is readable and has the right page count.",
          "The application preview shows the intended files.",
        ],
      },
    ],
    faqs: [
      {
        question: "Should my resume be a PDF or a Word file?",
        answer:
          "Use the format the employer requests. If there is no preference, a text-based PDF is usually the safest choice for layout and searchability.",
      },
      {
        question: "Can I reuse an exam photo for a job application?",
        answer:
          "Only if the employer's photo rule matches. A government-exam crop may be too formal or the wrong dimensions for a corporate profile.",
      },
      {
        question: "Why is my resume PDF so large?",
        answer:
          "Embedded images, fonts, and scanned pages increase size. Export a text-based PDF or compress the images before uploading.",
      },
      {
        question: "Can I combine all certificates into one PDF?",
        answer:
          "Only if the portal asks for one combined document. Otherwise, follow the separate upload fields.",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "reduce-pdf-size-for-application-forms",
      "upload-rejection-messages-explained",
    ],
  },
  {
    slug: "visa-application-file-checklist",
    title: "Visa application uploads: a privacy-first file checklist",
    seoTitle: "Visa application file checklist | FormPack",
    description:
      "A privacy-first checklist for visa and passport application photos, signatures, and supporting PDFs, with clear limits on what software can verify.",
    summary:
      "Identity documents are sensitive and visa portals are exacting. Keep files local while you check measurable rules, then use the official guidance for visual approval.",
    audience: "For visa, passport, and travel-document application portals",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Use the authority's current specification",
        paragraphs: [
          "Visa and passport photo rules are set by the issuing authority, not by a generic template. Use the current specification from the embassy, consulate, or passport office. A rule from an older application cycle may be out of date.",
          "Record the format, dimensions, file size, head position, background, and any special requirements such as glasses, head coverings, or infant photos.",
        ],
      },
      {
        heading: "Keep identity files local",
        paragraphs: [
          "A passport scan, a visa photo, and a signature are sensitive identity documents. Avoid sending them to a cloud converter unless you understand the service's retention and security practices. A local browser tool removes that copy from the equation.",
          "When you finish, delete temporary exports from shared devices. Keep the original documents in a secure folder.",
        ],
      },
      {
        heading: "Check consistency across documents",
        bullets: [
          "The name spelling matches across the application, passport, and supporting files.",
          "Dates and document numbers are readable.",
          "The photo matches the person and the current appearance.",
          "The signature matches the one on the application form.",
          "The page count and order match the portal's instructions.",
        ],
      },
      {
        heading: "Visual checks that software cannot make",
        paragraphs: [
          "Background colour, face position, lighting, glare, and expression are judged against the authority's examples. Open the official example and compare it with your file at normal size. Do not rely on a file-size check alone.",
        ],
      },
      {
        heading: "Final review",
        bullets: [
          "The file is inside the published size and dimension limits.",
          "The format and filename match the instruction.",
          "The photo and signature are clear and uncropped.",
          "The supporting PDF is readable and complete.",
          "The original documents are saved securely.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I use a phone photo for a visa application?",
        answer:
          "Only if it meets the authority's background, lighting, and dimension rules. A studio photo is safer when the specification is strict.",
      },
      {
        question: "Is it safe to use an online converter for a passport scan?",
        answer:
          "Understand where the file goes and how long it is retained. A local tool avoids uploading the document at all.",
      },
      {
        question: "Why was my visa photo rejected?",
        answer:
          "Common reasons include the wrong background, a shadow, glasses, a cropped head, or dimensions that differ from the authority's example.",
      },
      {
        question: "Can I compress a visa PDF?",
        answer:
          "Yes, if the document remains readable. Do not rasterize a file that the portal requires to be searchable or digitally signed.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of State: passport photo requirements",
        url: "https://travel.state.gov/",
      },
      {
        label: "UK Government: passport photo rules",
        url: "https://www.gov.uk/",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "signature-file-requirements",
      "reduce-pdf-size-for-application-forms",
    ],
  },
  {
    slug: "ssc-exam-photo-signature-requirements",
    title: "SSC exam photo and signature requirements: a practical guide",
    seoTitle: "SSC photo and signature requirements | FormPack",
    description:
      "A practical guide to SSC application photo and signature sizes, formats, dimensions, and the checks to make before uploading.",
    summary:
      "SSC notices commonly use a 20–50 KB photo and a 10–20 KB signature, but the current notice is the only authoritative source. Here is how to prepare both.",
    audience: "For SSC CGL, CHSL, MTS, GD, and other SSC applications",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Find the current notice first",
        paragraphs: [
          "SSC publishes the upload instructions in the current examination notice and on the application portal. The values can change between cycles, so open the notice for your exam rather than relying on a screenshot or an old video.",
          "Write down the photo rule and the signature rule separately. They usually have different size ranges and dimensions.",
        ],
      },
      {
        heading: "Photo requirements commonly published by SSC",
        bullets: [
          "Format: JPG or JPEG.",
          "File size: often 20–50 KB, with a minimum as well as a maximum.",
          "Dimensions: often around 200 × 230 pixels.",
          "A recent colour photograph with a plain light background.",
          "The face should be centred and visible, without a cap or dark glasses unless permitted.",
        ],
        paragraphs: [
          "These values are commonly used, but they are not a substitute for the current notice. If the notice gives a different range, use the notice.",
        ],
      },
      {
        heading: "Signature requirements commonly published by SSC",
        bullets: [
          "Format: JPG or JPEG.",
          "File size: often 10–20 KB.",
          "Dimensions: often around 140 × 60 pixels.",
          "A handwritten signature in black or blue ink on white paper.",
          "The full signature should be visible and not cropped.",
        ],
      },
      {
        heading: "A safe preparation sequence",
        bullets: [
          "Copy the photo and signature rules from the current notice.",
          "Capture the photo and signature at a higher resolution than the final output.",
          "Crop the signature to the required ratio before resizing.",
          "Use the photo compressor for the photo and the signature tool or compressor for the signature.",
          "Inspect both files at normal zoom before uploading.",
          "Keep the originals until the application is submitted successfully.",
        ],
      },
      {
        heading: "Common SSC upload mistakes",
        bullets: [
          "Using a photo below the minimum KB value as well as above the maximum.",
          "Stretching the signature to a ratio instead of cropping it.",
          "Uploading a PNG with a .jpg extension.",
          "Using a photo with a shadow or a cluttered background.",
          "Compressing the signature until the thin strokes disappear.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the SSC photo size?",
        answer:
          "Recent SSC notices commonly use a 20–50 KB JPG around 200 × 230 pixels. Always confirm the values in the notice for your specific exam.",
      },
      {
        question: "What is the SSC signature size?",
        answer:
          "A common SSC signature rule is 10–20 KB JPG around 140 × 60 pixels. Check the current notice before applying.",
      },
      {
        question: "Can I use a colour photo?",
        answer:
          "SSC usually expects a recent colour photograph with a plain light background. Follow the example in the notice.",
      },
      {
        question: "Why does the SSC portal reject my photo?",
        answer:
          "The file may be outside the size or dimension range, in the wrong format, or visually unsuitable. Check every published rule, not only the KB value.",
      },
      {
        question: "Do I need a signature in running handwriting?",
        answer:
          "Use a normal handwritten signature. A typed font or a digitally generated signature may be rejected.",
      },
    ],
    sources: [
      {
        label: "Staff Selection Commission",
        url: "https://ssc.gov.in/",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "signature-file-requirements",
      "photo-20kb-to-50kb",
    ],
  },
  {
    slug: "bank-exam-photo-signature-requirements",
    title: "Bank exam photo, signature, and thumb impression guide",
    seoTitle: "Bank exam photo and signature requirements | FormPack",
    description:
      "Prepare IBPS, SBI, and other bank exam uploads with a practical guide to photo, signature, thumb impression, and handwritten declaration files.",
    summary:
      "Bank exams often require four separate uploads: a photo, a signature, a thumb impression, and a handwritten declaration. Each has its own size and dimension rule.",
    audience: "For IBPS, SBI, and other bank recruitment applications",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Expect more than one upload field",
        paragraphs: [
          "Bank applications commonly ask for a photograph, a signature, a left thumb impression, and a handwritten declaration. Do not apply the photo rule to every field. Open the current notification and write down each field separately.",
        ],
      },
      {
        heading: "Commonly published photo and signature values",
        bullets: [
          "Photo: often 20–50 KB, around 200 × 230 pixels, JPG or JPEG.",
          "Signature: often 10–20 KB, around 140 × 60 pixels, JPG or JPEG.",
          "Left thumb impression: often 20–50 KB, around 240 × 240 pixels.",
          "Handwritten declaration: often 50–100 KB, around 800 × 400 pixels.",
        ],
        paragraphs: [
          "These are common patterns, not a universal rule. IBPS, SBI, and individual banks can change their specifications between recruitment cycles. Use the current notification for your application.",
        ],
      },
      {
        heading: "Prepare the signature and thumb impression carefully",
        paragraphs: [
          "The signature and thumb impression are usually inspected visually. Use dark ink on plain white paper, keep the full impression inside the frame, and avoid shadows. Crop close to the content but leave a small margin.",
          "For the handwritten declaration, write the exact sentence requested in the notification. A declaration with a missing word or a different sentence can be rejected even if the file properties are correct.",
        ],
      },
      {
        heading: "A safe workflow",
        bullets: [
          "Copy each field's format, size, and dimensions from the notification.",
          "Capture all four items at a higher resolution than the final output.",
          "Crop each item to its required ratio.",
          "Compress each file to its own range.",
          "Inspect every result at normal zoom.",
          "Upload them in the order shown by the portal.",
        ],
      },
      {
        heading: "Common bank exam mistakes",
        bullets: [
          "Using the photo range for the signature or thumb impression.",
          "Uploading a declaration with the wrong sentence.",
          "Cropping the thumb impression at the edge.",
          "Using a signature with a visible table or browser edge.",
          "Forgetting to check the minimum size as well as the maximum.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the IBPS photo size?",
        answer:
          "Recent IBPS notices commonly use a 20–50 KB JPG around 200 × 230 pixels. Confirm the current notification before uploading.",
      },
      {
        question: "What is the IBPS signature size?",
        answer:
          "A common rule is 10–20 KB JPG around 140 × 60 pixels. The handwritten declaration and thumb impression have separate rules.",
      },
      {
        question: "Can I use the same file for the photo and the thumb impression?",
        answer:
          "No. They are different documents with different dimensions and content.",
      },
      {
        question: "Why is my handwritten declaration rejected?",
        answer:
          "The sentence may be wrong, the file may be outside its size range, or the writing may be unclear. Re-read the notification and capture it again.",
      },
    ],
    sources: [
      {
        label: "Institute of Banking Personnel Selection",
        url: "https://www.ibps.in/",
      },
      {
        label: "State Bank of India",
        url: "https://sbi.co.in/",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "signature-file-requirements",
      "photo-20kb-to-50kb",
    ],
  },
  {
    slug: "rrb-exam-photo-signature-requirements",
    title: "RRB exam photo and signature requirements: what to check",
    seoTitle: "RRB photo and signature requirements | FormPack",
    description:
      "A practical guide to Railway Recruitment Board application photos and signatures, including common size ranges and upload checks.",
    summary:
      "RRB applications usually publish separate photo and signature ranges. Prepare both at a higher resolution, then compress each file to its own rule.",
    audience: "For RRB NTPC, Group D, ALP, and other railway applications",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Read the RRB notification for your cycle",
        paragraphs: [
          "Railway recruitment notices are published per cycle and can differ between regions and posts. Open the notification for your application and copy the photo and signature instructions into a note.",
          "Check whether the portal asks for a live photo capture, a scanned signature, or both. A rule that applies to one field may not apply to another.",
        ],
      },
      {
        heading: "Commonly published photo values",
        bullets: [
          "Format: JPG or JPEG.",
          "File size: often 15–40 KB.",
          "Dimensions: often around 320 × 240 pixels.",
          "A recent colour photo with a plain background.",
          "The face should be clearly visible and centred.",
        ],
      },
      {
        heading: "Commonly published signature values",
        bullets: [
          "Format: JPG or JPEG.",
          "File size: often 10–40 KB.",
          "Dimensions: often around 160 × 80 pixels.",
          "A handwritten signature on plain paper.",
          "The full signature should be visible and readable.",
        ],
        paragraphs: [
          "These values are common in recent RRB notices, but the current notification controls. If your notice gives a different range, use it.",
        ],
      },
      {
        heading: "Prepare and check both files",
        bullets: [
          "Capture the photo and signature at a higher resolution than the final output.",
          "Crop the signature to the required ratio before resizing.",
          "Compress the photo and signature separately, using their own ranges.",
          "Open both files at normal zoom and check the face and strokes.",
          "Keep the originals until the application is submitted.",
        ],
      },
      {
        heading: "Common RRB upload mistakes",
        bullets: [
          "Using the same KB range for the photo and the signature.",
          "Uploading a photo with a shadow or a busy background.",
          "Cropping the signature at the final stroke.",
          "Using a PNG file renamed to JPG.",
          "Ignoring a separate live-photo requirement.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the RRB photo size?",
        answer:
          "Recent notices commonly use a 15–40 KB JPG around 320 × 240 pixels. Confirm the values in your cycle's notification.",
      },
      {
        question: "What is the RRB signature size?",
        answer:
          "A common rule is 10–40 KB JPG around 160 × 80 pixels. Check the current notice before applying.",
      },
      {
        question: "Can I use a selfie?",
        answer:
          "Only if the notice allows it and the photo meets the background, lighting, and dimension rules. A studio or carefully taken photo is safer.",
      },
      {
        question: "Why does the RRB portal reject my signature?",
        answer:
          "The file may be outside the range, the wrong format, the wrong dimensions, or visually unclear. Check each rule separately.",
      },
    ],
    sources: [
      {
        label: "Indian Railways",
        url: "https://indianrailways.gov.in/",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "signature-file-requirements",
      "photo-20kb-to-50kb",
    ],
  },
  {
    slug: "nta-exam-photo-signature-requirements",
    title: "NTA exam photo, signature, and thumb impression guide",
    seoTitle: "NTA exam photo and signature requirements | FormPack",
    description:
      "Prepare NEET, JEE, and other NTA application uploads with a practical guide to photo, signature, and thumb impression files.",
    summary:
      "NTA applications often ask for a photo, a signature, and a thumb impression, each with its own size and dimension range. Use the current information bulletin.",
    audience: "For NEET, JEE Main, and other NTA-conducted exams",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Use the current information bulletin",
        paragraphs: [
          "NTA publishes upload instructions in the information bulletin and on the application portal. The values can change between sessions, so confirm the current rules before preparing files.",
          "Write down the photo, signature, and thumb impression rules separately. They usually differ in both size and dimensions.",
        ],
      },
      {
        heading: "Commonly published photo values",
        bullets: [
          "Format: JPG or JPEG.",
          "File size: often 10–200 KB.",
          "Dimensions: often around 200 × 230 pixels.",
          "A recent colour photo with a plain light background.",
          "The face should be visible and centred.",
        ],
      },
      {
        heading: "Commonly published signature and thumb values",
        bullets: [
          "Signature: often 4–30 KB, around 140 × 60 pixels.",
          "Thumb impression: often 10–200 KB, around 240 × 240 pixels.",
          "Handwritten declaration, where required: follow the bulletin's sentence and size.",
        ],
        paragraphs: [
          "These ranges are common in recent NTA notices, but the current bulletin is authoritative. If your exam publishes different values, use those.",
        ],
      },
      {
        heading: "Prepare the three files",
        bullets: [
          "Capture each item at a higher resolution than the final output.",
          "Crop the signature and thumb impression to their required ratios.",
          "Compress each file to its own range.",
          "Inspect the signature and thumb impression for clarity.",
          "Upload the files in the order shown by the portal.",
        ],
      },
      {
        heading: "Common NTA upload mistakes",
        bullets: [
          "Using the photo range for the signature.",
          "Uploading a thumb impression with a shadow or a cropped edge.",
          "Using a typed signature instead of a handwritten one.",
          "Ignoring the minimum size.",
          "Forgetting to re-check the files after a portal error.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the NEET photo size?",
        answer:
          "Recent NTA notices commonly use a 10–200 KB JPG around 200 × 230 pixels. Confirm the current bulletin for your session.",
      },
      {
        question: "What is the NEET signature size?",
        answer:
          "A common rule is 4–30 KB JPG around 140 × 60 pixels. The thumb impression has a separate range.",
      },
      {
        question: "Can I use a digital signature?",
        answer:
          "Use a handwritten signature as instructed. A typed or digitally drawn signature may be rejected in a manual review.",
      },
      {
        question: "Why is my thumb impression rejected?",
        answer:
          "It may be outside the size or dimension range, unclear, cropped, or in the wrong format. Check the bulletin's example.",
      },
    ],
    sources: [
      {
        label: "National Testing Agency",
        url: "https://nta.ac.in/",
      },
      {
        label: "NEET",
        url: "https://neet.nta.nic.in/",
      },
      {
        label: "JEE Main",
        url: "https://jeemain.nta.nic.in/",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "signature-file-requirements",
      "photo-20kb-to-50kb",
    ],
  },
  {
    slug: "state-psc-photo-signature-requirements",
    title: "State PSC photo and signature requirements: a checklist",
    seoTitle: "State PSC photo and signature requirements | FormPack",
    description:
      "A checklist for state public service commission applications, where photo and signature rules vary by state and examination cycle.",
    summary:
      "State PSC rules vary widely. Use the commission's current notification, record each upload field separately, and verify the result before submitting.",
    audience: "For state public service commission and state government exams",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "There is no single state PSC rule",
        paragraphs: [
          "Each state public service commission publishes its own application instructions. The photo and signature ranges can differ from central exams and from each other. Use the notification on the commission's official website for your state and exam.",
        ],
      },
      {
        heading: "What to record from the notification",
        bullets: [
          "Accepted format, such as JPG or JPEG.",
          "Minimum and maximum file size for each field.",
          "Pixel dimensions or a physical size with a resolution.",
          "Signature ratio and any declaration requirements.",
          "Filename pattern and upload order.",
          "Visual rules for background, face position, and signature clarity.",
        ],
      },
      {
        heading: "A preparation sequence that works across states",
        bullets: [
          "Capture the photo and signature at a higher resolution than the final output.",
          "Crop the signature to the published ratio.",
          "Resize the photo to the published pixel dimensions.",
          "Compress each file to its own range.",
          "Inspect both files at normal zoom.",
          "Upload them in the order shown by the portal.",
        ],
      },
      {
        heading: "Common state PSC mistakes",
        bullets: [
          "Assuming a central-exam rule applies to a state exam.",
          "Using an old screenshot from a previous cycle.",
          "Applying the photo range to the signature.",
          "Uploading a photo with a shadow or a non-plain background.",
          "Forgetting the handwritten declaration when one is required.",
        ],
      },
    ],
    faqs: [
      {
        question: "Where do I find my state PSC photo rule?",
        answer:
          "Open the current notification on your state commission's official website and search for the photograph and signature instructions.",
      },
      {
        question: "Why are the values different from SSC?",
        answer:
          "Each commission sets its own upload rules. Central and state exams are separate systems.",
      },
      {
        question: "Can I use the same photo for multiple state exams?",
        answer:
          "Only if each notification accepts the same format, size, dimensions, and visual style.",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "signature-file-requirements",
      "how-to-read-upload-instructions",
    ],
  },
  {
    slug: "photo-20kb-to-50kb",
    title: "How to make a photo 20 KB to 50 KB for an application",
    seoTitle: "Make a photo 20 KB to 50 KB | FormPack",
    description:
      "A step-by-step guide to producing an application photo inside a 20–50 KB range without losing the required dimensions.",
    summary:
      "A 20–50 KB photo is a range, not a single target. Start with the pixel dimensions, compress to the middle of the range, and check the result visually.",
    audience: "For exam and government applications with a 20–50 KB photo rule",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Why the minimum matters",
        paragraphs: [
          "Many portals reject a file that is below the minimum as well as one above the maximum. A 12 KB photo can fail a 20–50 KB rule. Compressing as hard as possible is therefore the wrong strategy.",
          "Aim for roughly the middle of the range, such as 30–40 KB. That leaves room for small differences in how the portal measures the file.",
        ],
      },
      {
        heading: "Set the dimensions first",
        paragraphs: [
          "If the portal publishes dimensions such as 200 × 230 pixels, resize the photo to those values before compressing. Compression quality is easier to tune once the pixel grid is fixed.",
          "If the portal gives only a physical size, use a resolution that produces a sensible pixel size. For example, 3.5 × 4.5 cm at 300 DPI is approximately 413 × 531 pixels.",
        ],
      },
      {
        heading: "Compress to the middle of the range",
        bullets: [
          "Open the photo compressor.",
          "Enter 20 as the minimum and 50 as the maximum.",
          "Enter the required width and height.",
          "Choose JPEG unless the portal requires PNG.",
          "Run the compression and check the reported size.",
          "If the result is below 20 KB, increase the dimensions or use a less aggressive setting.",
          "If the result is above 50 KB, reduce the dimensions or lower the quality.",
        ],
      },
      {
        heading: "Verify the result",
        bullets: [
          "The file is a real JPEG, not a renamed PNG.",
          "The dimensions match the portal's rule.",
          "The face is clear and not visibly distorted.",
          "The file size is inside 20–50 KB.",
          "The filename follows the portal's pattern.",
        ],
      },
      {
        heading: "Common problems",
        bullets: [
          "The photo is below 20 KB because the dimensions are too small.",
          "The photo is above 50 KB because the source is very large and the quality is still high.",
          "The photo looks blocky because the dimensions were reduced too far.",
          "The portal rejects a PNG even though the KB value is correct.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is 20 KB enough for a clear photo?",
        answer:
          "At modest dimensions such as 200 × 230 pixels, 20–50 KB can be enough. At large dimensions, the same range will look over-compressed.",
      },
      {
        question: "Should I aim for exactly 50 KB?",
        answer:
          "Aim for the middle of the range. Landing exactly on the maximum leaves no margin for rounding.",
      },
      {
        question: "Why does my photo drop below 20 KB?",
        answer:
          "The dimensions may be small or the quality setting may be too low. Increase the dimensions or use a higher quality.",
      },
      {
        question: "Can I use PNG for a 20–50 KB photo?",
        answer:
          "Only if the portal accepts PNG. PNG is harder to tune to an exact range, so JPEG is usually the better choice.",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "ssc-exam-photo-signature-requirements",
      "jpeg-vs-png-application-uploads",
    ],
  },
  {
    slug: "signature-10kb-to-20kb",
    title: "How to make a signature 10 KB to 20 KB",
    seoTitle: "Make a signature 10 KB to 20 KB | FormPack",
    description:
      "A step-by-step guide to producing a signature image inside a 10–20 KB range while keeping the strokes readable.",
    summary:
      "Signatures are easy to over-compress because most of the image is background. Crop to the writing, use JPEG, and inspect the strokes at normal zoom.",
    audience: "For application forms with a 10–20 KB signature rule",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Crop before you compress",
        paragraphs: [
          "A full-page scan contains a lot of empty paper. Cropping close to the signature reduces the number of pixels the compressor has to encode, which makes the target range easier to reach without destroying the strokes.",
          "Leave a small, even margin around the writing. Do not crop the final stroke or a date that the form requires.",
        ],
      },
      {
        heading: "Use the right format and ratio",
        paragraphs: [
          "JPEG is usually the best format for a 10–20 KB signature because it supports quality control. If the portal requires a ratio such as 3:1, crop to that ratio before resizing.",
          "A transparent PNG can be useful in a document editor, but it is often larger and harder to tune to a narrow KB range.",
        ],
      },
      {
        heading: "Compress and check",
        bullets: [
          "Open the signature tool or the photo compressor.",
          "Enter 10 as the minimum and 20 as the maximum.",
          "Use the published dimensions or ratio.",
          "Choose JPEG and run the compression.",
          "Open the result at normal zoom.",
          "If the strokes look broken, use a less aggressive setting or a larger source.",
        ],
      },
      {
        heading: "What can go wrong",
        bullets: [
          "The signature is below 10 KB because the image was over-compressed.",
          "The signature is above 20 KB because the source is very large.",
          "The strokes disappear because the signature was faint to begin with.",
          "The signature is stretched because it was forced into a ratio instead of cropped.",
          "The file is a PNG renamed to JPG.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why does my signature look broken after compression?",
        answer:
          "Thin strokes are the first detail to disappear. Use a darker, clearer source and avoid the lowest quality setting.",
      },
      {
        question: "Can I use a phone photo of my signature?",
        answer:
          "Yes, if the lighting is even, the paper is plain, and the crop is tight. A scan is usually cleaner.",
      },
      {
        question: "Should I use black or blue ink?",
        answer:
          "Follow the form's instruction. If none is given, dark blue or black ink is easiest to read.",
      },
      {
        question: "What if the portal requires 10–20 KB and 140 × 60 pixels?",
        answer:
          "Crop to the 140 × 60 ratio first, then compress to the 10–20 KB range. The order matters.",
      },
    ],
    relatedSlugs: [
      "signature-file-requirements",
      "photo-20kb-to-50kb",
      "ssc-exam-photo-signature-requirements",
    ],
  },
  {
    slug: "pdf-under-100kb",
    title: "How to compress a PDF under 100 KB for an application",
    seoTitle: "Compress a PDF under 100 KB | FormPack",
    description:
      "A practical guide to reducing a PDF below a 100 KB portal limit while keeping names, dates, stamps, and seals readable.",
    summary:
      "A 100 KB PDF limit usually means the page images must be small. Reduce resolution, keep the page count, and check legibility before uploading.",
    audience: "For certificates, identity documents, and supporting PDFs",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Check the page count and source type",
        paragraphs: [
          "A 100 KB limit is tight for a multi-page scan. Before compressing, check how many pages the portal allows and whether the document is a scan or a text-based PDF. A text-based PDF may already be small; a scan may need rasterization.",
          "If the portal expects one document per field, do not split or delete pages without checking the instructions.",
        ],
      },
      {
        heading: "Reduce the page resolution",
        paragraphs: [
          "The PDF compressor renders each page to an image and rebuilds the PDF. Lowering the rendering resolution reduces the file size, but it also reduces the detail available for small text and seals.",
          "Start with a modest reduction and inspect the result. A certificate with a large heading may look fine while the small print becomes unreadable.",
        ],
      },
      {
        heading: "A step-by-step workflow",
        bullets: [
          "Keep the original PDF in a separate folder.",
          "Record the portal's maximum size and page limit.",
          "Open the PDF and note the page count.",
          "Use the local PDF compressor with a range below 100 KB.",
          "Open every page and check names, dates, numbers, stamps, and seals.",
          "If the file is still too large, reduce the source resolution or ask whether the portal accepts a larger file.",
        ],
      },
      {
        heading: "When a 100 KB PDF is not realistic",
        paragraphs: [
          "A multi-page colour scan with fine print may not be readable below 100 KB. In that case, check whether the portal accepts a different format, a higher limit, or separate uploads. Do not submit an unreadable document just to meet the byte limit.",
        ],
      },
      {
        heading: "Final checks",
        bullets: [
          "The page count matches the original.",
          "Every page opens.",
          "The document is not cropped.",
          "Small text is still readable.",
          "The file size is inside the portal's range.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can a 100 KB PDF be readable?",
        answer:
          "Yes for a simple scan with large text. A dense multi-page document may need a higher limit or a different format.",
      },
      {
        question: "Will the PDF still be searchable?",
        answer:
          "The compressor rebuilds pages as images, so selectable text usually becomes part of the image. Keep the original if searchability is required.",
      },
      {
        question: "Why is my PDF still above 100 KB?",
        answer:
          "It may have many pages or a very high-resolution source. Reduce the source resolution, or check whether the portal allows a larger file.",
      },
      {
        question: "Can I remove pages to meet the limit?",
        answer:
          "Only if the portal allows it. Do not delete a page that is part of a required document.",
      },
    ],
    sources: [
      {
        label: "pdf-lib documentation",
        url: "https://pdf-lib.js.org/",
      },
    ],
    relatedSlugs: [
      "reduce-pdf-size-for-application-forms",
      "fix-file-too-large-rejection",
      "upload-rejection-messages-explained",
    ],
  },
  {
    slug: "jpeg-vs-png-application-uploads",
    title: "JPEG vs PNG for application uploads: which should you use?",
    seoTitle: "JPEG vs PNG for application uploads | FormPack",
    description:
      "Understand the practical differences between JPEG and PNG for exam photos, signatures, and application documents.",
    summary:
      "JPEG is usually better for photographs and exact file-size control. PNG is better for sharp graphics and transparency, but it is harder to tune to a narrow KB range.",
    audience: "For anyone choosing an image format for an application upload",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "How JPEG works",
        paragraphs: [
          "JPEG uses lossy compression. It discards some colour and detail to make the file smaller. The quality setting lets you trade file size against visual fidelity, which is why JPEG is useful when a portal enforces a narrow KB range.",
          "JPEG does not support transparency. It is designed for photographs and continuous-tone images.",
        ],
      },
      {
        heading: "How PNG works",
        paragraphs: [
          "PNG uses lossless compression. It preserves sharp edges and supports transparency, which makes it useful for signatures, screenshots, and graphics. It does not have a quality slider, so reducing the file size usually means reducing the dimensions or the number of colours.",
        ],
      },
      {
        heading: "Which format should you choose?",
        bullets: [
          "Photo: JPEG, unless the portal explicitly requires PNG.",
          "Signature: JPEG for upload, PNG only if the portal accepts it and the size is manageable.",
          "Screenshot or graphic with text: PNG if the portal accepts it.",
          "Image with transparency: PNG, if the portal accepts transparency.",
          "Tight KB range: JPEG, because quality can be tuned.",
        ],
      },
      {
        heading: "The renaming trap",
        paragraphs: [
          "Changing a file's extension does not change its format. A PNG renamed to .jpg is still a PNG inside, and many portals detect the real content type. Export a real JPEG from an image editor or a tool that writes JPEG data.",
        ],
      },
      {
        heading: "Check the portal's accepted formats",
        paragraphs: [
          "Some portals accept only JPG or JPEG. Others accept PNG but convert it internally. Use the format listed in the current instruction, not the format that happens to be convenient.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is JPEG always smaller than PNG?",
        answer:
          "Usually for photographs, but not always. A simple PNG graphic can be smaller than a high-quality JPEG. Compare the actual files.",
      },
      {
        question: "Can I use PNG for a photo?",
        answer:
          "Only if the portal accepts PNG and the size fits. PNG is often much larger for photographic content.",
      },
      {
        question: "Does renaming a file change its format?",
        answer:
          "No. The extension is only part of the name. The file's internal format is unchanged.",
      },
      {
        question: "Which format is better for a signature?",
        answer:
          "JPEG is usually easier to fit into a KB range. PNG can preserve sharp edges but may be larger.",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "signature-file-requirements",
      "photo-20kb-to-50kb",
    ],
  },
  {
    slug: "dpi-vs-pixels-exam-photos",
    title: "DPI vs pixels: what exam photo requirements actually mean",
    seoTitle: "DPI vs pixels for exam photos | FormPack",
    description:
      "Understand the difference between DPI and pixel dimensions, and how to convert a physical photo size into the pixels a portal expects.",
    summary:
      "Portals usually check pixels, not DPI. DPI matters for printing. If a form gives a physical size, use the resolution to calculate the pixel dimensions.",
    audience: "For exam, visa, and application photos with physical or pixel rules",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Pixels define the image grid",
        paragraphs: [
          "A digital image is a grid of pixels. A 600 × 800 image is 600 pixels wide and 800 pixels high. That grid is the same whether the file is tagged 72 DPI or 300 DPI.",
          "When a portal asks for 200 × 230 pixels, it is checking the grid. Resizing to those values is the direct way to comply.",
        ],
      },
      {
        heading: "DPI is printing metadata",
        paragraphs: [
          "DPI (dots per inch) describes how densely the image should be printed. It does not add detail to a digital file. A 600 × 800 image printed at 300 DPI is 2 × 2.67 inches; printed at 150 DPI it is 4 × 5.33 inches.",
        ],
      },
      {
        heading: "Converting a physical size to pixels",
        paragraphs: [
          "If the form gives a physical size and a resolution, multiply the inches by the DPI. For example, 3.5 × 4.5 cm is about 1.38 × 1.77 inches. At 300 DPI, that is approximately 413 × 531 pixels. At 200 DPI, it is approximately 276 × 354 pixels.",
          "If the form gives a physical size but no resolution, ask which resolution the portal expects or use the pixel example on the portal. Do not guess and submit a file that is far outside the expected grid.",
        ],
      },
      {
        heading: "Aspect ratio still matters",
        paragraphs: [
          "A 3.5 × 4.5 cm photo has a portrait aspect ratio. If you resize it to a square, the face will be distorted or cropped. Crop to the required ratio before resizing.",
        ],
      },
      {
        heading: "What to enter in a tool",
        bullets: [
          "If the portal gives pixels, enter those exact width and height values.",
          "If the portal gives a physical size and a DPI, calculate the pixel values.",
          "If the portal gives only a physical size, use the portal's example or ask for clarification.",
          "Do not change the DPI tag and expect the pixel dimensions to change.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does changing DPI change the file size?",
        answer:
          "It can change metadata and some export settings, but it does not change the pixel grid by itself. Resizing the pixel dimensions is what changes the grid.",
      },
      {
        question: "What is 3.5 × 4.5 cm in pixels?",
        answer:
          "At 300 DPI it is about 413 × 531 pixels. At 200 DPI it is about 276 × 354 pixels.",
      },
      {
        question: "Should I set 300 DPI for an exam photo?",
        answer:
          "Only if the portal asks for it. Most portals check pixel dimensions and file size, not the DPI tag.",
      },
      {
        question: "Why does my photo look stretched?",
        answer:
          "The aspect ratio was changed without cropping. Crop to the required ratio before resizing.",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "photo-20kb-to-50kb",
      "how-to-read-upload-instructions",
    ],
  },
  {
    slug: "why-local-file-processing-matters",
    title: "Why local file processing matters for application documents",
    seoTitle: "Why local file processing matters | FormPack",
    description:
      "Understand the privacy risks of uploading identity documents to online converters and what local browser processing changes.",
    summary:
      "Application photos and identity documents are sensitive. A local tool avoids creating a copy on someone else's server, but it still requires careful handling.",
    audience: "For applicants handling photos, signatures, and identity documents",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "What is at risk",
        paragraphs: [
          "An application pack can contain a face photo, a signature, a certificate, a passport scan, and a thumb impression. Together, those files can support identity theft or fraud if they are exposed or retained longer than expected.",
          "A cloud converter creates another copy of each file. The service may store it for minutes or months, may use it for product improvement, or may be breached. The applicant usually cannot verify those practices.",
        ],
      },
      {
        heading: "What local processing changes",
        paragraphs: [
          "A browser-based tool reads the file into memory on the user's device, processes it with browser APIs, and produces a download. The document does not need to cross the network. That removes a copy from the equation.",
          "Local processing is not a complete security guarantee. The device, the browser, extensions, and the downloaded file still need to be handled carefully. But it removes the unnecessary upload.",
        ],
      },
      {
        heading: "What to check before using any converter",
        bullets: [
          "Does the tool upload the file to a server?",
          "How long does it retain the file?",
          "Does it require an account or an email address?",
          "Does it explain how advertising or analytics interact with the file?",
          "Can you use it offline after the page loads?",
          "Is the result downloadable without a subscription?",
        ],
      },
      {
        heading: "Practical habits",
        bullets: [
          "Keep the original documents in a secure folder.",
          "Delete temporary exports from shared or public devices.",
          "Do not send identity documents by email unless the recipient requires it.",
          "Check the portal's address before uploading.",
          "Use a local tool when you only need to resize or compress a file.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is browser processing really private?",
        answer:
          "The file does not need to be uploaded for the processing to work. The page can still load scripts and ads, but the document stays in the browser.",
      },
      {
        question: "Can I use FormPack offline?",
        answer:
          "After the page and its scripts have loaded, the core processing runs locally. A full offline mode depends on the browser cache and is not guaranteed.",
      },
      {
        question: "Does advertising see my document?",
        answer:
          "The advertising script runs on the page, but it does not receive the contents of a file processed by the local tools.",
      },
      {
        question: "What should I do with the original file?",
        answer:
          "Keep it until the portal confirms the upload, then store it securely or delete it according to your own retention needs.",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "reduce-pdf-size-for-application-forms",
      "visa-application-file-checklist",
    ],
  },
  {
    slug: "how-to-read-upload-instructions",
    title: "How to read an application upload instruction without guessing",
    seoTitle: "How to read application upload instructions | FormPack",
    description:
      "A practical method for turning a portal's upload instruction into measurable checks for format, size, dimensions, and filenames.",
    summary:
      "Most upload rejections start with a misread instruction. Extract the values, keep the units, and separate measurable rules from visual examples.",
    audience: "For anyone preparing files for an online application",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "Find the authoritative instruction",
        paragraphs: [
          "Start with the current notification, information bulletin, or portal help text. A screenshot from a previous cycle, a coaching video, or a generic blog post may be out of date.",
          "If the instruction appears only in a tooltip, copy it into a note. Tooltips often contain the exact size and dimension values that are not repeated elsewhere.",
        ],
      },
      {
        heading: "Extract the measurable values",
        bullets: [
          "Format: JPG, JPEG, PNG, PDF.",
          "Minimum size and maximum size, with units.",
          "Width and height in pixels, or a physical size plus a resolution.",
          "Aspect ratio or orientation.",
          "Page count for a PDF.",
          "Filename pattern and extension.",
          "Upload order and whether fields are separate or combined.",
        ],
      },
      {
        heading: "Separate measurable rules from visual examples",
        paragraphs: [
          "A rule such as 20–50 KB or 200 × 230 pixels is measurable. A rule such as a plain background or a neutral expression is visual. FormPack can check the first group; you must review the second.",
          "Read the visual examples as carefully as the numbers. A photo can be inside the KB range and still fail because the face is too small or the background is wrong.",
        ],
      },
      {
        heading: "Write a one-line checklist",
        paragraphs: [
          "Turn the instruction into a single line you can check after processing: format, minimum, maximum, dimensions, filename. For example: JPG, 20–50 KB, 200 × 230 px, photo.jpg.",
          "Keep that line beside the upload field. It is easier to compare one line than to reread a paragraph under deadline pressure.",
        ],
      },
      {
        heading: "Verify before and after upload",
        bullets: [
          "Before upload: compare the file with the checklist.",
          "During upload: watch for a portal error or a confirmation message.",
          "After upload: open the preview if the portal provides one.",
          "If the portal rejects the file, re-read the full instruction rather than changing one value at random.",
        ],
      },
    ],
    faqs: [
      {
        question: "What if the notification and the portal disagree?",
        answer:
          "Use the value shown by the portal's current upload field, and check whether the notification has an addendum or corrigendum.",
      },
      {
        question: "What does 'maximum 50 KB' mean if there is no minimum?",
        answer:
          "The file must be at or below 50 KB. A reasonable minimum above zero is still useful so the file is not over-compressed.",
      },
      {
        question: "Are tooltips part of the official instruction?",
        answer:
          "Treat them as part of the portal's instruction, especially when they contain the exact size or dimension values.",
      },
    ],
    relatedSlugs: [
      "photo-size-and-format-checklist",
      "signature-file-requirements",
      "upload-rejection-messages-explained",
    ],
  },
  {
    slug: "upload-rejection-messages-explained",
    title: "Application upload rejection messages, explained",
    seoTitle: "Application upload rejection messages explained | FormPack",
    description:
      "Common application upload errors, what they usually mean, and the first fix to try for photos, signatures, and PDFs.",
    summary:
      "A rejection message is a clue, not a complete specification. Match the message to the field, measure the file, and change one thing at a time.",
    audience: "For applicants resubmitting a rejected photo, signature, or PDF",
    updatedAt: SITE.updatedAt,
    sections: [
      {
        heading: "File too large",
        paragraphs: [
          "The file exceeds the field's maximum size. Check the unit and the field. A photo limit is not a PDF limit. Reduce the dimensions first, then the quality, and leave a small margin below the maximum.",
        ],
      },
      {
        heading: "Invalid format or unsupported file type",
        paragraphs: [
          "The portal does not accept the file's real format. Check whether it accepts JPG, JPEG, PNG, or PDF. Renaming the extension does not convert the file. Export a real file in the accepted format.",
        ],
      },
      {
        heading: "Dimensions too small or too large",
        paragraphs: [
          "The pixel width or height is outside the rule. Resize to the exact published values. If the portal gives a ratio, crop to that ratio before resizing.",
        ],
      },
      {
        heading: "Face not detected or photo not acceptable",
        paragraphs: [
          "The portal may be checking face position, background, lighting, or image quality. Compare the file with the portal's example. A file can be inside the KB range and still fail this check.",
        ],
      },
      {
        heading: "Signature not clear",
        paragraphs: [
          "The signature may be faint, cropped, too small, or over-compressed. Use a darker source, crop to the writing, and inspect the result at normal zoom.",
        ],
      },
      {
        heading: "PDF corrupted, encrypted, or unreadable",
        paragraphs: [
          "The browser or the portal could not read the file structure. Try an unlocked PDF with a standard page structure. If the file is digitally signed, rebuilding it may invalidate the signature.",
        ],
      },
      {
        heading: "Filename invalid",
        paragraphs: [
          "Remove spaces, unusual punctuation, and extra dots. Use the exact pattern if the portal provides one, and keep the extension consistent with the real format.",
        ],
      },
      {
        heading: "A calm resubmission sequence",
        bullets: [
          "Copy the full error message.",
          "Identify the exact field and rule.",
          "Measure the file's real size, format, and dimensions.",
          "Change one property at a time.",
          "Check the result visually.",
          "Keep the original and the replacement until the upload is confirmed.",
        ],
      },
    ],
    faqs: [
      {
        question: "The message is vague. What should I check first?",
        answer:
          "Check the field's published format, size range, and dimensions in that order. Those are the most common causes.",
      },
      {
        question: "Why does the portal reject a file that worked before?",
        answer:
          "The portal may have changed its rules, or the file may be for a different field. Re-read the current instruction.",
      },
      {
        question: "Can I submit the same file again after renaming it?",
        answer:
          "No. Renaming does not change the size or format. The same rejection is likely.",
      },
      {
        question: "Should I contact the portal?",
        answer:
          "If every published rule is satisfied and the file still fails, use the portal's help channel and include the exact error message and file properties.",
      },
    ],
    relatedSlugs: [
      "fix-file-too-large-rejection",
      "photo-size-and-format-checklist",
      "reduce-pdf-size-for-application-forms",
    ],
  },
]

export function getSeoGuide(slug: string) {
  return seoGuides.find((guide) => guide.slug === slug)
}
