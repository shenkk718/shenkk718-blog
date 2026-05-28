'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { DialogModal } from '@/components/dialog-modal'
import { useConfigStore } from '../stores/config-store'
import { saveLocalSiteContent } from '../services/save-local-site-content'
import { SiteSettings, type FileItem } from './site-settings'

interface ConfigDialogProps {
	open: boolean
	onClose: () => void
}

export default function ConfigDialog({ open, onClose }: ConfigDialogProps) {
	const { siteContent, cardStyles } = useConfigStore()
	const [isSaving, setIsSaving] = useState(false)
	const [faviconItem, setFaviconItem] = useState<FileItem | null>(null)
	const [avatarItem, setAvatarItem] = useState<FileItem | null>(null)

	useEffect(() => {
		if (open) {
			setFaviconItem(null)
			setAvatarItem(null)
		}
	}, [open])

	useEffect(() => {
		return () => {
			if (faviconItem?.type === 'file') {
				URL.revokeObjectURL(faviconItem.previewUrl)
			}
			if (avatarItem?.type === 'file') {
				URL.revokeObjectURL(avatarItem.previewUrl)
			}
		}
	}, [faviconItem, avatarItem])

	const handleSave = async () => {
		setIsSaving(true)
		try {
			await saveLocalSiteContent(siteContent, cardStyles, faviconItem, avatarItem)
			setFaviconItem(null)
			setAvatarItem(null)
			onClose()
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		if (faviconItem?.type === 'file') {
			URL.revokeObjectURL(faviconItem.previewUrl)
		}
		if (avatarItem?.type === 'file') {
			URL.revokeObjectURL(avatarItem.previewUrl)
		}
		setFaviconItem(null)
		setAvatarItem(null)
		onClose()
	}

	return (
		<>
			<DialogModal open={open} onClose={handleCancel} className='w-[480px] overflow-y-auto border border-[#233D4D] bg-[#F5F1E8] p-6 text-[#233D4D] scrollbar-none'>
				<div className='mb-6'>
					<p className='text-[10px] font-black tracking-[0.28em] text-[#FE7F2D]'>SITE CONFIGURATION</p>
					<h2 className='mt-1 text-xl font-black'>设置</h2>
				</div>

				<SiteSettings
					faviconItem={faviconItem}
					setFaviconItem={setFaviconItem}
					avatarItem={avatarItem}
					setAvatarItem={setAvatarItem}
				/>

				<div className='mt-6 flex justify-end gap-2'>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleCancel}
						disabled={isSaving}
						className='border border-[#233D4D] bg-[#F5F1E8] px-4 py-2 text-xs font-black tracking-[0.16em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
						CANCEL
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleSave}
						disabled={isSaving}
						className='border border-[#233D4D] bg-[#233D4D] px-4 py-2 text-xs font-black tracking-[0.16em] text-[#F5F1E8] transition-colors hover:bg-[#F5F1E8] hover:text-[#233D4D]'>
						{isSaving ? 'SAVING...' : 'SAVE'}
					</motion.button>
				</div>
			</DialogModal>
		</>
	)
}
