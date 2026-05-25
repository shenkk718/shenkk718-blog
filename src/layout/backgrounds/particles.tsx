'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['#0e7490', '#1d4ed8', '#7c3aed', '#0f766e', '#4338ca', '#9333ea', '#1e40af', '#0d9488']

type Particle = {
	x: number
	y: number
	vx: number
	vy: number
	radius: number
	alpha: number
	color: string
	homeX: number
	homeY: number
	wanderSeed: number
}

type ParticlesBackgroundProps = {
	quantity?: number
	ease?: number
}

export default function ParticlesBackground({ quantity = 90, ease = 80 }: ParticlesBackgroundProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationRef = useRef<number>(0)
	const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 })
	const smoothMouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 })

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let width = 0
		let height = 0
		let particles: Particle[] = []
		let lastHomeRefresh = 0
		const dpr = Math.min(window.devicePixelRatio || 1, 2)
		const mouseInfluenceRadius = 260
		const mouseForce = 0.0018
		const homeForce = 0.0009
		const maxSpeed = 0.85

		const resize = () => {
			width = canvas.clientWidth
			height = canvas.clientHeight
			canvas.width = Math.floor(width * dpr)
			canvas.height = Math.floor(height * dpr)
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
		}

		const createParticles = () => {
			particles = Array.from({ length: quantity }, () => {
				const x = Math.random() * width
				const y = Math.random() * height

				return {
					x,
					y,
					vx: (Math.random() - 0.5) * (ease / 900),
					vy: (Math.random() - 0.5) * (ease / 900),
					radius: Math.random() * 2.2 + 0.8,
					alpha: Math.random() * 0.5 + 0.35,
					color: COLORS[Math.floor(Math.random() * COLORS.length)],
					homeX: x,
					homeY: y,
					wanderSeed: Math.random() * Math.PI * 2
				}
			})
		}

		const draw = () => {
			const now = Date.now()
			ctx.clearRect(0, 0, width, height)
			smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.06
			smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.06
			const mx = smoothMouseRef.current.x
			const my = smoothMouseRef.current.y
			const mouseActive = mx > -1000 && my > -1000

			if (!mouseActive && now - lastHomeRefresh > 7000) {
				lastHomeRefresh = now
				for (const particle of particles) {
					particle.homeX = Math.random() * width
					particle.homeY = Math.random() * height
				}
			}

			for (const particle of particles) {
				const dx = mx - particle.x
				const dy = my - particle.y
				const dist = Math.sqrt(dx * dx + dy * dy)

				if (dist < mouseInfluenceRadius && dist > 0) {
					const force = (1 - dist / mouseInfluenceRadius) * mouseForce
					particle.vx += (dx / dist) * force * ease
					particle.vy += (dy / dist) * force * ease
				} else {
					const homeDx = particle.homeX - particle.x
					const homeDy = particle.homeY - particle.y
					particle.vx += homeDx * homeForce
					particle.vy += homeDy * homeForce
					particle.vx += Math.cos(now * 0.00025 + particle.wanderSeed) * 0.002
					particle.vy += Math.sin(now * 0.00025 + particle.wanderSeed) * 0.002
				}

				const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
				if (speed > maxSpeed) {
					particle.vx = (particle.vx / speed) * maxSpeed
					particle.vy = (particle.vy / speed) * maxSpeed
				}

				particle.vx *= 0.94
				particle.vy *= 0.94
				particle.x += particle.vx
				particle.y += particle.vy

				if (particle.x < -10) particle.x = width + 10
				if (particle.x > width + 10) particle.x = -10
				if (particle.y < -10) particle.y = height + 10
				if (particle.y > height + 10) particle.y = -10

				ctx.globalAlpha = particle.alpha
				ctx.beginPath()
				ctx.fillStyle = particle.color
				ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
				ctx.fill()
			}

			ctx.globalAlpha = 1
			animationRef.current = requestAnimationFrame(draw)
		}

		const handleMouseMove = (e: MouseEvent) => {
			mouseRef.current = { x: e.clientX, y: e.clientY }
		}

		const handleMouseLeave = () => {
			mouseRef.current = { x: -9999, y: -9999 }
		}

		resize()
		createParticles()
		draw()

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseleave', handleMouseLeave)

		const resizeObserver = new ResizeObserver(() => {
			resize()
			createParticles()
		})
		resizeObserver.observe(canvas)

		return () => {
			cancelAnimationFrame(animationRef.current)
			resizeObserver.disconnect()
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseleave', handleMouseLeave)
		}
	}, [quantity, ease])

	return <canvas ref={canvasRef} className='pointer-events-none fixed inset-0 z-[1] h-full w-full' />
}
