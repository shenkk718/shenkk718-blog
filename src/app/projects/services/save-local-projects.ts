import { fileToBase64NoPrefix, hashFileSHA256 } from '@/lib/file-utils'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'
import type { Project } from '../components/project-card'
import type { ImageItem } from '../components/image-upload-dialog'

export type SaveLocalProjectsParams = {
	projects: Project[]
	imageItems?: Map<string, ImageItem>
}

export async function saveLocalProjects(params: SaveLocalProjectsParams): Promise<void> {
	const { projects, imageItems } = params

	toast.info('正在准备文件...')

	type LocalImagePayload = {
		key: string
		filename: string
		content: string
	}

	const imagePayloads: LocalImagePayload[] = []
	const uploadedHashes = new Set<string>()

	if (imageItems && imageItems.size > 0) {
		for (const [key, imageItem] of imageItems.entries()) {
			if (imageItem.type === 'file') {
				const hash = imageItem.hash || (await hashFileSHA256(imageItem.file))
				const ext = getFileExt(imageItem.file.name)
				const filename = `${hash}${ext}`

				if (!uploadedHashes.has(hash)) {
					const content = await fileToBase64NoPrefix(imageItem.file)
					imagePayloads.push({ key, filename, content })
					uploadedHashes.add(hash)
				}
			}
		}
	}

	toast.info('正在保存到本地...')

	const res = await fetch('/api/local-projects', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ projects, images: imagePayloads })
	})

	if (!res.ok) {
		const data = await res.json().catch(() => ({}))
		throw new Error(data.message || `保存失败 (${res.status})`)
	}

	toast.success('保存成功！')
}
