'use client'

import type { FileItem } from './types'
import { FaviconAvatarUpload } from './favicon-avatar-upload'

export type { FileItem } from './types'

interface SiteSettingsProps {
	faviconItem: FileItem | null
	setFaviconItem: React.Dispatch<React.SetStateAction<FileItem | null>>
	avatarItem: FileItem | null
	setAvatarItem: React.Dispatch<React.SetStateAction<FileItem | null>>
}

export function SiteSettings({
	faviconItem,
	setFaviconItem,
	avatarItem,
	setAvatarItem
}: SiteSettingsProps) {
	return (
		<div className='space-y-6'>
			<FaviconAvatarUpload faviconItem={faviconItem} setFaviconItem={setFaviconItem} avatarItem={avatarItem} setAvatarItem={setAvatarItem} />
		</div>
	)
}
