import Card from '@/components/card'
import { CARD_SPACING } from '@/consts'
import { useCenterStore } from '@/hooks/use-center'
import { useState } from 'react'
import NotesContent from '@/app/notes/notes-content'
import { SidePanel } from '@/components/side-panel'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'

export default function NoteCard() {
	const center = useCenterStore()
	const [panelOpen, setPanelOpen] = useState(false)
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.noteCard
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - socialButtonsStyles.width
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING

	return (
		<>
			<HomeDraggableLayer cardKey='noteCard' x={x} y={y} width={styles.width} height={styles.height}>
				<Card
					order={styles.order}
					width={styles.width}
					height={styles.height}
					x={x}
					y={y}
					className='group cursor-pointer overflow-hidden p-5 max-sm:static max-sm:translate-0'>
					<button type='button' onClick={() => setPanelOpen(true)} className='relative flex h-full w-full flex-col items-start justify-between text-left'>
						<div className='absolute -top-10 -right-10 h-28 w-28 rounded-full bg-[#87CEFA]/30 blur-2xl transition group-hover:scale-125' />
						<div>
							<div className='text-secondary text-xs tracking-[0.28em] uppercase'>Notes</div>
							<h2 className='mt-3 text-2xl font-semibold text-slate-800'>随记一句话</h2>
						</div>
						<p className='text-secondary max-w-[190px] text-sm leading-relaxed'>捕捉转瞬即逝的想法，把此刻轻轻留下。</p>
						<span className='rounded-full bg-white/70 px-3 py-1 text-xs text-slate-700 shadow-sm transition group-hover:bg-[#FF9800]/20'>打开面板 →</span>
					</button>
				</Card>
			</HomeDraggableLayer>

			<SidePanel open={panelOpen} onClose={() => setPanelOpen(false)}>
				<div className='pointer-events-none absolute top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#87CEFA]/25 blur-3xl' />
				<div className='pointer-events-none absolute right-8 bottom-10 h-56 w-56 rounded-full bg-[#FF9800]/15 blur-3xl' />
				<NotesContent compact className='pt-4 pb-10' />
			</SidePanel>
		</>
	)
}
