'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Lens } from '@/components/lens'

interface PictureViewerProps {
	imageUrl: string
	description?: string
	uploadedAt?: string
	onClose: () => void
}

const formatDate = (uploadedAt?: string) => {
	if (!uploadedAt) return ''
	const date = new Date(uploadedAt)
	if (Number.isNaN(date.getTime())) return uploadedAt
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export default function PictureViewer({ imageUrl, description, uploadedAt, onClose }: PictureViewerProps) {
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm'
				onClick={onClose}>
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					transition={{ type: 'spring', stiffness: 200, damping: 24 }}
					className='relative w-[min(600px,90vw)] overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl'
					onClick={e => e.stopPropagation()}>
					<button
						type='button'
						onClick={onClose}
						className='absolute top-3 right-3 z-50 grid size-8 place-items-center rounded-full bg-black/30 text-white/90 transition hover:bg-black/50'>
						✕
					</button>

					<Lens zoomFactor={2} lensSize={150} isStatic={false} ariaLabel='Zoom into photo'>
						<img src={imageUrl} alt={description || 'photo'} className='h-auto max-h-[60vh] w-full object-contain' />
					</Lens>

					<div className='px-6 pt-4 pb-6'>
						{uploadedAt && <p className='text-xs text-slate-400'>{formatDate(uploadedAt)}</p>}
						<p className='mt-2 text-sm leading-relaxed text-slate-700'>{description || '记录生活中的瞬间'}</p>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}
