import { useCallback, useMemo, useState } from 'react'
import { extractTextFromPDF, ExtractResult } from '@/services/pdf'

type PdfAiTask = 'extract-questions' | 'extract-course-info'

interface UsePdfAiOptions {
	model?: string
	temperature?: number
	maxOutputTokens?: number
}

interface BaseSuccess<T> {
	success: true
	data: T
	extractedText?: string
	fileInfo?: ExtractResult extends { success: true; fileInfo: infer F } ? F : never
}

interface BaseError {
	success: false
	error: string
	stage?: 'extraction' | 'ai'
	fileInfo?: ExtractResult extends { success: true; fileInfo: infer F } ? F : never
	rawResponse?: string
}

export type PdfAiResult<T> = BaseSuccess<T> | BaseError

export type ExtractedQuestion = {
	id: string
	question_text: string
	question_type: 'mcq' | 'written'
	options?: string[]
	correct_answer?: string
	points?: number
}

export type CourseInfo = {
	title?: string
	description?: string
	category?: string
	price?: number
	instructor?: string
	chapters?: Array<{
		title: string
		description?: string
		lessons?: Array<{ title: string; duration_minutes?: number }>
	}>
}

function buildPrompt(task: PdfAiTask, text: string) {
	if (task === 'extract-questions') {
		const system = `You are an expert educational content parser. Extract well-structured quiz questions from provided text.

Rules:
- Detect MCQ and written questions
- For MCQ, include options[] and prefer 3-6 options
- Provide concise, unambiguous question_text
- If a correct answer is present in the text, include it as correct_answer (exact text for MCQ)
- Return ONLY JSON with the specified schema`

		const schema = {
			questions: [
				{
					id: 'string',
					question_text: 'string',
					question_type: "'mcq' | 'written'",
					options: ['string?'],
					correct_answer: 'string?',
					points: 'number?'
				}
			]
		}

		const user = `Source text:\n\n${text}\n\nReturn JSON only with shape: ${JSON.stringify(schema)}`
		return { system, user }
	}

	const system = `You are an expert course information extractor. Parse course metadata, chapters, and lessons from text.

Rules:
- Provide best-effort fields: title, description, category, price, instructor
- Aggregate chapters with lessons when present
- Use numbers for price when explicit, otherwise omit
- Return ONLY JSON with the specified schema`

	const schema = {
		course: {
			title: 'string?',
			description: 'string?',
			category: 'string?',
			price: 'number?',
			instructor: 'string?',
			chapters: [
				{
					title: 'string',
					description: 'string?',
					lessons: [
						{ title: 'string', duration_minutes: 'number?' }
					]
				}
			]
		}
	}

	const user = `Source text:\n\n${text}\n\nReturn JSON only with shape: ${JSON.stringify(schema)}`
	return { system, user }
}

async function callGeminiJSON(system: string, user: string, opts?: UsePdfAiOptions) {
	const apiKey = import.meta.env.VITE_GEMINI_API_KEY
	if (!apiKey) throw new Error('Gemini API key not configured')
	const model = opts?.model || 'gemini-1.5-flash-latest'
	const temperature = opts?.temperature ?? 0.2
	const maxOutputTokens = opts?.maxOutputTokens ?? 2000

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
	const body: any = {
		systemInstruction: { parts: [{ text: system }] },
		contents: [{ parts: [{ text: user }] }],
		generationConfig: {
			temperature,
			maxOutputTokens,
			responseMimeType: 'application/json',
		},
	}

	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
	}

	const data = await response.json()
	const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
	if (!text) throw new Error('Empty response from Gemini')
	return text
}

export function usePdfAi(task: PdfAiTask, options?: UsePdfAiOptions) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const schemaGuard = useMemo(() => {
		return {
			parseQuestions(json: any): ExtractedQuestion[] {
				const list = json?.questions
				if (!Array.isArray(list)) return []
				return list
					.map((q) => ({
						id: String(q.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
						question_text: String(q.question_text ?? ''),
						question_type: q.question_type === 'mcq' ? 'mcq' : 'written',
						options: Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : undefined,
						correct_answer: q.correct_answer ? String(q.correct_answer) : undefined,
						points: typeof q.points === 'number' ? q.points : undefined,
					}))
					.filter((q) => q.question_text)
			},
			parseCourse(json: any): CourseInfo {
				const c = json?.course ?? json
				const chaptersIn = Array.isArray(c?.chapters) ? c.chapters : []
				return {
					title: c?.title ? String(c.title) : undefined,
					description: c?.description ? String(c.description) : undefined,
					category: c?.category ? String(c.category) : undefined,
					price: typeof c?.price === 'number' ? c.price : undefined,
					instructor: c?.instructor ? String(c.instructor) : undefined,
					chapters: chaptersIn
						.map((ch: any) => ({
							title: String(ch?.title ?? ''),
							description: ch?.description ? String(ch.description) : undefined,
							lessons: Array.isArray(ch?.lessons)
								? ch.lessons.map((ls: any) => ({
										title: String(ls?.title ?? ''),
										duration_minutes:
											typeof ls?.duration_minutes === 'number' ? ls.duration_minutes : undefined,
								  }))
								: undefined,
						}))
					.filter((ch: any) => ch.title),
				}
			},
		}
	}, [])

	const process = useCallback(
		async (
			input:
				| { pdfFile: File; rawText?: undefined }
				| { pdfFile?: undefined; rawText: string }
		): Promise<PdfAiResult<ExtractedQuestion[] | CourseInfo>> => {
			setLoading(true)
			setError(null)
			try {
				let text: string
				let fileInfo: any
				if ('pdfFile' in input && input.pdfFile) {
					const res = await extractTextFromPDF(input.pdfFile)
					if (!res.success) {
						return { success: false, error: res.error, stage: 'extraction', fileInfo: res.fileInfo }
					}
					text = res.text
					fileInfo = res.fileInfo
				} else {
					text = input.rawText
				}

				const { system, user } = buildPrompt(task, text)
				const responseText = await callGeminiJSON(system, user, options)
				let parsed: any
				try {
					parsed = JSON.parse(responseText)
				} catch (_e) {
					// Try to salvage JSON from text blocks
					const match = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
					if (!match) throw new Error('Failed to parse AI response as JSON')
					parsed = JSON.parse(match[0])
				}

				if (task === 'extract-questions') {
					const questions = schemaGuard.parseQuestions(parsed)
					return { success: true, data: questions, extractedText: text, fileInfo }
				}

				const course = schemaGuard.parseCourse(parsed)
				return { success: true, data: course, extractedText: text, fileInfo }
			} catch (e: any) {
				setError(e?.message || 'Processing failed')
				return { success: false, error: e?.message || 'Processing failed', stage: 'ai' }
			} finally {
				setLoading(false)
			}
		},
		[options, schemaGuard, task]
	)

	return {
		loading,
		error,
		process,
	}
}


