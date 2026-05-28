'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import initialList from './list.json'
import ThreeDPhotoCarousel from './components/three-d-photo-carousel'
import UploadDialog from './components/upload-dialog'
import MemoryStarCalendar from './components/memory-star-calendar'
import { saveLocalPictures } from './services/save-local-pictures'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import type { ImageItem } from '../projects/components/image-upload-dialog'
import { useRouter } from 'next/navigation'

export interface Picture {
	id: string
	uploadedAt: string
	description?: string
	descriptions?: string[]
	image?: string
	images?: string[]
}

export default function Page() {
	const [pictures, setPictures] = useState<Picture[]>(initialList as Picture[])
	const [originalPictures, setOriginalPictures] = useState<Picture[]>(initialList as Picture[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
	const [imageItems, setImageItems] = useState<Map<string, ImageItem>>(new Map())
	const router = useRouter()

	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUploadSubmit = ({ images, description }: { images: ImageItem[]; description: string }) => {
		const now = new Date().toISOString()

		if (images.length === 0) {
			toast.error('请至少选择一张图片')
			return
		}

		const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
		const desc = description.trim() || undefined

		const imageUrls = images.map(imageItem => (imageItem.type === 'url' ? imageItem.url : imageItem.previewUrl))

		const newPicture: Picture = {
			id,
			uploadedAt: now,
			description: desc,
			images: imageUrls
		}

		const newMap = new Map(imageItems)

		images.forEach((imageItem, index) => {
			if (imageItem.type === 'file') {
				newMap.set(`${id}::${index}`, imageItem)
			}
		})

		setPictures(prev => [...prev, newPicture])
		setImageItems(newMap)
		setIsUploadDialogOpen(false)
	}

	const handleDeleteSingleImage = (pictureId: string, imageIndex: number | 'single') => {
		setPictures(prev => {
			return prev
				.map(picture => {
					if (picture.id !== pictureId) return picture

					// 如果是 single image，删除整个 Picture
					if (imageIndex === 'single') {
						return null
					}

					// 如果是 images 数组中的图片
					if (picture.images && picture.images.length > 0) {
						const newImages = picture.images.filter((_, idx) => idx !== imageIndex)
						// 如果删除后数组为空，删除整个 Picture
						if (newImages.length === 0) {
							return null
						}
						return {
							...picture,
							images: newImages
						}
					}

					return picture
				})
				.filter((p): p is Picture => p !== null)
		})

		// 更新 imageItems Map
		setImageItems(prev => {
			const next = new Map(prev)
			if (imageIndex === 'single') {
				// 删除所有相关的文件项
				for (const key of next.keys()) {
					if (key.startsWith(`${pictureId}::`)) {
						next.delete(key)
					}
				}
			} else {
				// 删除特定索引的文件项
				next.delete(`${pictureId}::${imageIndex}`)

				// 重新索引：删除索引 imageIndex 后，后面的索引需要前移
				// 例如：删除索引 1，原来的索引 2 变成 1，索引 3 变成 2
				const keysToUpdate: Array<{ oldKey: string; newKey: string }> = []
				for (const key of next.keys()) {
					if (key.startsWith(`${pictureId}::`)) {
						const [, indexStr] = key.split('::')
						const oldIndex = Number(indexStr)
						if (!isNaN(oldIndex) && oldIndex > imageIndex) {
							const newIndex = oldIndex - 1
							keysToUpdate.push({
								oldKey: key,
								newKey: `${pictureId}::${newIndex}`
							})
						}
					}
				}

				// 执行重新索引
				for (const { oldKey, newKey } of keysToUpdate) {
					const value = next.get(oldKey)
					if (value) {
						next.set(newKey, value)
						next.delete(oldKey)
					}
				}
			}
			return next
		})
	}

	const handleEditDescription = (pictureId: string, imageIndex: number | 'single', newDescription: string) => {
		setPictures(prev =>
			prev.map(picture => {
				if (picture.id !== pictureId) return picture

				if (imageIndex === 'single') {
					return { ...picture, description: newDescription || undefined }
				}

				const descriptions = [...(picture.descriptions || picture.images?.map(() => picture.description || '') || [])]
				descriptions[imageIndex] = newDescription
				return { ...picture, descriptions }
			})
		)
	}

	const handleDeleteGroup = (picture: Picture) => {
		if (!confirm('确定要删除这一组图片吗？')) return

		setPictures(prev => prev.filter(p => p.id !== picture.id))
		setImageItems(prev => {
			const next = new Map(prev)
			for (const key of next.keys()) {
				if (key.startsWith(`${picture.id}::`)) {
					next.delete(key)
				}
			}
			return next
		})
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await saveLocalPictures({
				pictures,
				imageItems
			})

			setOriginalPictures(pictures)
			setImageItems(new Map())
			setIsEditMode(false)
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setPictures(originalPictures)
		setImageItems(new Map())
		setIsEditMode(false)
	}

	const buttonText = '保存到本地'

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<>
			<main className='min-h-screen bg-[#F5F1E8] px-8 pt-28 pb-20 text-[#233D4D] max-sm:px-4'>
				<section className='mx-auto mb-12 grid max-w-[1440px] grid-cols-[0.95fr_1.05fr] gap-10 border-b border-[#233D4D] pb-10 max-lg:grid-cols-1'>
					<div>
						<p className='mb-5 text-xs font-black tracking-[0.34em] text-[#FE7F2D]'>IMAGE / MEMORY FIELD</p>
						<h1 className='text-[clamp(64px,10vw,156px)] leading-[0.82] font-black tracking-[-0.09em]'>
							PHOTO
							<br />
							ARCHIVE
						</h1>
					</div>
					<div className='flex items-end justify-between gap-8 max-lg:block'>
						<p className='max-w-xl border-l border-[#233D4D] pl-5 text-sm leading-7 font-semibold tracking-[0.04em] text-[#233D4D]/72 max-lg:border-l-0 max-lg:border-t max-lg:pt-5 max-lg:pl-0'>
							A VISUAL INDEX OF DAILY FRAGMENTS, IMAGE SETS AND MEMORY RECORDS. ROTATE, OPEN AND INSPECT EVERY IMAGE AS A DIGITAL OBJECT.
						</p>
						<div className='flex shrink-0 items-center gap-3 max-lg:mt-6'>
							<div className='border border-[#233D4D] px-4 py-3 font-mono text-xs'>
								<span className='text-[#FE7F2D]'>{pictures.length}</span> GROUPS
							</div>
							<button
								onClick={() => router.push('/pictures/gallery')}
								className='border border-[#233D4D] bg-[#F5F1E8] px-4 py-3 text-xs font-black tracking-[0.2em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
								GALLERY
							</button>
						</div>
					</div>
				</section>

				<section className='mx-auto grid max-w-[1440px] grid-cols-[260px_1fr] gap-8 max-lg:grid-cols-1'>
					<MemoryStarCalendar pictures={pictures} />
					<div className='border border-[#233D4D] bg-[#F5F1E8]'>
						<div className='flex items-center justify-between border-b border-[#233D4D] px-5 py-4'>
							<p className='text-xs font-black tracking-[0.28em] text-[#FE7F2D]'>3D PHOTO CAROUSEL</p>
							<p className='font-mono text-xs text-[#233D4D]/64'>CLICK ACTIVE IMAGE TO OPEN LENS VIEW</p>
						</div>
						<ThreeDPhotoCarousel pictures={pictures} isEditMode={isEditMode} onDeleteSingle={handleDeleteSingleImage} onEditDescription={handleEditDescription} />
					</div>
				</section>
			</main>

			{pictures.length === 0 && (
				<div className='fixed inset-0 z-10 flex items-center justify-center bg-[#F5F1E8] text-center text-sm text-[#233D4D]/70'>
					还没有上传图片，点击右上角「编辑」后即可开始上传。
				</div>
			)}

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='fixed top-24 right-8 z-40 flex gap-3 max-sm:hidden'>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push('/image-toolbox')}
							className='border border-[#233D4D] bg-[#F5F1E8] px-5 py-3 text-xs font-black tracking-[0.24em] text-[#233D4D] transition-colors hover:bg-[#FE7F2D]'>
							TOOLBOX
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='border border-[#233D4D] bg-[#F5F1E8] px-5 py-3 text-xs font-black tracking-[0.24em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8] disabled:opacity-60'>
							CANCEL
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsUploadDialogOpen(true)}
							className='border border-[#233D4D] bg-[#F5F1E8] px-5 py-3 text-xs font-black tracking-[0.24em] text-[#233D4D] transition-colors hover:bg-[#FE7F2D]'>
							UPLOAD
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleSave}
							disabled={isSaving}
							className='border border-[#233D4D] bg-[#233D4D] px-5 py-3 text-xs font-black tracking-[0.24em] text-[#F5F1E8] transition-colors hover:bg-[#F5F1E8] hover:text-[#233D4D] disabled:opacity-60'>
							{isSaving ? 'SAVING...' : 'SAVE'}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsEditMode(true)}
							className='border border-[#233D4D] bg-[#F5F1E8] px-5 py-3 text-xs font-black tracking-[0.24em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
							EDIT PHOTOS
						</motion.button>
					)
				)}
			</motion.div>

			{isUploadDialogOpen && <UploadDialog onClose={() => setIsUploadDialogOpen(false)} onSubmit={handleUploadSubmit} />}
		</>
	)
}
