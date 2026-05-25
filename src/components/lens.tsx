'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface LensProps {
	children: React.ReactNode
	zoomFactor?: number
	lensSize?: number
	isStatic?: boolean
	staticPosition?: { x: number; y: number }
	ariaLabel?: string
}

export function Lens({ children, zoomFactor = 1.5, lensSize = 150, isStatic = false, staticPosition, ariaLabel = 'Zoom Area' }: LensProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [isHovering, setIsHovering] = useState(false)
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (isStatic) return
		const rect = containerRef.current?.getBoundingClientRect()
		if (!rect) return
		const x = e.clientX - rect.left
		const y = e.clientY - rect.top
		setMousePosition({ x, y })
	}

	const currentPosition = isStatic && staticPosition ? staticPosition : mousePosition

	return (
		<div
			ref={containerRef}
			className='relative overflow-hidden rounded-xl'
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			onMouseMove={handleMouseMove}
			aria-label={ariaLabel}>
			{children}
			<AnimatePresence>
				{isHovering && (
					<motion.div
						initial={{ opacity: 0, scale: 0.58 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.58 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className='pointer-events-none absolute z-50 overflow-hidden rounded-full border-2 border-white/60 shadow-xl'
						style={{
							width: lensSize,
							height: lensSize,
							top: currentPosition.y - lensSize / 2,
							left: currentPosition.x - lensSize / 2
						}}>
						<div
							className='absolute'
							style={{
								width: containerRef.current?.offsetWidth ?? 0,
								height: containerRef.current?.offsetHeight ?? 0,
								transform: `scale(${zoomFactor})`,
								transformOrigin: `${currentPosition.x}px ${currentPosition.y}px`,
								top: -(currentPosition.y - lensSize / 2),
								left: -(currentPosition.x - lensSize / 2)
							}}>
							{children}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
