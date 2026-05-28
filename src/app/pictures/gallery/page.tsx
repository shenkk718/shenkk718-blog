'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import initialList from '../list.json'
import type { Picture } from '../page'
import PictureViewer from '../components/picture-viewer'

type FlatImage = {
	url: string
	description?: string
	uploadedAt?: string
	pictureId: string
	imageIndex: number | 'single'
}

function buildFlatImages(pictures: Picture[]): FlatImage[] {
	const result: FlatImage[] = []

	for (const picture of pictures) {
		if (picture.image) {
			result.push({
				url: picture.image,
				description: picture.description,
				uploadedAt: picture.uploadedAt,
				pictureId: picture.id,
				imageIndex: 'single'
			})
		}

		if (picture.images?.length) {
			picture.images.forEach((url, index) => {
				result.push({
					url,
					description: picture.descriptions?.[index] ?? picture.description,
					uploadedAt: picture.uploadedAt,
					pictureId: picture.id,
					imageIndex: index
				})
			})
		}
	}

	return result
}

function formatDate(uploadedAt?: string) {
	if (!uploadedAt) return ''
	const date = new Date(uploadedAt)
	if (Number.isNaN(date.getTime())) return uploadedAt
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export default function GalleryPage() {
	const router = useRouter()
	const pictures = initialList as Picture[]
	const flatImages = useMemo(() => buildFlatImages(pictures), [pictures])
	const [viewerImage, setViewerImage] = useState<FlatImage | null>(null)
	const [filter, setFilter] = useState<'all' | 'with-desc' | 'no-desc'>('all')

	const filteredImages = useMemo(() => {
		if (filter === 'with-desc') return flatImages.filter(img => !!img.description)
		if (filter === 'no-desc') return flatImages.filter(img => !img.description)
		return flatImages
	}, [flatImages, filter])

	return (
		<>
			<main className='min-h-screen bg-[#F5F1E8] px-8 pt-28 pb-20 text-[#233D4D] max-sm:px-4'>
				<section className='mx-auto max-w-[1440px]'>
					<div className='mb-10 border-b border-[#233D4D] pb-8'>
						<p className='mb-3 text-xs font-black tracking-[0.34em] text-[#FE7F2D]'>DETAIL VIEW</p>
						<h1 className='text-[clamp(48px,8vw,120px)] leading-[0.85] font-black tracking-[-0.07em]'>
							GALLERY
						</h1>
						<div className='mt-6 flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4'>
							<p className='text-sm font-semibold text-[#233D4D]/60'>
								<span className='text-[#FE7F2D]'>{filteredImages.length}</span> / {flatImages.length} IMAGES
							</p>
							<div className='flex gap-2'>
								<button
									onClick={() => router.push('/pictures')}
									className='border border-[#233D4D] bg-[#F5F1E8] px-4 py-2 text-xs font-black tracking-[0.16em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
									← BACK
								</button>
								{(['all', 'with-desc', 'no-desc'] as const).map(key => (
									<button
										key={key}
										onClick={() => setFilter(key)}
										className={`border border-[#233D4D] px-4 py-2 text-xs font-black tracking-[0.16em] transition-colors ${
											filter === key
												? 'bg-[#233D4D] text-[#F5F1E8]'
												: 'bg-[#F5F1E8] text-[#233D4D] hover:bg-[#233D4D] hover:text-[#F5F1E8]'
										}`}>
										{key === 'all' ? 'ALL' : key === 'with-desc' ? 'HAS DESC' : 'NO DESC'}
									</button>
								))}
							</div>
						</div>
					</div>

					<div className='columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4'>
						<AnimatePresence>
							{filteredImages.map((image, index) => (
								<motion.article
									key={`${image.pictureId}-${image.imageIndex}`}
									layout
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ delay: index * 0.03, duration: 0.3 }}
									className='mb-5 break-inside-avoid border border-[#233D4D] bg-[#F5F1E8]'>
									<div
										className='group cursor-pointer overflow-hidden'
										onClick={() => setViewerImage(image)}>
										<img
											src={image.url}
											alt={image.description || `photo-${index + 1}`}
											className='w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
											loading='lazy'
										/>
									</div>
									<div className='border-t border-[#233D4D] px-4 py-3'>
										{image.description ? (
											<p className='text-sm leading-relaxed text-[#233D4D]'>{image.description}</p>
										) : (
											<p className='text-xs italic text-[#233D4D]/40'>无描述</p>
										)}
										{image.uploadedAt && (
											<p className='mt-2 text-[10px] font-black tracking-[0.2em] text-[#FE7F2D]'>
												{formatDate(image.uploadedAt)}
											</p>
										)}
									</div>
								</motion.article>
							))}
						</AnimatePresence>
					</div>

					{filteredImages.length === 0 && (
						<div className='py-20 text-center text-sm text-[#233D4D]/50'>
							没有匹配的图片
						</div>
					)}
				</section>
			</main>

			{viewerImage && (
				<PictureViewer
					imageUrl={viewerImage.url}
					description={viewerImage.description}
					uploadedAt={viewerImage.uploadedAt}
					onClose={() => setViewerImage(null)}
				/>
			)}
		</>
	)
}
