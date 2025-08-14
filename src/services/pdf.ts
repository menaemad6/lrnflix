import * as pdfjsLib from 'pdfjs-dist'
// Vite: import worker URL that can be served correctly in dev/build
// If you prefer a static public file, set VITE_PDFJS_WORKER_SRC to "/pdfjs/pdf.worker.js"
// or use a CDN URL (e.g., https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite query import provides string URL at runtime
import defaultWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Ensure the PDF.js worker is configured once per app lifecycle
// This expects the worker file to be served at /pdfjs/pdf.worker.js
// See docs/README_PDF_TEXT_EXTRACTION.md for setup instructions
if (typeof window !== 'undefined') {
	const envWorker = (import.meta as any)?.env?.VITE_PDFJS_WORKER_SRC as string | undefined
	const workerUrl = envWorker && envWorker.trim().length > 0 ? envWorker : (defaultWorkerUrl as string)
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl
    } catch {
		// noop – pdf.js may set up a fake worker if needed, but we aim to avoid that scenario
	}
}

export type ExtractResult =
	| {
				success: true
				text: string
				fileInfo: { name: string; size: number; type: string; pageCount: number }
		  }
	| {
				success: false
				error: string
				fileInfo?: { name?: string; size?: number; type?: string; pageCount?: number }
		  }

export async function extractTextFromPDF(pdfFile: File): Promise<ExtractResult> {
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
			const textItems = textContent.items.map((item: any) => (item?.str ? String(item.str) : ''))
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
	} catch (error: any) {
		console.error('Error extracting text from PDF:', error)
		return {
			success: false,
			error: error?.message || 'Failed to extract text from the PDF',
			fileInfo: {
				name: pdfFile?.name,
				size: (pdfFile as any)?.size,
				type: (pdfFile as any)?.type,
			},
		}
	}
}


