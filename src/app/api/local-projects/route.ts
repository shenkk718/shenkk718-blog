import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

type ProjectItem = {
	name: string
	url: string
	description?: string
	image?: string
	tags?: string[]
}

type LocalImagePayload = {
	key: string
	filename: string
	content: string
}

type SavePayload = {
	projects: ProjectItem[]
	images?: LocalImagePayload[]
}

const imagesDir = path.join(process.cwd(), 'public', 'images', 'project')
const listJsonPath = path.join(process.cwd(), 'src', 'app', 'projects', 'list.json')

function safeFilename(filename: string) {
	return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '-')
}

function decodeBase64DataUrl(content: string) {
	const base64 = content.includes(',') ? content.split(',').pop() || '' : content
	return Buffer.from(base64, 'base64')
}

export async function POST(request: NextRequest) {
	try {
		const payload = (await request.json()) as SavePayload
		const { projects, images = [] } = payload

		await mkdir(imagesDir, { recursive: true })

		let updatedProjects = [...projects]

		// 写入新上传的图片文件
		for (const image of images) {
			const filename = safeFilename(image.filename)
			if (!filename) continue

			const publicPath = `/images/project/${filename}`
			const filePath = path.join(imagesDir, filename)

			await writeFile(filePath, decodeBase64DataUrl(image.content))

			// 替换 projects 中对应的 image URL
			updatedProjects = updatedProjects.map(p => (p.url === image.key ? { ...p, image: publicPath } : p))
		}

		// 更新 list.json
		const listDir = path.dirname(listJsonPath)
		await mkdir(listDir, { recursive: true })
		await writeFile(listJsonPath, JSON.stringify(updatedProjects, null, '\t') + '\n', 'utf8')

		return NextResponse.json({ message: '保存成功', count: updatedProjects.length })
	} catch (error: any) {
		return NextResponse.json({ message: error?.message || '保存失败' }, { status: 500 })
	}
}
