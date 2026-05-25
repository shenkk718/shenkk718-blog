import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { NextRequest, NextResponse } from 'next/server'

type PictureItem = {
	id: string
	uploadedAt: string
	description?: string
	image?: string
	images?: string[]
}

type LocalImagePayload = {
	key: string
	filename: string
	content: string
}

type SavePayload = {
	pictures: PictureItem[]
	images?: LocalImagePayload[]
}

const picturesDir = path.join(process.cwd(), 'public', 'images', 'pictures')
const listJsonPath = path.join(process.cwd(), 'src', 'app', 'pictures', 'list.json')

function safeFilename(filename: string) {
	return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '-')
}

function decodeBase64DataUrl(content: string) {
	const base64 = content.includes(',') ? content.split(',').pop() || '' : content
	return Buffer.from(base64, 'base64')
}

async function readPreviousList(): Promise<PictureItem[]> {
	try {
		const raw = await readFile(listJsonPath, 'utf8')
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

function collectImageUrls(pictures: PictureItem[]): Set<string> {
	const urls = new Set<string>()
	for (const picture of pictures) {
		if (picture.image) urls.add(picture.image)
		if (picture.images?.length) picture.images.forEach(url => urls.add(url))
	}
	return urls
}

export async function POST(request: NextRequest) {
	try {
		const payload = (await request.json()) as SavePayload
		const { pictures, images = [] } = payload

		await mkdir(picturesDir, { recursive: true })

		let updatedPictures = [...pictures]

		// 写入新上传的图片文件
		for (const image of images) {
			const filename = safeFilename(image.filename)
			if (!filename) continue

			const publicPath = `/images/pictures/${filename}`
			const filePath = path.join(picturesDir, filename)

			await writeFile(filePath, decodeBase64DataUrl(image.content))

			// 替换 pictures 中对应的 blob URL 为本地路径
			const [groupId, indexStr] = image.key.split('::')
			const imageIndex = Number(indexStr) || 0

			updatedPictures = updatedPictures.map(p => {
				if (p.id !== groupId) return p

				const currentImages = p.images?.length ? p.images : p.image ? [p.image] : []
				const nextImages = currentImages.map((img, idx) => (idx === imageIndex ? publicPath : img))

				return {
					...p,
					image: undefined,
					images: nextImages
				}
			})
		}

		// 删除不再使用的图片文件
		const previousList = await readPreviousList()
		const previousUrls = collectImageUrls(previousList)
		const currentUrls = collectImageUrls(updatedPictures)

		for (const url of previousUrls) {
			if (!currentUrls.has(url) && url.startsWith('/images/pictures/')) {
				const filename = url.replace('/images/pictures/', '')
				const filePath = path.join(picturesDir, filename)
				if (existsSync(filePath)) {
					await rm(filePath, { force: true })
				}
			}
		}

		// 更新 list.json
		const listDir = path.dirname(listJsonPath)
		await mkdir(listDir, { recursive: true })
		await writeFile(listJsonPath, JSON.stringify(updatedPictures, null, '\t') + '\n', 'utf8')

		return NextResponse.json({ message: '保存成功', count: updatedPictures.length })
	} catch (error: any) {
		return NextResponse.json({ message: error?.message || '保存失败' }, { status: 500 })
	}
}
