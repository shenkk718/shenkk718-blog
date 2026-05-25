'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
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
					description: picture.description,
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

export default function ThreeDPhotoCarousel({ pictures, isEditMode = false, onDeleteSingle }: ThreeDPhotoCarouselProps) {
	const images = useMemo(() => buildImageList(pictures), [pictures])
	const [activeIndex, setActiveIndex] = useState(0)
	const [viewerImage, setViewerImage] = useState<CarouselImage | null>(null)
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
		<div className='relative flex w-full items-start justify-center overflow-hidden px-6 pt-4 pb-12 pl-[270px] max-sm:px-3'>
			<div className='pointer-events-none absolute inset-x-0 top-6 z-0 mx-auto h-[400px] max-w-4xl rounded-full bg-cyan-200/20 blur-3xl' />

			<div className='relative z-10 w-full max-w-5xl'>
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
								className='absolute h-[280px] w-[200px] cursor-pointer overflow-hidden rounded-[22px] border border-white/70 bg-white/50 shadow-2xl backdrop-blur-md max-sm:h-[240px] max-sm:w-[180px]'
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

								<div className='pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/45 to-transparent' />

								{isEditMode && isActive && (
									<button
										type='button'
										onClick={event => {
											event.stopPropagation()
											onDeleteSingle?.(image.pictureId, image.imageIndex)
											setActiveIndex(index => Math.max(0, Math.min(index, total - 2)))
										}}
										className='absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1 text-xs text-white shadow-lg transition hover:bg-red-600'>
										删除
									</button>
								)}
							</motion.div>
						)
					})}
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
		</div>
	)
}
