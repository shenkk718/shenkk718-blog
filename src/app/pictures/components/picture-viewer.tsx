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
				className='fixed inset-0 z-[100] flex items-center justify-center bg-[#F5F1E8]/92'
				onClick={onClose}>
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					transition={{ type: 'spring', stiffness: 200, damping: 24 }}
					className='relative w-[min(720px,90vw)] overflow-hidden border border-[#233D4D] bg-[#F5F1E8]'
					onClick={e => e.stopPropagation()}>
					<button
						type='button'
						onClick={onClose}
						className='absolute top-3 right-3 z-50 grid size-8 place-items-center border border-[#233D4D] bg-[#F5F1E8] text-[#233D4D] transition hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
						✕
					</button>

					<Lens zoomFactor={2} lensSize={150} isStatic={false} ariaLabel='Zoom into photo'>
						<img src={imageUrl} alt={description || 'photo'} className='h-auto max-h-[60vh] w-full object-contain' />
					</Lens>

					<div className='border-t border-[#233D4D] px-6 pt-4 pb-6 text-[#233D4D]'>
						{uploadedAt && <p className='font-mono text-xs text-[#FE7F2D]'>{formatDate(uploadedAt)}</p>}
						<p className='mt-2 text-sm leading-relaxed text-[#233D4D]/72'>{description || '记录生活中的瞬间'}</p>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}
