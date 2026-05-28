import { fileToBase64NoPrefix } from '@/lib/file-utils'
import { toast } from 'sonner'
import type { SiteContent, CardStyles } from '../stores/config-store'
import type { FileItem } from '../config-dialog/site-settings'

type LocalFilePayload = {
	key: string
	path: string
	content: string
}

export async function saveLocalSiteContent(
	siteContent: SiteContent,
	cardStyles: CardStyles,
	faviconItem?: FileItem | null,
	avatarItem?: FileItem | null
): Promise<void> {
	toast.info('正在准备本地配置...')

	const files: LocalFilePayload[] = []

	if (faviconItem?.type === 'file') {
		files.push({ key: 'favicon', path: '/favicon.png', content: await fileToBase64NoPrefix(faviconItem.file) })
	}

	if (avatarItem?.type === 'file') {
		files.push({ key: 'avatar', path: '/images/avatar.png', content: await fileToBase64NoPrefix(avatarItem.file) })
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
