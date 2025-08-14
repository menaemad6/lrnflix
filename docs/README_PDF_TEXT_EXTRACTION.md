## PDF Text Extraction Feature (Portable Guide)

This guide documents the exact PDF text extraction feature used in this project so you can implement the same behavior in another React app. It covers dependencies, worker setup, the core extraction function, UI wiring, returned data shape, and troubleshooting.

### What this feature does
- **Parses text from user-uploaded PDFs in the browser** using PDF.js (`pdfjs-dist`).
- Works entirely client-side. No server is required.
- Returns a structured result with success status, extracted text, file info, and error messages when applicable.

---

### Prerequisites
- React (any modern setup; works with Vite, CRA, Next.js with client-side usage).
- Node 16+ recommended.

---

### Install dependencies
```bash
npm install pdfjs-dist
```

---

### Worker setup (mandatory)
PDF.js requires a Web Worker to parse PDFs efficiently.

This implementation uses a **static worker file** served from `public/pdfjs/pdf.worker.js` and points PDF.js to it via `GlobalWorkerOptions.workerSrc`.

1) Create a folder for the worker in your app's public assets (served at runtime):
```
public/pdfjs/
```

2) Copy the worker file into that folder. Either:
- Copy from this project: `public/pdfjs/pdf.worker.js`, or
- Copy from your local `node_modules`:
  - `node_modules/pdfjs-dist/build/pdf.worker.min.js` → `public/pdfjs/pdf.worker.js`

3) In your code (preferably near your extraction utility), set the worker src once:
```js
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.js'
```

Notes:
- The path must resolve from the site root at runtime. If your app serves static files from another base path, adjust accordingly (e.g., `/myapp/pdfjs/pdf.worker.js`).
- If you prefer an alternative setup, you can host the worker on a CDN or use advanced bundler worker config. The static public file approach is the simplest and matches this project.

---

### Core extraction utility
Create a reusable helper (e.g., `src/services/pdf.js`) that mirrors the implementation:

```js
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source to the public path above
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.js'

// Extract text from a PDF File object (from an <input type="file"/> or drag/drop)
export const extractTextFromPDF = async (pdfFile) => {
  try {
    if (!pdfFile || pdfFile.type !== 'application/pdf') {
      return { success: false, error: 'The uploaded file is not a PDF' }
    }

    const arrayBuffer = await pdfFile.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    let extractedText = ''
    const totalPages = pdf.numPages

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const textItems = textContent.items.map((item) => item.str)
      extractedText += textItems.join(' ') + '\n\n'
    }

    if (!extractedText || extractedText.trim() === '') {
      return {
        success: false,
        error: 'No text could be extracted from the PDF',
        fileInfo: {
          name: pdfFile.name,
          size: pdfFile.size,
          type: pdfFile.type,
          pageCount: pdf.numPages,
        },
      }
    }

    return {
      success: true,
      text: extractedText,
      fileInfo: {
        name: pdfFile.name,
        size: pdfFile.size,
        type: pdfFile.type,
        pageCount: pdf.numPages,
      },
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    return {
      success: false,
      error: error.message || 'Failed to extract text from the PDF',
      fileInfo: {
        name: pdfFile?.name,
        size: pdfFile?.size,
        type: pdfFile?.type,
      },
    }
  }
}
```

Return type:
```ts
type ExtractResult =
  | { success: true; text: string; fileInfo: { name: string; size: number; type: string; pageCount: number } }
  | { success: false; error: string; fileInfo?: { name?: string; size?: number; type?: string; pageCount?: number } }
```

---

### Minimal UI integration (React)
Below is a condensed drag-and-drop + file input example wiring the helper above.

```jsx
import React, { useRef, useState } from 'react'
import { extractTextFromPDF } from './services/pdf'

export default function PdfUploadExample() {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFiles = async (f) => {
    setLoading(true)
    setResult(null)
    const res = await extractTextFromPDF(f)
    setResult(res)
    setLoading(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) {
      setFile(f)
      handleFiles(f)
    }
  }

  const onChange = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      handleFiles(f)
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{ border: '2px dashed #ccc', padding: 24, textAlign: 'center', background: isDragging ? '#f6f6ff' : 'transparent' }}
      >
        <p>Drag & Drop your PDF here or</p>
        <button onClick={() => inputRef.current?.click()}>Browse Files</button>
        <input ref={inputRef} type="file" accept=".pdf" onChange={onChange} style={{ display: 'none' }} />
      </div>

      {loading && <p>Extracting text...</p>}
      {file && <p>Selected: {file.name}</p>}

      {result && result.success && (
        <div>
          <h3>Extracted Text</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{result.text}</pre>
        </div>
      )}

      {result && !result.success && (
        <div style={{ color: 'crimson' }}>Error: {result.error}</div>
      )}
    </div>
  )
}
```

---

### Optional: End-to-end processing with AI (as in this project)
If you also want to send the extracted text to an AI endpoint and receive structured solutions, mirror the following pattern used here:

```js
// Example shape – adapt to your AI provider
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export const processPDFAndGetSolutions = async (pdfFile) => {
  const extractionResult = await extractTextFromPDF(pdfFile)
  if (!extractionResult.success) {
    return { success: false, error: extractionResult.error, stage: 'extraction', fileInfo: extractionResult.fileInfo }
  }

  const assignmentData = {
    assignmentText: extractionResult.text,
    format: 'detailed',
    responseType: 'json',
    source: { type: 'pdf', fileName: extractionResult.fileInfo.name, pageCount: extractionResult.fileInfo.pageCount },
  }

  const prompt = `You are an AI assistant... Return ONLY valid JSON...` // see project code for full prompt
  const body = { contents: [{ parts: [{ text: prompt }], role: 'user' }] }

  const resp = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await resp.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : text
    const parsed = JSON.parse(jsonString)
    return { success: true, data: parsed, fileInfo: extractionResult.fileInfo, extractedText: extractionResult.text }
  } catch (e) {
    return { success: false, error: 'Failed to parse AI response as JSON', rawResponse: text }
  }
}
```

Environment variable for the above (example with Vite):
```
VITE_GEMINI_API_KEY=your_api_key
```

---

### Common pitfalls and troubleshooting
- **Worker not found (network 404/Failed to load PDF worker):** Ensure the file exists at `public/pdfjs/pdf.worker.js` and the `workerSrc` path matches the URL where it is served.
- **Empty extraction or missing text:** Many scanned PDFs are just images with no embedded text. This extractor does not include OCR. For scanned PDFs, integrate OCR (e.g., Tesseract.js) before/after PDF.js.
- **Large PDFs are slow:** Consider a page limit, progress UI, or abort control. You can iterate only the first N pages or add a cancel token.
- **Non-PDF uploads:** Guard by checking `file.type === 'application/pdf'` and show a friendly error.
- **CORS issues (rare with local files):** If loading PDFs by URL instead of local file input, configure CORS on the server.

---

### Testing checklist
- Upload a native (selectable text) PDF → text should populate.
- Upload a scanned (image-only) PDF → expect "No text could be extracted".
- Very large PDF → verify UI remains responsive; consider a spinner.
- Wrong file type → friendly validation error.
- Worker path → open browser network tab to confirm `pdf.worker.js` loads with 200 OK.

---

### File map (suggested)
- `public/pdfjs/pdf.worker.js` – PDF.js worker file (static)
- `src/services/pdf.js` – your `extractTextFromPDF` helper
- Anywhere in UI – drag/drop or file input wired to call the helper and render results

---

### License note
This guide mirrors the feature present in this codebase and relies on `pdfjs-dist` (Mozilla PDF.js). Follow `pdfjs-dist`’s license for redistribution.


