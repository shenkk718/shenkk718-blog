'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Picture } from '../page'
import PictureViewer from './picture-viewer'

type CarouselImage = {
	url: string
	pictureId: string
	imageIndex: number | 'single'
	description?: string
	uploadedAt?: string
}

interface ThreeDPhotoCarouselProps {
	pictures: Picture[]
	isEditMode?: boolean
	onDeleteSingle?: (pictureId: string, imageIndex: number | 'single') => void
	onEditDescription?: (pictureId: string, imageIndex: number | 'single', newDescription: string) => void
}

const buildImageList = (pictures: Picture[]): CarouselImage[] => {
	const result: CarouselImage[] = []

	for (const picture of pictures) {
		if (picture.image) {
			result.push({
				url: picture.image,
				pictureId: picture.id,
				imageIndex: 'single',
				description: picture.description,
				uploadedAt: picture.uploadedAt
			})
		}

		if (picture.images?.length) {
			result.push(
				...picture.images.map((url, index) => ({
					url,
					pictureId: picture.id,
					imageIndex: index,
					description: picture.descriptions?.[index] ?? picture.description,
					uploadedAt: picture.uploadedAt
				}))
			)
		}
	}

	return result
}

const formatUploadedAt = (uploadedAt?: string) => {
	if (!uploadedAt) return ''
	const date = new Date(uploadedAt)
	if (Number.isNaN(date.getTime())) return uploadedAt

	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export default function ThreeDPhotoCarousel({ pictures, isEditMode = false, onDeleteSingle, onEditDescription }: ThreeDPhotoCarouselProps) {
	const images = useMemo(() => buildImageList(pictures), [pictures])
	const [activeIndex, setActiveIndex] = useState(0)
	const [viewerImage, setViewerImage] = useState<CarouselImage | null>(null)
	const [editingImage, setEditingImage] = useState<CarouselImage | null>(null)
	const [editingText, setEditingText] = useState('')
	const longPressTimerRef = useRef<number | null>(null)
	const rotateTimerRef = useRef<number | null>(null)
	const pointerXRef = useRef<number | null>(null)
	const lastSwipeRotateRef = useRef(0)
	const pointerDownRef = useRef(false)

	if (!images.length) return null

	const activeImage = images[activeIndex]
	const total = images.length

	const getRelativeIndex = (index: number) => {
		let diff = index - activeIndex
		if (diff > total / 2) diff -= total
		if (diff < -total / 2) diff += total
		return diff
	}

	const stopLongPressRotate = () => {
		if (longPressTimerRef.current) {
			window.clearTimeout(longPressTimerRef.current)
			longPressTimerRef.current = null
		}

		if (rotateTimerRef.current) {
			window.clearInterval(rotateTimerRef.current)
			rotateTimerRef.current = null
		}

		pointerXRef.current = null
		pointerDownRef.current = false
	}

	const startLongPressRotate = () => {
		stopLongPressRotate()
		pointerDownRef.current = true
		longPressTimerRef.current = window.setTimeout(() => {
			rotateTimerRef.current = window.setInterval(() => {
				setActiveIndex(index => (index + 1) % total)
			}, 1200)
		}, 260)
	}

	const handlePointerMove = (clientX: number) => {
		if (!pointerDownRef.current) return

		if (pointerXRef.current === null) {
			pointerXRef.current = clientX
			return
		}

		const now = Date.now()
		const deltaX = clientX - pointerXRef.current

		if (Math.abs(deltaX) > 28 && now - lastSwipeRotateRef.current > 80) {
			if (longPressTimerRef.current) {
				window.clearTimeout(longPressTimerRef.current)
				longPressTimerRef.current = null
			}
			setActiveIndex(index => (index + (deltaX < 0 ? 1 : -1) + total) % total)
			pointerXRef.current = clientX
			lastSwipeRotateRef.current = now
		}
	}

	useEffect(() => {
		return () => {
			stopLongPressRotate()
		}
	}, [])

	return (
		<div className='relative flex w-full items-start justify-center overflow-hidden px-6 pt-8 pb-12 max-sm:px-3'>
			<div className='relative z-10 w-full max-w-5xl'>
				{activeImage?.description && (
					<p className='mb-4 text-center text-sm font-semibold text-[#233D4D]/70'>{activeImage.description}</p>
				)}
				<div
					onMouseMove={event => handlePointerMove(event.clientX)}
					onMouseUp={stopLongPressRotate}
					onMouseLeave={stopLongPressRotate}
					onTouchMove={event => {
						const touch = event.touches[0]
						if (touch) handlePointerMove(touch.clientX)
					}}
					onTouchEnd={stopLongPressRotate}
					onTouchCancel={stopLongPressRotate}
					className='relative mx-auto flex h-[420px] touch-pan-y items-center justify-center [perspective:1400px] max-sm:h-[340px]'>
					{images.map((image, index) => {
						const relativeIndex = getRelativeIndex(index)
						const isVisible = Math.abs(relativeIndex) <= 3
						const isActive = relativeIndex === 0

						if (!isVisible) return null

						return (
							<motion.div
								key={`${image.pictureId}-${image.imageIndex}-${image.url}`}
								className='absolute h-[280px] w-[200px] cursor-pointer overflow-hidden border border-[#233D4D] bg-[#F5F1E8] max-sm:h-[240px] max-sm:w-[180px]'
								initial={false}
								animate={{
									x: relativeIndex * 150,
									z: -Math.abs(relativeIndex) * 130,
									rotateY: relativeIndex * -24,
									scale: isActive ? 1 : 0.82,
									opacity: isActive ? 1 : 0.42,
									filter: isActive ? 'blur(0px)' : 'blur(0.6px)'
								}}
								transition={{ type: 'spring', stiffness: 90, damping: 24 }}
								style={{ zIndex: 10 - Math.abs(relativeIndex) }}
								onMouseDown={event => {
									startLongPressRotate()
									pointerXRef.current = event.clientX
								}}
								onTouchStart={event => {
									startLongPressRotate()
									pointerXRef.current = event.touches[0]?.clientX ?? null
								}}
								onClick={() => {
								if (isActive) {
									setViewerImage(image)
								} else {
									setActiveIndex(index)
								}
							}}>
								<img src={image.url} alt={image.description || `picture-${index + 1}`} draggable={false} className='h-full w-full object-cover select-none' />

								<div className='pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#233D4D]/55 to-transparent' />

								{isEditMode && isActive && (
									<div className='absolute top-3 right-3 flex gap-1'>
										<button
											type='button'
											onClick={event => {
												event.stopPropagation()
												setEditingImage(image)
												setEditingText(image.description || '')
											}}
											className='border border-[#233D4D] bg-[#F5F1E8] px-3 py-1 text-xs font-black text-[#233D4D] transition hover:bg-[#FE7F2D]'>
											EDIT
										</button>
										<button
											type='button'
											onClick={event => {
												event.stopPropagation()
												onDeleteSingle?.(image.pictureId, image.imageIndex)
												setActiveIndex(index => Math.max(0, Math.min(index, total - 2)))
											}}
											className='border border-[#233D4D] bg-[#F5F1E8] px-3 py-1 text-xs font-black text-[#233D4D] transition hover:bg-[#FE7F2D]'>
											DEL
										</button>
									</div>
								)}
							</motion.div>
						)
					})}
				</div>

				<div className='mt-4 text-center'>
					<span className='text-xs font-black tracking-[0.2em] text-[#233D4D]/50'>
						{activeIndex + 1} / {total}
					</span>
				</div>
			</div>

			{viewerImage && (
				<PictureViewer
					imageUrl={viewerImage.url}
					description={viewerImage.description}
					uploadedAt={viewerImage.uploadedAt}
					onClose={() => setViewerImage(null)}
				/>
			)}

			<AnimatePresence>
				{editingImage && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-50 flex items-center justify-center bg-[#F5F1E8]/92'
						onClick={() => setEditingImage(null)}>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 16 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 16 }}
							className='w-full max-w-md border border-[#233D4D] bg-[#F5F1E8] p-6'
							onClick={e => e.stopPropagation()}
							onKeyDown={e => e.stopPropagation()}>
							<p className='text-[10px] font-black tracking-[0.28em] text-[#FE7F2D]'>EDIT DESCRIPTION</p>
							<h3 className='mt-1 mb-4 text-lg font-black text-[#233D4D]'>修改描述</h3>
							<textarea
								autoFocus
								value={editingText}
								onChange={e => setEditingText(e.target.value)}
								onKeyDown={e => e.stopPropagation()}
								placeholder='为这张照片添加描述...'
								rows={3}
								className='w-full border border-[#233D4D] bg-[#F5F1E8] px-3 py-2 text-sm text-[#233D4D] focus:outline-none'
							/>
							<div className='mt-4 flex gap-3'>
								<button
									type='button'
									onClick={() => setEditingImage(null)}
									className='flex-1 border border-[#233D4D] bg-[#F5F1E8] px-4 py-3 text-xs font-black tracking-[0.2em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
									CANCEL
								</button>
								<button
									type='button'
									onClick={() => {
										onEditDescription?.(editingImage.pictureId, editingImage.imageIndex, editingText.trim())
										setEditingImage(null)
									}}
									className='flex-1 border border-[#233D4D] bg-[#233D4D] px-4 py-3 text-xs font-black tracking-[0.2em] text-[#F5F1E8] transition-colors hover:bg-[#F5F1E8] hover:text-[#233D4D]'>
									SAVE
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
