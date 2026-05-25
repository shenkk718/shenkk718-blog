import { fileToBase64NoPrefix } from '@/lib/file-utils'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'
import type { SiteContent, CardStyles } from '../stores/config-store'
import type { ArtImageUploads, BackgroundImageUploads, FileItem, SocialButtonImageUploads } from '../config-dialog/site-settings'

type LocalFilePayload = {
	key: string
	path: string
	content: string
}

async function toPayload(key: string, publicPath: string, item: FileItem): Promise<LocalFilePayload | null> {
	if (item.type !== 'file') return null
	return {
		key,
		path: publicPath,
		content: await fileToBase64NoPrefix(item.file)
	}
}

export async function saveLocalSiteContent(
	siteContent: SiteContent,
	cardStyles: CardStyles,
	faviconItem?: FileItem | null,
	avatarItem?: FileItem | null,
	artImageUploads?: ArtImageUploads,
	backgroundImageUploads?: BackgroundImageUploads,
	socialButtonImageUploads?: SocialButtonImageUploads
): Promise<void> {
	toast.info('正在准备本地配置...')

	const files: LocalFilePayload[] = []

	if (faviconItem?.type === 'file') {
		files.push({ key: 'favicon', path: '/favicon.png', content: await fileToBase64NoPrefix(faviconItem.file) })
	}

	if (avatarItem?.type === 'file') {
		files.push({ key: 'avatar', path: '/images/avatar.png', content: await fileToBase64NoPrefix(avatarItem.file) })
	}

	if (artImageUploads) {
		for (const [id, item] of Object.entries(artImageUploads)) {
			const art = siteContent.artImages?.find(image => image.id === id)
			if (!art || !art.url.startsWith('/images/art/')) continue
			const payload = await toPayload(id, art.url, item)
			if (payload) files.push(payload)
		}
	}

	if (backgroundImageUploads) {
		for (const [id, item] of Object.entries(backgroundImageUploads)) {
			const background = siteContent.backgroundImages?.find(image => image.id === id)
			if (!background || !background.url.startsWith('/images/background/')) continue
			const payload = await toPayload(id, background.url, item)
			if (payload) files.push(payload)
		}
	}

	if (socialButtonImageUploads) {
		for (const [id, item] of Object.entries(socialButtonImageUploads)) {
			const button = siteContent.socialButtons?.find(button => button.id === id)
			if (!button || !button.value.startsWith('/images/social-buttons/')) continue
			const ext = item.type === 'file' ? getFileExt(item.file.name) : ''
			const path = button.value.includes('.') ? button.value : `/images/social-buttons/${id}${ext || '.png'}`
			const payload = await toPayload(id, path, item)
			if (payload) files.push(payload)
		}
	}

	toast.info('正在保存到本地...')

	const res = await fetch('/api/local-config', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ siteContent, cardStyles, files })
	})

	if (!res.ok) {
		const data = await res.json().catch(() => ({}))
		throw new Error(data.message || `保存失败 (${res.status})`)
	}

	toast.success('保存成功！')
}
