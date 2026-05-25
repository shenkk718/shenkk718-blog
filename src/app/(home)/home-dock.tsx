'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { PenLine, Settings, StickyNote } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NotesContent from '@/app/notes/notes-content'
import LikeButton from '@/components/like-button'
import { SidePanel } from '@/components/side-panel'
import { useConfigStore } from './stores/config-store'

export default function HomeDock() {
	const router = useRouter()
	const [notesOpen, setNotesOpen] = useState(false)
	const setConfigDialogOpen = useConfigStore(state => state.setConfigDialogOpen)

	const buttonClass =
		'group relative flex size-12 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:text-slate-950'

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 18, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ delay: 0.45, duration: 0.45, ease: 'easeOut' }}
				className='fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-[28px] border border-white/70 bg-white/45 px-4 py-3 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl max-sm:bottom-5 max-sm:gap-2 max-sm:px-3'>
				<button type='button' aria-label='打开随记' onClick={() => setNotesOpen(true)} className={buttonClass}>
					<StickyNote className='size-5' />
					<span className='pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2.5 py-1 text-xs whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100'>
						随记
					</span>
				</button>

				<button type='button' aria-label='写文章' onClick={() => router.push('/write')} className={buttonClass}>
					<PenLine className='size-5' />
					<span className='pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2.5 py-1 text-xs whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100'>
						写文章
					</span>
				</button>

				<div className='relative flex size-12 items-center justify-center'>
					<LikeButton delay={0} className='!p-2.5 shadow-lg shadow-slate-900/5' />
				</div>

				<button type='button' aria-label='打开设置' onClick={() => setConfigDialogOpen(true)} className={buttonClass}>
					<Settings className='size-5' />
					<span className='pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2.5 py-1 text-xs whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100'>
						设置
					</span>
				</button>
			</motion.div>

			<SidePanel open={notesOpen} onClose={() => setNotesOpen(false)}>
				<div className='pointer-events-none absolute top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#87CEFA]/25 blur-3xl' />
				<div className='pointer-events-none absolute right-8 bottom-10 h-56 w-56 rounded-full bg-[#FF9800]/15 blur-3xl' />
				<NotesContent compact className='pt-4 pb-10' />
			</SidePanel>
		</>
	)
}
