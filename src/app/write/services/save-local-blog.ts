import type { ImageItem } from '../types'
import { formatDateTimeLocal } from '../stores/write-store'

export type SaveLocalBlogParams = {
	form: {
		slug: string
		title: string
		md: string
		tags: string[]
		date?: string
		summary?: string
		hidden?: boolean
		category?: string
	}
	cover?: ImageItem | null
	images?: ImageItem[]
	mode?: 'create' | 'edit'
	originalSlug?: string | null
}

async function fileToDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result || ''))
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(file)
	})
}

async function serializeImage(image: ImageItem) {
	if (image.type === 'url') {
		return image
	}

	return {
		id: image.id,
		type: image.type,
		filename: image.hash ? `${image.hash}${image.filename.includes('.') ? `.${image.filename.split('.').pop()}` : ''}` : image.filename,
		content: await fileToDataUrl(image.file)
	}
}

export async function saveLocalBlog(params: SaveLocalBlogParams): Promise<void> {
	const { form, cover, images, mode = 'create', originalSlug } = params

	if (!form?.slug) throw new Error('需要 slug')
	if (!form?.title) throw new Error('需要标题')

	const serializedImages = await Promise.all((images || []).map(serializeImage))
	const serializedCover = cover ? await serializeImage(cover) : null

	const response = await fetch('/api/local-blog', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			form: {
				...form,
				date: form.date || formatDateTimeLocal()
			},
			cover: serializedCover,
			images: serializedImages,
			mode,
			originalSlug
		})
	})

	const result = await response.json().catch(() => null)

	if (!response.ok) {
		throw new Error(result?.message || '保存到本地失败')
	}
}
