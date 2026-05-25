'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import initialNotes from './list.json'

type NoteItem = {
	id: string
	content: string
	createdAt: string
}

interface NotesContentProps {
	compact?: boolean
	className?: string
}

function formatDate(value: string) {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value

	return date.toLocaleString('zh-CN', {
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	})
}

function NoteCard({ note, onDelete, compact = false }: { note: NoteItem; onDelete: (id: string) => void; compact?: boolean }) {
	return (
		<figure
			className={cn(
				'group relative h-full shrink-0 cursor-pointer overflow-hidden border border-white/65 bg-white/55 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/75',
				compact ? 'w-52 rounded-2xl p-3' : 'w-64 rounded-3xl p-4'
			)}>
			<div className={cn('flex items-center justify-between', compact ? 'mb-2 gap-2' : 'mb-3 gap-3')}>
				<div className='flex items-center gap-2'>
					<div className={cn('bg-brand/15 text-brand flex items-center justify-center rounded-full font-semibold', compact ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm')}>记</div>
					<div className='flex flex-col'>
						<figcaption className={cn('font-medium text-slate-800', compact ? 'text-xs' : 'text-sm')}>随笔</figcaption>
						<p className='text-secondary text-xs'>{formatDate(note.createdAt)}</p>
					</div>
				</div>
				<button
					type='button'
					onClick={() => onDelete(note.id)}
					className='text-secondary text-xs opacity-0 transition group-hover:opacity-100 hover:text-red-500 max-sm:opacity-100'>
					删除
				</button>
			</div>
			<blockquote className={cn('line-clamp-4 leading-relaxed whitespace-pre-wrap text-slate-700', compact ? 'text-xs' : 'text-sm')}>{note.content}</blockquote>
		</figure>
	)
}

function NotesMarqueeRow({ notes, reverse = false, compact = false, onDelete }: { notes: NoteItem[]; reverse?: boolean; compact?: boolean; onDelete: (id: string) => void }) {
	const rowNotes = notes.length === 1 ? [...notes, ...notes, ...notes] : notes

	return (
		<div className={cn('notes-marquee relative flex overflow-hidden', compact ? 'py-1' : 'py-2')}>
			<div className={cn('notes-marquee-track flex min-w-full shrink-0', compact ? 'gap-3' : 'gap-4', reverse && 'notes-marquee-reverse')}>
				{[...rowNotes, ...rowNotes].map((note, index) => (
					<NoteCard key={`${note.id}-${index}`} note={note} compact={compact} onDelete={onDelete} />
				))}
			</div>
		</div>
	)
}

export default function NotesContent({ compact = false, className }: NotesContentProps) {
	const [notes, setNotes] = useState<NoteItem[]>(initialNotes as NoteItem[])
	const [content, setContent] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	const sortedNotes = useMemo(() => {
		return [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
	}, [notes])
	const firstRow = sortedNotes.slice(0, Math.ceil(sortedNotes.length / 2))
	const secondRow = sortedNotes.slice(Math.ceil(sortedNotes.length / 2))

	const saveNotes = async (nextNotes: NoteItem[]) => {
		setIsSaving(true)

		try {
			const res = await fetch('/api/local-notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notes: nextNotes })
			})

			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error(data.message || '保存失败')
			}

			toast.success('已经记下来了')
		} catch (error: any) {
			toast.error(error?.message || '保存失败')
		} finally {
			setIsSaving(false)
		}
	}

	const handleSubmit = async () => {
		const text = content.trim()
		if (!text) {
			toast.error('先写一句想记录的话吧')
			return
		}

		const nextNotes = [
			{
				id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
				content: text,
				createdAt: new Date().toISOString()
			},
			...notes
		]

		setNotes(nextNotes)
		setContent('')
		await saveNotes(nextNotes)
	}

	const handleDelete = async (id: string) => {
		const nextNotes = notes.filter(note => note.id !== id)
		setNotes(nextNotes)
		await saveNotes(nextNotes)
	}

	return (
		<div className={cn('relative z-10 mx-auto w-full', compact ? 'max-w-none' : 'max-w-3xl', className)}>
			<div className={cn('text-center', compact ? 'mb-4' : 'mb-8')}>
				<div className={cn('text-secondary tracking-[0.35em] uppercase', compact ? 'text-xs' : 'text-sm')}>Tiny Notes</div>
				<h1 className={cn('font-semibold tracking-tight', compact ? 'mt-2 text-2xl' : 'mt-3 text-4xl max-sm:text-3xl')}>随时想记录的一句话</h1>
				<p className={cn('text-secondary text-sm', compact ? 'mt-2 text-xs' : 'mt-3')}>不用整理，不必完整，只要此刻值得留下。</p>
			</div>

			<div className={cn('border border-white/70 bg-white/60 shadow-2xl backdrop-blur-xl', compact ? 'rounded-[24px] p-3' : 'rounded-[32px] p-5')}>
				<textarea
					value={content}
					onChange={event => setContent(event.target.value)}
					placeholder='写下现在脑海里的一句话...'
					className={cn(
						'w-full resize-none border border-white/70 bg-white/70 leading-relaxed transition outline-none focus:border-[#87CEFA] focus:bg-white/90',
						compact ? 'min-h-20 rounded-[18px] p-3 text-sm' : 'min-h-32 rounded-[24px] p-5 text-base'
					)}
				/>
				<div className={cn('flex items-center justify-between max-sm:flex-col max-sm:items-stretch', compact ? 'mt-3 gap-2' : 'mt-4 gap-3')}>
					<span className='text-secondary text-xs'>{content.trim().length ? `${content.trim().length} 个字符` : '一句话也可以很有力量'}</span>
					<button type='button' onClick={handleSubmit} disabled={isSaving} className={cn('brand-btn rounded-2xl disabled:opacity-60', compact ? 'px-4 py-1.5 text-xs' : 'px-6 py-2 text-sm')}>
						{isSaving ? '保存中...' : '记录这一句'}
					</button>
				</div>
			</div>

			<div className={cn(compact ? 'mt-4' : 'mt-8')}>
				{sortedNotes.length === 0 ? (
					<div className='text-secondary rounded-[28px] border border-dashed border-white/70 bg-white/35 p-8 text-center text-sm backdrop-blur'>
						还没有随记，先写下第一句吧。
					</div>
				) : (
					<div className='relative flex w-full flex-col overflow-hidden'>
						<NotesMarqueeRow notes={firstRow} compact={compact} onDelete={handleDelete} />
						<NotesMarqueeRow notes={secondRow.length ? secondRow : firstRow} compact={compact} reverse onDelete={handleDelete} />
						<div className='from-bg pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r' />
						<div className='from-bg pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l' />
					</div>
				)}
			</div>
		</div>
	)
}
