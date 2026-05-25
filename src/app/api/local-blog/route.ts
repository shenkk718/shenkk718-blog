import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

type LocalBlogPayload = {
	form?: {
		slug?: string
		title?: string
		md?: string
		tags?: string[]
		date?: string
		summary?: string
		hidden?: boolean
		category?: string
	}
	cover?: LocalImagePayload | null
	images?: LocalImagePayload[]
	mode?: 'create' | 'edit'
	originalSlug?: string | null
}

type LocalImagePayload = { id: string; type: 'url'; url: string } | { id: string; type: 'file'; filename: string; content: string }

type BlogIndexItem = {
	slug: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	hidden?: boolean
	category?: string
}

const blogsRoot = path.join(process.cwd(), 'public', 'blogs')
const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/

function safeFilename(filename: string) {
	return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '-')
}

function decodeBase64DataUrl(content: string) {
	const base64 = content.includes(',') ? content.split(',').pop() || '' : content
	return Buffer.from(base64, 'base64')
}

async function readBlogIndex() {
	try {
		const raw = await readFile(path.join(blogsRoot, 'index.json'), 'utf8')
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? (parsed as BlogIndexItem[]) : []
	} catch {
		return []
	}
}

export async function POST(request: NextRequest) {
	try {
		const payload = (await request.json()) as LocalBlogPayload
		const { form, cover, images = [], mode = 'create', originalSlug } = payload

		if (!form?.slug) {
			return NextResponse.json({ message: 'Slug is required' }, { status: 400 })
		}

		if (!slugPattern.test(form.slug)) {
			return NextResponse.json({ message: 'Slug can only contain letters, numbers, hyphens, and underscores' }, { status: 400 })
		}

		if (!form.title?.trim()) {
			return NextResponse.json({ message: 'Title is required' }, { status: 400 })
		}

		if (mode === 'edit' && originalSlug && originalSlug !== form.slug) {
			return NextResponse.json({ message: 'Changing slug in edit mode is not supported' }, { status: 400 })
		}

		await mkdir(blogsRoot, { recursive: true })

		const blogDir = path.join(blogsRoot, form.slug)
		await mkdir(blogDir, { recursive: true })

		let markdown = form.md || ''
		let coverPath: string | undefined
		const writtenFiles = new Set<string>()

		const localImages = images.filter((image): image is Extract<LocalImagePayload, { type: 'file' }> => image.type === 'file')
		if (cover?.type === 'file' && !localImages.some(image => image.id === cover.id)) {
			localImages.push(cover)
		}

		for (const image of localImages) {
			const filename = safeFilename(image.filename)
			if (!filename) continue
			const publicPath = `/blogs/${form.slug}/${filename}`

			if (!writtenFiles.has(filename)) {
				await writeFile(path.join(blogDir, filename), decodeBase64DataUrl(image.content))
				writtenFiles.add(filename)
			}

			markdown = markdown.split(`(local-image:${image.id})`).join(`(${publicPath})`)

			if (cover?.type === 'file' && cover.id === image.id) {
				coverPath = publicPath
			}
		}

		if (cover?.type === 'url') {
			coverPath = cover.url
		}

		const date = form.date || new Date().toISOString()
		const config = {
			title: form.title,
			tags: form.tags || [],
			date,
			summary: form.summary || '',
			cover: coverPath,
			hidden: form.hidden || false,
			category: form.category || ''
		}

		await writeFile(path.join(blogDir, 'index.md'), markdown, 'utf8')
		await writeFile(path.join(blogDir, 'config.json'), `${JSON.stringify(config, null, 2)}\n`, 'utf8')

		const index = await readBlogIndex()
		const nextItem: BlogIndexItem = {
			slug: form.slug,
			title: form.title,
			tags: form.tags || [],
			date,
			summary: form.summary || '',
			cover: coverPath,
			hidden: form.hidden || false,
			category: form.category || ''
		}
		const nextIndex = [nextItem, ...index.filter(item => item.slug !== form.slug)]
		await writeFile(path.join(blogsRoot, 'index.json'), `${JSON.stringify(nextIndex, null, 2)}\n`, 'utf8')

		return NextResponse.json({ message: mode === 'edit' ? 'Saved local update' : 'Saved local blog', slug: form.slug })
	} catch (error: any) {
		return NextResponse.json({ message: error?.message || 'Failed to save local blog' }, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const slug = request.nextUrl.searchParams.get('slug')

		if (!slug) {
			return NextResponse.json({ message: 'Slug is required' }, { status: 400 })
		}

		if (!slugPattern.test(slug)) {
			return NextResponse.json({ message: 'Invalid slug' }, { status: 400 })
		}

		await rm(path.join(blogsRoot, slug), { recursive: true, force: true })

		const index = await readBlogIndex()
		const nextIndex = index.filter(item => item.slug !== slug)
		await mkdir(blogsRoot, { recursive: true })
		await writeFile(path.join(blogsRoot, 'index.json'), `${JSON.stringify(nextIndex, null, 2)}\n`, 'utf8')

		return NextResponse.json({ message: 'Deleted local blog', slug })
	} catch (error: any) {
		return NextResponse.json({ message: error?.message || 'Failed to delete local blog' }, { status: 500 })
	}
}
