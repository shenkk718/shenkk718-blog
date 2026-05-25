'use client'

import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface SidePanelProps {
	open: boolean
	onClose: () => void
	children: ReactNode
	className?: string
}

export function SidePanel({ open, onClose, children, className }: SidePanelProps) {
	useEffect(() => {
		if (!open) return

		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		return () => {
			document.body.style.overflow = previous
		}
	}, [open])

	useEffect(() => {
		if (!open) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose()
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [onClose, open])

	if (typeof document === 'undefined') return null

	return createPortal(
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className='fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm'
					/>
					<motion.aside
						initial={{ x: '100%', opacity: 0.85 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: '100%', opacity: 0.85 }}
						transition={{ type: 'spring', stiffness: 180, damping: 26 }}
						className={cn(
							'fixed top-0 right-0 z-50 h-dvh w-[min(460px,90vw)] overflow-y-auto border-l border-white/70 bg-white/75 p-4 shadow-2xl backdrop-blur-2xl',
							className
						)}>
						<button
							type='button'
							onClick={onClose}
							className='sticky top-0 z-10 ml-auto flex size-8 items-center justify-center rounded-full border border-white/70 bg-white/70 text-base shadow-sm transition hover:bg-white'>
							×
						</button>
						{children}
					</motion.aside>
				</>
			)}
		</AnimatePresence>,
		document.body
	)
}
