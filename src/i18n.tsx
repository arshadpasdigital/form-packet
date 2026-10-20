import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"

export type Locale = "en" | "hi"

type Dictionary = Record<string, string>

const en: Dictionary = {
  "skip": "Skip to content",
  "nav.compress": "Compress files",
  "nav.presets": "Exam presets",
  "nav.prepare": "Prepare a pack",
  "nav.guides": "Guides",
  "nav.localProcessing": "Local processing",
  "nav.mobileGuides": "Read file guides",
  "language.label": "Language",
  "language.english": "English",
  "language.hindi": "हिंदी",
  "footer.fix": "Fix a rejection",
  "footer.tools": "Tools",
  "footer.learn": "Learn",
  "footer.legal": "Legal",
  "footer.backToTop": "Back to top",
  "footer.presets": "Exam presets",
  "footer.batch": "Batch compress",
  "footer.checker": "Check a file",
  "footer.guides": "Guides",
  "footer.about": "About",
  "footer.contact": "Contact",
  "footer.privacy": "Privacy",
  "footer.cookies": "Cookies",
  "footer.terms": "Terms",
  "footer.editorial": "Editorial",
  "footer.limitations": "Limitations",
  "footer.tagline": "Private file preparation for strict application forms.",
  "footer.note":
    "FormPack checks file rules. It cannot guarantee approval by a portal or authority. Always confirm the current official instructions.",
  "privacy.title": "Files stay on this device",
  "privacy.body":
    "FormPack processes them in your browser and never uploads your documents.",
  "article.faq": "Frequently asked questions",
  "article.sources": "Sources and further reading",
  "home.kicker": "Local file utility / exact ranges",
  "home.title": "Hit the exact size range.",
  "home.intro":
    "Exam portals do not accept “roughly smaller.” Set the rule, choose a file, and get a result that lands inside the required range.",
  "home.ctaPhoto": "Compress a photo",
  "home.ctaPdf": "Start with a PDF",
  "home.noAccount": "No account",
  "home.localFiles": "Files stay in your browser",
  "home.why": "Why FormPack",
  "home.whyTitle": "Most compressors stop at “smaller.”",
  "home.whyBody":
    "FormPack starts with the portal rule and makes the measurable part of the job explicit.",
  "home.proof1Title": "Exact range, not a guess",
  "home.proof1Body": "Set a minimum and maximum in KB, then check the output.",
  "home.proof2Title": "Private by default",
  "home.proof2Body":
    "Your photo or document stays on this device while it is processed.",
  "home.proof3Title": "Built for a deadline",
  "home.proof3Body": "Clear inputs, useful defaults, and one obvious next action.",
  "home.toolsKicker": "Three focused tools",
  "home.toolsTitle": "Choose the file you need to make fit.",
  "home.toolsIntro":
    "One file at a time for compression. Add images only when you are making a PDF.",
  "home.toolPhoto": "Photo compressor",
  "home.toolPhotoBody":
    "Reach a portal’s exact KB range without leaving your browser.",
  "home.toolPdf": "PDF compressor",
  "home.toolPdfBody":
    "Reduce a scanned document to the size the application form allows.",
  "home.toolCombine": "Combine images into one PDF",
  "home.toolCombineBody":
    "Combine a photo, signature, or thumb impression into one PDF.",
  "home.openPhoto": "Open photo tool",
  "home.openPdf": "Open PDF tool",
  "home.combineImages": "Combine images",
  "home.presetsKicker": "Exam presets",
  "home.presetsTitle": "Start with your exam's rule.",
  "home.presetsIntro":
    "Open a preset to see the photo, signature, and document values for that exam, then prepare the file with the exact range.",
  "home.openPreset": "Open preset",
  "home.allPresets": "Browse all exam presets",
  "home.batchLink": "Need many files? Open batch compression",
  "home.checkerLink": "Check a file against a rule",
  "home.guidesKicker": "Practical checklists",
  "home.guidesTitle": "Know the rule before you touch the file.",
  "home.guidesIntro":
    "Short, plain-language guides for the upload problems that cause avoidable rejections.",
  "home.readChecklist": "Read the checklist",
  "home.allGuides": "Browse all file guides",
  "home.privacyTitle": "Measured by the tool. Judged by you.",
  "home.canCheck": "FormPack can check",
  "home.youReview": "You still review",
  "home.check1": "File format and byte size",
  "home.check2": "Dimensions and aspect ratio",
  "home.check3": "Filename and PDF page count",
  "home.review1": "Face position and background",
  "home.review2": "Signature clarity and legibility",
  "home.review3": "Portal-specific visual instructions",
  "home.closingTitle": "Start with the upload rule.",
  "home.closingBody":
    "Enter the size range first. FormPack handles the mechanical work locally.",
  "home.start": "Compress a photo",
  "photo.kicker": "Photo compressor / local processing",
  "photo.title": "Put your photo inside the portal’s range.",
  "photo.intro":
    "Copy the exact KB and pixel rules from the form. FormPack will use them to prepare one JPG or PNG on this device.",
  "photo.loadedFrom": "Loaded from",
  "photo.confirm": "Confirm the current notice before uploading.",
  "photo.add": "01 / Add your photo",
  "photo.choose": "Choose a JPG, PNG, or HEIC",
  "photo.chooseHint":
    "Use your camera, gallery, or device storage. HEIC photos are converted locally.",
  "photo.converting": "Converting HEIC…",
  "photo.chooseAnother": "Choose another photo",
  "photo.choosePhoto": "Choose a photo",
  "photo.sourceFile": "Source file",
  "photo.currentSize": "Current size",
  "photo.dimensions": "Dimensions",
  "photo.noPhoto": "No photo selected",
  "photo.rule": "02 / Copy the portal rule",
  "photo.settings": "Exact output settings",
  "photo.settingsHint": "Use the values printed beside the upload field.",
  "photo.targetSize": "Target file size",
  "photo.min": "Minimum",
  "photo.max": "Maximum",
  "photo.targetDimensions": "Target dimensions",
  "photo.width": "Width",
  "photo.height": "Height",
  "photo.format": "Output format",
  "photo.fit": "Fit mode",
  "photo.share": "Share this rule",
  "photo.compress": "Compress photo",
  "photo.processing": "Processing…",
  "photo.ready": "Ready to process this photo locally.",
  "photo.complete": "Add a photo and complete every target field.",
  "photo.resultReady": "Result ready below.",
  "photo.preparing": "Preparing the result locally…",
  "photo.check": "03 / Check the result",
  "photo.waiting": "Your in-range file will appear here.",
  "photo.waitingStatus": "Waiting for output",
  "photo.resultPreview": "Result preview",
  "photo.download": "Download result",
  "photo.inRange": "In range",
  "photo.closest": "Closest result",
  "photo.compressAgain": "Compress again",
  "photo.finalSize": "Final size",
  "photo.resultStatus": "Result status",
  "photo.insideRange": "Inside the requested range",
  "photo.closestResult": "Closest achievable result",
  "photo.waitingOutput": "Waiting for output",
  "photo.resultPreviewBody":
    "Run the local pass to compare the finished file with your portal rule.",
  "photo.downloadResult": "Download result",
  "pdf.kicker": "PDF compressor / local processing",
  "pdf.title": "Bring your PDF under the portal limit.",
  "pdf.intro":
    "Copy the exact KB rule from the form. FormPack will prepare one smaller PDF on this device.",
  "pdf.loadedFrom": "Loaded from",
  "pdf.confirm": "Confirm the current notice before uploading.",
  "pdf.add": "01 / Add your PDF",
  "pdf.choose": "Choose a PDF",
  "pdf.chooseAnother": "Choose another PDF",
  "pdf.chooseHint": "Use one PDF from your device storage.",
  "pdf.rule": "02 / Copy the portal rule",
  "pdf.settings": "Exact output settings",
  "pdf.settingsHint": "Use the values printed beside the upload field.",
  "pdf.targetSize": "Target file size",
  "pdf.min": "Minimum",
  "pdf.max": "Maximum",
  "pdf.share": "Share this rule",
  "pdf.compress": "Compress PDF",
  "pdf.processing": "Processing…",
  "pdf.ready": "Ready to process this PDF locally.",
  "pdf.complete": "Add a PDF and complete the target range.",
  "pdf.resultReady": "Result ready below.",
  "pdf.preparing": "Preparing the PDF locally…",
  "pdf.check": "03 / Check the result",
  "pdf.waiting": "Your in-range PDF will appear here.",
  "pdf.waitingStatus": "Waiting for output",
  "pdf.resultPreview": "Result preview",
  "pdf.download": "Download result",
  "pdf.inRange": "In range",
  "pdf.closest": "Closest result",
  "pdf.compressAgain": "Compress again",
  "pdf.finalSize": "Final size",
  "pdf.resultStatus": "Result status",
  "pdf.insideRange": "Inside the requested range",
  "pdf.closestResult": "Closest achievable result",
  "pdf.waitingOutput": "Waiting for output",
  "pdf.resultPreviewBody":
    "Run the local pass to compare the finished PDF with your portal rule.",
  "pdf.downloadResult": "Download result",
  "pdf.pages": "Pages",
  "batch.kicker": "Batch compressor / local processing",
  "batch.title": "Compress many photos in one pass.",
  "batch.intro":
    "Apply one size and dimension rule to multiple images, then download the results as a ZIP. Files stay in your browser.",
  "batch.add": "01 / Add images",
  "batch.choose": "Choose multiple images",
  "batch.chooseHint":
    "Select JPG, PNG, WebP, or HEIC files. You can add more later.",
  "batch.converting": "Converting HEIC…",
  "batch.chooseAnother": "Add more images",
  "batch.rule": "02 / Set the shared rule",
  "batch.settings": "Batch output settings",
  "batch.settingsHint":
    "Every selected image uses the same range and dimensions.",
  "batch.targetSize": "Target file size",
  "batch.min": "Minimum",
  "batch.max": "Maximum",
  "batch.targetDimensions": "Target dimensions (optional)",
  "batch.width": "Width",
  "batch.height": "Height",
  "batch.dimensionHint":
    "Leave both empty to keep each image's original dimensions.",
  "batch.format": "Output format",
  "batch.fit": "Fit mode",
  "batch.share": "Share this rule",
  "batch.compress": "Compress all",
  "batch.compressAgain": "Compress again",
  "batch.compressing": "Compressing…",
  "batch.noFiles": "Add at least one image.",
  "batch.ready": "Ready to compress",
  "batch.complete": "Batch complete.",
  "batch.files": "files",
  "batch.remove": "Remove",
  "batch.downloadAll": "Download ZIP",
  "batch.results": "03 / Results",
  "batch.resultsTitle": "Your compressed files will appear here.",
  "batch.inRange": "In range",
  "batch.closest": "Closest",
  "batch.error": "Could not process this file.",
  "batch.keepOriginal": "keep original",
  "checker.kicker": "File check / local processing",
  "checker.title": "Will your file pass the upload rule?",
  "checker.intro":
    "Measure a photo, signature, or PDF against the rule before you upload. The check runs locally and does not guarantee portal approval.",
  "checker.add": "01 / Add a file",
  "checker.choose": "Choose a photo, signature, or PDF",
  "checker.chooseHint": "JPG, PNG, HEIC, or PDF. The file stays on this device.",
  "checker.rule": "02 / Add the rule",
  "checker.settings": "Upload rule",
  "checker.preset": "Load an exam preset",
  "checker.custom": "Custom rule",
  "checker.format": "Format",
  "checker.min": "Minimum KB",
  "checker.max": "Maximum KB",
  "checker.width": "Width (px)",
  "checker.height": "Height (px)",
  "checker.maxPages": "Maximum pages",
  "checker.check": "Check file",
  "checker.checking": "Checking…",
  "checker.results": "03 / Results",
  "checker.resultsTitle": "Your rule-by-rule result will appear here.",
  "checker.pass": "Pass",
  "checker.fail": "Needs attention",
  "checker.notSet": "Not set",
  "checker.visual": "Visual review still required",
  "checker.visualBody":
    "A measured pass does not confirm face position, background, signature clarity, or portal approval.",
  "checker.noFile": "Add a file to check.",
  "checker.size": "File size",
  "checker.dimensions": "Dimensions",
  "checker.pages": "Pages",
  "checker.formatCheck": "Format",
  "checker.share": "Share this check",
  "checker.ready": "Ready to check this file.",
  "checker.complete": "Measured checks complete.",
  "checker.error": "The file could not be read in this browser.",
  "common.kb": "KB",
  "common.px": "px",
  "common.download": "Download",
  "common.check": "Check",
}

const hi: Dictionary = {
  "skip": "मुख्य सामग्री पर जाएँ",
  "nav.compress": "फ़ाइलें कंप्रेस करें",
  "nav.presets": "एग्ज़ाम प्रीसेट",
  "nav.prepare": "पैक तैयार करें",
  "nav.guides": "गाइड",
  "nav.localProcessing": "लोकल प्रोसेसिंग",
  "nav.mobileGuides": "फ़ाइल गाइड पढ़ें",
  "language.label": "भाषा",
  "language.english": "English",
  "language.hindi": "हिंदी",
  "footer.fix": "रिजेक्शन ठीक करें",
  "footer.tools": "टूल्स",
  "footer.learn": "जानें",
  "footer.legal": "कानूनी",
  "footer.backToTop": "ऊपर जाएँ",
  "footer.presets": "एग्ज़ाम प्रीसेट",
  "footer.batch": "बैच कंप्रेस",
  "footer.checker": "फ़ाइल जाँचें",
  "footer.guides": "गाइड",
  "footer.about": "हमारे बारे में",
  "footer.contact": "संपर्क",
  "footer.privacy": "प्राइवेसी",
  "footer.cookies": "कुकीज़",
  "footer.terms": "नियम",
  "footer.editorial": "एडिटोरियल",
  "footer.limitations": "सीमाएँ",
  "footer.tagline": "सख्त आवेदन फ़ॉर्म के लिए निजी फ़ाइल तैयारी।",
  "footer.note":
    "FormPack फ़ाइल नियमों की जाँच करता है। यह पोर्टल या प्राधिकरण की स्वीकृति की गारंटी नहीं दे सकता। हमेशा वर्तमान आधिकारिक निर्देश जाँचें।",
  "privacy.title": "फ़ाइलें इस डिवाइस पर रहती हैं",
  "privacy.body":
    "FormPack इन्हें आपके ब्राउज़र में प्रोसेस करता है और आपके दस्तावेज़ कभी अपलोड नहीं करता।",
  "article.faq": "अक्सर पूछे जाने वाले प्रश्न",
  "article.sources": "स्रोत और आगे पढ़ने के लिए",
  "home.kicker": "लोकल फ़ाइल टूल / सटीक रेंज",
  "home.title": "सटीक साइज़ रेंज हासिल करें।",
  "home.intro":
    "एग्ज़ाम पोर्टल “लगभग छोटा” फ़ाइल स्वीकार नहीं करते। नियम सेट करें, फ़ाइल चुनें और आवश्यक रेंज के अंदर परिणाम पाएँ।",
  "home.ctaPhoto": "फ़ोटो कंप्रेस करें",
  "home.ctaPdf": "PDF से शुरू करें",
  "home.noAccount": "अकाउंट की ज़रूरत नहीं",
  "home.localFiles": "फ़ाइलें आपके ब्राउज़र में रहती हैं",
  "home.why": "FormPack क्यों?",
  "home.whyTitle": "ज़्यादातर कंप्रेसर “छोटा” पर रुक जाते हैं।",
  "home.whyBody":
    "FormPack पोर्टल नियम से शुरू करता है और काम का मापने योग्य हिस्सा स्पष्ट करता है।",
  "home.proof1Title": "सटीक रेंज, कोई अंदाज़ा नहीं",
  "home.proof1Body": "KB में न्यूनतम और अधिकतम सेट करें, फिर आउटपुट जाँचें।",
  "home.proof2Title": "डिफ़ॉल्ट रूप से निजी",
  "home.proof2Body":
    "प्रोसेसिंग के दौरान आपकी फ़ोटो या दस्तावेज़ इसी डिवाइस पर रहता है।",
  "home.proof3Title": "समय सीमा के लिए बनाया गया",
  "home.proof3Body": "साफ़ इनपुट, उपयोगी डिफ़ॉल्ट और एक स्पष्ट अगला कदम।",
  "home.toolsKicker": "तीन केंद्रित टूल्स",
  "home.toolsTitle": "जिस फ़ाइल को फिट करना है उसे चुनें।",
  "home.toolsIntro":
    "कंप्रेशन के लिए एक बार में एक फ़ाइल। PDF बनाते समय ही कई इमेज जोड़ें।",
  "home.toolPhoto": "फ़ोटो कंप्रेसर",
  "home.toolPhotoBody":
    "ब्राउज़र छोड़े बिना पोर्टल की सटीक KB रेंज तक पहुँचें।",
  "home.toolPdf": "PDF कंप्रेसर",
  "home.toolPdfBody":
    "स्कैन किए दस्तावेज़ को आवेदन फ़ॉर्म की अनुमत साइज़ तक छोटा करें।",
  "home.toolCombine": "कई इमेज को एक PDF में जोड़ें",
  "home.toolCombineBody":
    "फ़ोटो, सिग्नेचर या अंगूठे की छाप को एक PDF में जोड़ें।",
  "home.openPhoto": "फ़ोटो टूल खोलें",
  "home.openPdf": "PDF टूल खोलें",
  "home.combineImages": "इमेज जोड़ें",
  "home.presetsKicker": "एग्ज़ाम प्रीसेट",
  "home.presetsTitle": "अपने एग्ज़ाम के नियम से शुरू करें।",
  "home.presetsIntro":
    "उस एग्ज़ाम के फ़ोटो, सिग्नेचर और दस्तावेज़ मान देखने के लिए प्रीसेट खोलें, फिर सटीक रेंज के साथ फ़ाइल तैयार करें।",
  "home.openPreset": "प्रीसेट खोलें",
  "home.allPresets": "सभी एग्ज़ाम प्रीसेट देखें",
  "home.batchLink": "कई फ़ाइलें हैं? बैच कंप्रेशन खोलें",
  "home.checkerLink": "नियम के अनुसार फ़ाइल जाँचें",
  "home.guidesKicker": "व्यावहारिक चेकलिस्ट",
  "home.guidesTitle": "फ़ाइल बदलने से पहले नियम जानें।",
  "home.guidesIntro":
    "उन अपलोड समस्याओं के लिए छोटी, सरल गाइड जो टाली जा सकने वाली अस्वीकृतियाँ पैदा करती हैं।",
  "home.readChecklist": "चेकलिस्ट पढ़ें",
  "home.allGuides": "सभी फ़ाइल गाइड देखें",
  "home.privacyTitle": "टूल मापता है। फ़ैसला आप करते हैं।",
  "home.canCheck": "FormPack जाँच सकता है",
  "home.youReview": "आपको अभी भी जाँचना है",
  "home.check1": "फ़ाइल फ़ॉर्मेट और बाइट साइज़",
  "home.check2": "आयाम और पहलू अनुपात",
  "home.check3": "फ़ाइल नाम और PDF पेज संख्या",
  "home.review1": "चेहरे की स्थिति और बैकग्राउंड",
  "home.review2": "सिग्नेचर की स्पष्टता",
  "home.review3": "पोर्टल के विशेष दृश्य निर्देश",
  "home.closingTitle": "अपलोड नियम से शुरू करें।",
  "home.closingBody":
    "पहले साइज़ रेंज दर्ज करें। FormPack मशीनी काम लोकल रूप से करता है।",
  "home.start": "फ़ोटो कंप्रेस करें",
  "photo.kicker": "फ़ोटो कंप्रेसर / लोकल प्रोसेसिंग",
  "photo.title": "अपनी फ़ोटो को पोर्टल की रेंज में लाएँ।",
  "photo.intro":
    "फ़ॉर्म से सटीक KB और पिक्सेल नियम कॉपी करें। FormPack इन्हीं का उपयोग करके इस डिवाइस पर एक JPG या PNG तैयार करेगा।",
  "photo.loadedFrom": "लोड किया गया:",
  "photo.confirm": "अपलोड से पहले वर्तमान नोटिस जाँचें।",
  "photo.add": "01 / फ़ोटो जोड़ें",
  "photo.choose": "JPG, PNG या HEIC चुनें",
  "photo.chooseHint":
    "कैमरा, गैलरी या डिवाइस स्टोरेज से चुनें। HEIC फ़ोटो लोकल रूप से कन्वर्ट होती हैं।",
  "photo.converting": "HEIC कन्वर्ट हो रहा है…",
  "photo.chooseAnother": "दूसरी फ़ोटो चुनें",
  "photo.choosePhoto": "फ़ोटो चुनें",
  "photo.sourceFile": "स्रोत फ़ाइल",
  "photo.currentSize": "वर्तमान साइज़",
  "photo.dimensions": "आयाम",
  "photo.noPhoto": "कोई फ़ोटो नहीं चुनी",
  "photo.rule": "02 / पोर्टल नियम कॉपी करें",
  "photo.settings": "सटीक आउटपुट सेटिंग्स",
  "photo.settingsHint": "अपलोड फ़ील्ड के पास दिए मानों का उपयोग करें।",
  "photo.targetSize": "लक्ष्य फ़ाइल साइज़",
  "photo.min": "न्यूनतम",
  "photo.max": "अधिकतम",
  "photo.targetDimensions": "लक्ष्य आयाम",
  "photo.width": "चौड़ाई",
  "photo.height": "ऊँचाई",
  "photo.format": "आउटपुट फ़ॉर्मेट",
  "photo.fit": "फ़िट मोड",
  "photo.share": "यह नियम साझा करें",
  "photo.compress": "फ़ोटो कंप्रेस करें",
  "photo.processing": "प्रोसेस हो रहा है…",
  "photo.ready": "इस फ़ोटो को लोकल प्रोसेस करने के लिए तैयार।",
  "photo.complete": "फ़ोटो जोड़ें और सभी लक्ष्य फ़ील्ड पूरे करें।",
  "photo.resultReady": "परिणाम नीचे तैयार है।",
  "photo.preparing": "परिणाम लोकल तैयार हो रहा है…",
  "photo.check": "03 / परिणाम जाँचें",
  "photo.waiting": "आपकी रेंज में आने वाली फ़ाइल यहाँ दिखेगी।",
  "photo.waitingStatus": "आउटपुट की प्रतीक्षा",
  "photo.resultPreview": "परिणाम प्रीव्यू",
  "photo.download": "परिणाम डाउनलोड करें",
  "photo.inRange": "रेंज में",
  "photo.closest": "सबसे नज़दीकी परिणाम",
  "photo.compressAgain": "फिर कंप्रेस करें",
  "photo.finalSize": "अंतिम साइज़",
  "photo.resultStatus": "परिणाम स्थिति",
  "photo.insideRange": "अनुरोधित रेंज के अंदर",
  "photo.closestResult": "सबसे नज़दीकी संभव परिणाम",
  "photo.waitingOutput": "आउटपुट की प्रतीक्षा",
  "photo.resultPreviewBody":
    "तैयार फ़ाइल की तुलना पोर्टल नियम से करने के लिए लोकल प्रोसेस चलाएँ।",
  "photo.downloadResult": "परिणाम डाउनलोड करें",
  "pdf.kicker": "PDF कंप्रेसर / लोकल प्रोसेसिंग",
  "pdf.title": "अपनी PDF को पोर्टल की सीमा के अंदर लाएँ।",
  "pdf.intro":
    "फ़ॉर्म से सटीक KB नियम कॉपी करें। FormPack इस डिवाइस पर एक छोटी PDF तैयार करेगा।",
  "pdf.loadedFrom": "लोड किया गया:",
  "pdf.confirm": "अपलोड से पहले वर्तमान नोटिस जाँचें।",
  "pdf.add": "01 / PDF जोड़ें",
  "pdf.choose": "PDF चुनें",
  "pdf.chooseAnother": "दूसरी PDF चुनें",
  "pdf.chooseHint": "डिवाइस स्टोरेज से एक PDF चुनें।",
  "pdf.rule": "02 / पोर्टल नियम कॉपी करें",
  "pdf.settings": "सटीक आउटपुट सेटिंग्स",
  "pdf.settingsHint": "अपलोड फ़ील्ड के पास दिए मानों का उपयोग करें।",
  "pdf.targetSize": "लक्ष्य फ़ाइल साइज़",
  "pdf.min": "न्यूनतम",
  "pdf.max": "अधिकतम",
  "pdf.share": "यह नियम साझा करें",
  "pdf.compress": "PDF कंप्रेस करें",
  "pdf.processing": "प्रोसेस हो रहा है…",
  "pdf.ready": "इस PDF को लोकल प्रोसेस करने के लिए तैयार।",
  "pdf.complete": "PDF जोड़ें और लक्ष्य रेंज पूरी करें।",
  "pdf.resultReady": "परिणाम नीचे तैयार है।",
  "pdf.preparing": "PDF लोकल तैयार हो रही है…",
  "pdf.check": "03 / परिणाम जाँचें",
  "pdf.waiting": "आपकी रेंज में आने वाली PDF यहाँ दिखेगी।",
  "pdf.waitingStatus": "आउटपुट की प्रतीक्षा",
  "pdf.resultPreview": "परिणाम प्रीव्यू",
  "pdf.download": "परिणाम डाउनलोड करें",
  "pdf.inRange": "रेंज में",
  "pdf.closest": "सबसे नज़दीकी परिणाम",
  "pdf.compressAgain": "फिर कंप्रेस करें",
  "pdf.finalSize": "अंतिम साइज़",
  "pdf.resultStatus": "परिणाम स्थिति",
  "pdf.insideRange": "अनुरोधित रेंज के अंदर",
  "pdf.closestResult": "सबसे नज़दीकी संभव परिणाम",
  "pdf.waitingOutput": "आउटपुट की प्रतीक्षा",
  "pdf.resultPreviewBody":
    "तैयार PDF की तुलना पोर्टल नियम से करने के लिए लोकल प्रोसेस चलाएँ।",
  "pdf.downloadResult": "परिणाम डाउनलोड करें",
  "pdf.pages": "पेज",
  "batch.kicker": "बैच कंप्रेसर / लोकल प्रोसेसिंग",
  "batch.title": "एक बार में कई फ़ोटो कंप्रेस करें।",
  "batch.intro":
    "कई इमेज पर एक साइज़ और आयाम नियम लागू करें, फिर परिणाम ZIP में डाउनलोड करें। फ़ाइलें आपके ब्राउज़र में रहती हैं।",
  "batch.add": "01 / इमेज जोड़ें",
  "batch.choose": "कई इमेज चुनें",
  "batch.chooseHint":
    "JPG, PNG, WebP या HEIC फ़ाइलें चुनें। बाद में और जोड़ सकते हैं।",
  "batch.converting": "HEIC कन्वर्ट हो रहा है…",
  "batch.chooseAnother": "और इमेज जोड़ें",
  "batch.rule": "02 / साझा नियम सेट करें",
  "batch.settings": "बैच आउटपुट सेटिंग्स",
  "batch.settingsHint":
    "हर चुनी हुई इमेज एक ही रेंज और आयाम का उपयोग करेगी।",
  "batch.targetSize": "लक्ष्य फ़ाइल साइज़",
  "batch.min": "न्यूनतम",
  "batch.max": "अधिकतम",
  "batch.targetDimensions": "लक्ष्य आयाम (वैकल्पिक)",
  "batch.width": "चौड़ाई",
  "batch.height": "ऊँचाई",
  "batch.dimensionHint":
    "मूल आयाम रखने के लिए दोनों खाली छोड़ें।",
  "batch.format": "आउटपुट फ़ॉर्मेट",
  "batch.fit": "फ़िट मोड",
  "batch.share": "यह नियम साझा करें",
  "batch.compress": "सभी कंप्रेस करें",
  "batch.compressAgain": "फिर कंप्रेस करें",
  "batch.compressing": "कंप्रेस हो रहा है…",
  "batch.noFiles": "कम से कम एक इमेज जोड़ें।",
  "batch.ready": "कंप्रेस करने के लिए तैयार",
  "batch.complete": "बैच पूरा हुआ।",
  "batch.files": "फ़ाइलें",
  "batch.remove": "हटाएँ",
  "batch.downloadAll": "ZIP डाउनलोड करें",
  "batch.results": "03 / परिणाम",
  "batch.resultsTitle": "आपकी कंप्रेस की गई फ़ाइलें यहाँ दिखेंगी।",
  "batch.inRange": "रेंज में",
  "batch.closest": "सबसे नज़दीकी",
  "batch.error": "यह फ़ाइल प्रोसेस नहीं हो सकी।",
  "batch.keepOriginal": "मूल आयाम",
  "checker.kicker": "फ़ाइल जाँच / लोकल प्रोसेसिंग",
  "checker.title": "क्या आपकी फ़ाइल अपलोड नियम पास करेगी?",
  "checker.intro":
    "अपलोड से पहले फ़ोटो, सिग्नेचर या PDF को नियम के अनुसार मापें। जाँच लोकल चलती है और पोर्टल स्वीकृति की गारंटी नहीं देती।",
  "checker.add": "01 / फ़ाइल जोड़ें",
  "checker.choose": "फ़ोटो, सिग्नेचर या PDF चुनें",
  "checker.chooseHint": "JPG, PNG, HEIC या PDF। फ़ाइल इसी डिवाइस पर रहती है।",
  "checker.rule": "02 / नियम जोड़ें",
  "checker.settings": "अपलोड नियम",
  "checker.preset": "एग्ज़ाम प्रीसेट लोड करें",
  "checker.custom": "कस्टम नियम",
  "checker.format": "फ़ॉर्मेट",
  "checker.min": "न्यूनतम KB",
  "checker.max": "अधिकतम KB",
  "checker.width": "चौड़ाई (px)",
  "checker.height": "ऊँचाई (px)",
  "checker.maxPages": "अधिकतम पेज",
  "checker.check": "फ़ाइल जाँचें",
  "checker.checking": "जाँच हो रही है…",
  "checker.results": "03 / परिणाम",
  "checker.resultsTitle": "आपका नियम-दर-नियम परिणाम यहाँ दिखेगा।",
  "checker.pass": "पास",
  "checker.fail": "ध्यान दें",
  "checker.notSet": "सेट नहीं",
  "checker.visual": "दृश्य जाँच अभी भी आवश्यक",
  "checker.visualBody":
    "मापा गया पास फ़ेस पोज़िशन, बैकग्राउंड, सिग्नेचर स्पष्टता या पोर्टल स्वीकृति की पुष्टि नहीं करता।",
  "checker.noFile": "जाँचने के लिए फ़ाइल जोड़ें।",
  "checker.size": "फ़ाइल साइज़",
  "checker.dimensions": "आयाम",
  "checker.pages": "पेज",
  "checker.formatCheck": "फ़ॉर्मेट",
  "checker.share": "यह जाँच साझा करें",
  "checker.ready": "इस फ़ाइल को जाँचने के लिए तैयार।",
  "checker.complete": "मापी गई जाँच पूरी हुई।",
  "checker.error": "यह फ़ाइल इस ब्राउज़र में पढ़ी नहीं जा सकी।",
  "common.kb": "KB",
  "common.px": "px",
  "common.download": "डाउनलोड",
  "common.check": "जाँचें",
}

const dictionaries: Record<Locale, Dictionary> = { en, hi }

const directions: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  hi: "ltr",
}

const storageKey = "formpack-locale"

type I18nValue = {
  locale: Locale
  dir: "ltr" | "rtl"
  setLocale: (locale: Locale) => void
  t: (key: string, fallback?: string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en"
    const fromQuery = new URLSearchParams(window.location.search).get("lang")
    if (fromQuery === "hi" || fromQuery === "en") return fromQuery
    try {
      const stored = window.localStorage.getItem(storageKey)
      return stored === "hi" || stored === "en" ? stored : "en"
    } catch {
      return "en"
    }
  })

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(storageKey, next)
    } catch {
      // Language selection still works for the current session.
    }
  }

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = directions[locale]
  }, [locale])

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: directions[locale],
      setLocale,
      t: (key, fallback) =>
        dictionaries[locale][key] ??
        fallback ??
        dictionaries.en[key] ??
        key,
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error("useI18n must be used inside I18nProvider")
  return value
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <select
      className={`language-switcher ${className}`.trim()}
      aria-label={t("language.label")}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
    >
      <option value="en">EN</option>
      <option value="hi">हिंदी</option>
    </select>
  )
}
