import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import type { CardStyles, SiteContent } from '@/app/(home)/stores/config-store'

type LocalFilePayload = {
	key: string
	path: string
	content: string
}

type SavePayload = {
	siteContent: SiteContent
	cardStyles: CardStyles
	files?: LocalFilePayload[]
}

const siteContentPath = path.join(process.cwd(), 'src', 'config', 'site-content.json')
const cardStylesPath = path.join(process.cwd(), 'src', 'config', 'card-styles.json')
const publicDir = path.join(process.cwd(), 'public')

function decodeBase64(content: string) {
	const base64 = content.includes(',') ? content.split(',').pop() || '' : content
	return Buffer.from(base64, 'base64')
}

function safePublicPath(publicPath: string) {
	const normalized = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
	const targetPath = path.normalize(path.join(publicDir, normalized))

	if (!targetPath.startsWith(publicDir)) {
		throw new Error('非法文件路径')
	}

	return targetPath
}

export async function POST(request: NextRequest) {
	try {
		const payload = (await request.json()) as SavePayload
		const { siteContent, cardStyles, files = [] } = payload

		if (!siteContent || !cardStyles) {
			return NextResponse.json({ message: '缺少配置数据' }, { status: 400 })
		}

		for (const file of files) {
			const targetPath = safePublicPath(file.path)
			await mkdir(path.dirname(targetPath), { recursive: true })
			await writeFile(targetPath, decodeBase64(file.content))
		}

		await mkdir(path.dirname(siteContentPath), { recursive: true })
		await writeFile(siteContentPath, JSON.stringify(siteContent, null, '\t') + '\n', 'utf8')
		await writeFile(cardStylesPath, JSON.stringify(cardStyles, null, '\t') + '\n', 'utf8')

		return NextResponse.json({ message: '保存成功' })
	} catch (error: any) {
		return NextResponse.json({ message: error?.message || '保存失败' }, { status: 500 })
	}
}
