'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

interface HyperTextProps {
	children: string
	className?: string
	animateOnLoad?: boolean
	duration?: number
}

export function HyperText({ children, className, animateOnLoad = true, duration = 800 }: HyperTextProps) {
	const [displayText, setDisplayText] = useState(children)
	const [isAnimating, setIsAnimating] = useState(false)
	const iterationsRef = useRef(0)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const animate = useCallback(() => {
		if (isAnimating) return
		setIsAnimating(true)
		iterationsRef.current = 0

		intervalRef.current = setInterval(
			() => {
				setDisplayText(prev => {
					const result = children
						.split('')
						.map((char, idx) => {
							if (idx < iterationsRef.current) return children[idx]
							return CHARS[Math.floor(Math.random() * CHARS.length)]
						})
						.join('')
					return result
				})

				iterationsRef.current += 1 / 3

				if (iterationsRef.current >= children.length) {
					if (intervalRef.current) clearInterval(intervalRef.current)
					setDisplayText(children)
					setIsAnimating(false)
				}
			},
			duration / (children.length * 3)
		)
	}, [children, duration, isAnimating])

	useEffect(() => {
		if (animateOnLoad) {
			const timer = setTimeout(animate, 500)
			return () => clearTimeout(timer)
		}
	}, [])

	useEffect(() => {
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
	}, [])

	return (
		<span className={cn('inline-block cursor-default font-mono', className)} onMouseEnter={animate}>
			{displayText}
		</span>
	)
}
