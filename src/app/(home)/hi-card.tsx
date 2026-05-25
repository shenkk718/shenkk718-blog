'use client'

import { useCenterStore } from '@/hooks/use-center'
import Card from '@/components/card'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'
import { HyperText } from '@/components/hyper-text'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { SidePanel } from '@/components/side-panel'

function getGreeting() {
	const hour = new Date().getHours()

	if (hour >= 6 && hour < 12) {
		return 'Good Morning'
	} else if (hour >= 12 && hour < 18) {
		return 'Good Afternoon'
	} else if (hour >= 18 && hour < 22) {
		return 'Good Evening'
	} else {
		return 'Good Night'
	}
}

function ChromeIcon() {
	return (
		<svg viewBox='0 0 48 48' className='h-full w-full'>
			<path fill='#EA4335' d='M24 4a20 20 0 0 1 17.32 10H24a10 10 0 0 0-8.66 5L6.68 9A19.94 19.94 0 0 1 24 4Z' />
			<path fill='#FBBC05' d='M41.32 14A20 20 0 0 1 24 44l8.66-15A10 10 0 0 0 24 14h17.32Z' />
			<path fill='#34A853' d='M24 44A20 20 0 0 1 6.68 9l8.66 15A10 10 0 0 0 24 34h8.66L24 44Z' />
			<circle cx='24' cy='24' r='8' fill='#4285F4' />
			<circle cx='24' cy='24' r='4.6' fill='#EAF2FF' />
		</svg>
	)
}

function GptIcon() {
	return (
		<svg viewBox='0 0 48 48' className='h-full w-full'>
			<circle cx='24' cy='24' r='22' fill='#111827' />
			<path
				fill='none'
				stroke='white'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2.4'
				d='M24 10.5c3 0 5.4 1.7 6.6 4.2 2.9.3 5.4 2.4 6.2 5.3.8 2.8-.1 5.8-2.4 7.7.3 3-1.2 5.9-3.9 7.4-2.6 1.5-5.8 1.2-8.1-.7-2.8 1.2-6 .4-8-1.9-2-2.2-2.5-5.5-1.2-8.1-1.9-2.3-2.1-5.6-.6-8.1 1.5-2.7 4.4-4.1 7.4-3.8 1.3-1.3 3-2 5-2Z'
			/>
			<path fill='none' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.4' d='M17 19.5 24 15l7 4.5v9L24 33l-7-4.5v-9Z' />
		</svg>
	)
}

const DEFAULT_INTRO = ['Life Recorder', 'Blog Creator', 'Digital Nomad', 'Nice to meet you!']

function IntroEditPanel({ onClose }: { onClose: () => void }) {
	const { siteContent, setSiteContent, cardStyles } = useConfigStore()
	const [username, setUsername] = useState(siteContent.meta.username || '')
	const [lines, setLines] = useState<string[]>(() => {
		const saved = (siteContent as any).introLines
		return Array.isArray(saved) && saved.length > 0 ? [...saved] : [...DEFAULT_INTRO]
	})
	const [saving, setSaving] = useState(false)

	const updateLine = (i: number, val: string) => {
		const next = [...lines]
		next[i] = val
		setLines(next)
	}

	const addLine = () => setLines([...lines, ''])
	const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i))

	const handleSave = async () => {
		setSaving(true)
		try {
			const updated = {
				...siteContent,
				meta: { ...siteContent.meta, username },
				introLines: lines.filter(l => l.trim())
			}
			const res = await fetch('/api/local-config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ siteContent: updated, cardStyles, files: [] })
			})
			if (!res.ok) throw new Error('保存失败')
			setSiteContent(updated as any)
			toast.success('简介已保存')
			onClose()
		} catch {
			toast.error('保存失败')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className='relative flex flex-col overflow-hidden pt-0'>
			<div className='pointer-events-none absolute top-8 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[#c8944a]/15 blur-3xl' />
			<div className='pointer-events-none absolute right-4 bottom-4 h-32 w-32 rounded-full bg-[#87CEFA]/20 blur-3xl' />

			<h2 className='mb-3 text-base font-semibold text-slate-800'>编辑简介</h2>

			<label className='mb-1 block text-[11px] font-medium text-slate-500'>用户名</label>
			<input
				value={username}
				onChange={e => setUsername(e.target.value)}
				className='mb-3 w-full rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-slate-800 shadow-sm backdrop-blur-sm transition outline-none focus:border-[#c8944a]/50 focus:ring-2 focus:ring-[#c8944a]/20'
			/>

			<label className='mb-1 block text-[11px] font-medium text-slate-500'>简介行</label>
			<div className='space-y-1.5'>
				{lines.map((line, i) => (
					<div key={i} className='flex items-center gap-1.5'>
						<input
							value={line}
							onChange={e => updateLine(i, e.target.value)}
							className='flex-1 rounded-xl border border-white/70 bg-white/70 px-3 py-1.5 text-xs text-slate-800 shadow-sm backdrop-blur-sm transition outline-none focus:border-[#c8944a]/50 focus:ring-2 focus:ring-[#c8944a]/20'
						/>
						{lines.length > 1 && (
							<button
								onClick={() => removeLine(i)}
								className='flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-400'>
								×
							</button>
						)}
					</div>
				))}
			</div>
			<button onClick={addLine} className='mt-1.5 self-start text-[11px] font-medium text-[#c8944a] transition hover:underline'>
				+ 添加一行
			</button>

			<div className='mt-3 flex justify-end gap-2'>
				<button
					onClick={onClose}
					className='rounded-xl border border-white/70 bg-white/70 px-4 py-1.5 text-xs text-slate-600 shadow-sm transition hover:bg-white'>
					取消
				</button>
				<button
					onClick={handleSave}
					disabled={saving}
					className='rounded-xl bg-[#c8944a] px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#b5833e] disabled:opacity-50'>
					{saving ? '保存中...' : '保存'}
				</button>
			</div>
		</div>
	)
}

export default function HiCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const greeting = getGreeting()
	const styles = cardStyles.hiCard
	const username = siteContent.meta.username || 'Suni'
	const introLines: string[] = (siteContent as any).introLines ?? DEFAULT_INTRO
	const [editOpen, setEditOpen] = useState(false)

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - styles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - styles.height / 2 + 40

	return (
		<HomeDraggableLayer cardKey='hiCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card
				order={styles.order}
				width={styles.width}
				height={styles.height}
				x={x}
				y={y}
				className='relative overflow-visible text-center max-sm:static max-sm:translate-0'>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-1.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 180, left: -20, top: -25, opacity: 0.9 }}
						/>
						<img
							src='/images/christmas/snow-2.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 160, bottom: -12, right: -8, opacity: 0.9 }}
						/>
					</>
				)}
				<div className='pointer-events-none absolute top-1/2 left-1/2 z-0 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-slate-400/70' />
				<div className='hi-orbit pointer-events-none absolute top-1/2 left-1/2 z-0 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2'>
					<Link
						href='/live2d'
						className='hi-orbit-item hi-orbit-avatar pointer-events-auto absolute top-1/2 left-1/2 block h-20 w-20 overflow-hidden rounded-full shadow-xl'>
						<img src='/images/avatar.png' alt='avatar' className='h-full w-full object-cover' />
					</Link>
					<div className='hi-orbit-item hi-orbit-icon hi-orbit-chrome absolute top-1/2 left-1/2 h-10 w-10'>
						<ChromeIcon />
					</div>
					<div className='hi-orbit-item hi-orbit-icon hi-orbit-gpt absolute top-1/2 left-1/2 h-10 w-10'>
						<GptIcon />
					</div>
				</div>

				<div className='pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-white/45 backdrop-blur-md' />
				<div
					className='relative z-20 flex h-full cursor-pointer flex-col justify-center px-8 py-6 transition-opacity hover:opacity-80'
					onClick={() => setEditOpen(true)}>
					<p className='mb-3 text-left text-sm font-semibold text-slate-700'>My name is:</p>
					<h1 className='text-left text-[34px] leading-tight font-black tracking-wide'>
						<HyperText className='text-[#c8944a]'>{username}</HyperText>
					</h1>
					<div className='my-4 h-px w-full bg-slate-800/70' />
					<p className='mb-2 text-left text-sm font-semibold text-slate-700'>I'm:</p>
					<div className='space-y-1 text-right text-sm leading-relaxed text-slate-800'>
						<p>{greeting}</p>
						{introLines.map((line, i) => (
							<p key={i}>{line}</p>
						))}
					</div>
				</div>
			</Card>

			<SidePanel open={editOpen} onClose={() => setEditOpen(false)} className='!h-[430px] w-[min(320px,85vw)] overflow-hidden rounded-bl-2xl !p-4'>
				<IntroEditPanel onClose={() => setEditOpen(false)} />
			</SidePanel>
		</HomeDraggableLayer>
	)
}
