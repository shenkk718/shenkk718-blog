'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Picture } from '../page'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

type DayCell = {
	date: Date
	key: string
	day: number
	inMonth: boolean
	imageUrls: string[]
	descriptions: string[]
}

const dateKey = (date: Date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function MemoryPhotoCard({ imageUrl, date, description }: { imageUrl: string; date: string; description: string }) {
	const [aspectRatio, setAspectRatio] = useState(4 / 3)

	if (!imageUrl) return null

	return (
		<section
			className='group relative overflow-hidden rounded-2xl bg-[#7A303A] shadow-lg shadow-[#7A303A]/20 [perspective:1000px] transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.03] hover:shadow-xl'
			style={{ aspectRatio, maxHeight: 180, minHeight: 92 }}>
			<img
				src={imageUrl}
				alt={description || date}
				onLoad={event => {
					const img = event.currentTarget
					if (img.naturalWidth > 0 && img.naturalHeight > 0) {
						setAspectRatio(img.naturalWidth / img.naturalHeight)
					}
				}}
				className='h-full w-full rounded-2xl object-cover transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:scale-0'
			/>
			<div className='absolute inset-0 flex origin-bottom rotate-x-[-90deg] flex-col justify-center bg-[#7A303A] p-3 text-white transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:rotate-x-0'>
				<h3 className='text-xs font-bold'>{date}</h3>
				<p className='mt-2 line-clamp-3 text-[11px] leading-relaxed text-white/90'>{description || '这一天留下了一张照片。'}</p>
			</div>
		</section>
	)
}

export default function MemoryStarCalendar({ pictures }: { pictures: Picture[] }) {
	const [currentMonth, setCurrentMonth] = useState(() => new Date())
	const [selectedDay, setSelectedDay] = useState<DayCell | null>(null)

	const picturesByDate = useMemo(() => {
		const map = new Map<string, { imageUrls: string[]; descriptions: string[] }>()
		for (const picture of pictures) {
			const date = new Date(picture.uploadedAt)
			if (Number.isNaN(date.getTime())) continue
			const key = dateKey(date)
			const entry = map.get(key) || { imageUrls: [], descriptions: [] }
			if (picture.image) {
				entry.imageUrls.push(picture.image)
				entry.descriptions.push(picture.description || '')
			}
			if (picture.images?.length) {
				picture.images.forEach(url => {
					entry.imageUrls.push(url)
					entry.descriptions.push(picture.description || '')
				})
			}
			map.set(key, entry)
		}
		return map
	}, [pictures])

	const days = useMemo(() => {
		const year = currentMonth.getFullYear()
		const month = currentMonth.getMonth()
		const firstDay = new Date(year, month, 1)
		const start = new Date(year, month, 1 - firstDay.getDay())

		return Array.from({ length: 42 }, (_, index) => {
			const date = new Date(start)
			date.setDate(start.getDate() + index)
			const key = dateKey(date)
			const entry = picturesByDate.get(key)
			return {
				date,
				key,
				day: date.getDate(),
				inMonth: date.getMonth() === month,
				imageUrls: entry?.imageUrls || [],
				descriptions: entry?.descriptions || []
			}
		})
	}, [currentMonth, picturesByDate])

	const monthLabel = `${currentMonth.getFullYear()} / ${String(currentMonth.getMonth() + 1).padStart(2, '0')}`

	const changeMonth = (offset: number) => {
		setSelectedDay(null)
		setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: -18, y: -8 }}
			animate={{ opacity: 1, x: 0, y: 0 }}
			transition={{ duration: 0.45, ease: 'easeOut' }}
			className='fixed top-24 left-5 z-30 w-[230px] rounded-[20px] border border-[#7A303A]/35 bg-[#ADC9D9] p-3 text-[#7A303A] shadow-2xl shadow-[#7A303A]/15 max-sm:hidden'>
			<div className='pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/30 blur-2xl' />
			<div className='pointer-events-none absolute right-0 bottom-0 h-28 w-28 rounded-full bg-[#7A303A]/18 blur-2xl' />

			<div className='relative flex items-start justify-between gap-3'>
				<div>
					<p className='text-[10px] tracking-[0.3em] text-[#7A303A]/65 uppercase'>Memory Sky</p>
					<h2 className='mt-1 text-base font-black tracking-wide'>记忆星图日历</h2>
				</div>
				<div className='flex gap-1'>
					<button onClick={() => changeMonth(-1)} className='grid size-7 place-items-center rounded-full bg-[#7A303A]/10 text-sm transition hover:bg-[#7A303A]/18'>
						‹
					</button>
					<button onClick={() => changeMonth(1)} className='grid size-7 place-items-center rounded-full bg-[#7A303A]/10 text-sm transition hover:bg-[#7A303A]/18'>
						›
					</button>
				</div>
			</div>

			<div className='relative mt-2 rounded-2xl border border-[#7A303A]/22 bg-[#E5F0F4]/72 p-2 shadow-inner shadow-white/30'>
				<div className='mb-2 flex items-center justify-between'>
					<span className='text-sm font-bold text-[#7A303A]'>{monthLabel}</span>
					<span className='rounded-full bg-[#7A303A]/10 px-2 py-0.5 text-[10px] text-[#7A303A]/70'>{pictures.length} records</span>
				</div>

				<div className='grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium text-[#7A303A]/55'>
					{WEEK_DAYS.map(day => (
						<div key={day}>{day}</div>
					))}
				</div>

				<div className='mt-1 grid grid-cols-7 gap-1'>
					{days.map(day => {
						const hasRecord = day.imageUrls.length > 0
						return (
							<button
								key={day.key}
								type='button'
								onClick={() => hasRecord && setSelectedDay(day)}
								className={`group relative grid h-5 place-items-center rounded-full text-[10px] transition ${
									day.inMonth ? 'text-[#7A303A]/65' : 'text-[#7A303A]/20'
								} ${hasRecord ? 'cursor-pointer text-[#7A303A] hover:scale-110' : 'cursor-default'}`}>
								<span
									className={`absolute size-1.5 rounded-full ${
										hasRecord ? 'bg-[#7A303A] shadow-[0_0_10px_3px_rgba(122,48,58,0.28)]' : 'bg-[#7A303A]/25'
									}`}
								/>
								<span className='pointer-events-none absolute -bottom-3 font-medium opacity-0 transition group-hover:opacity-100'>{day.day}</span>
							</button>
						)
					})}
				</div>
			</div>

			<AnimatePresence>
				{selectedDay && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelectedDay(null)}
							className='fixed inset-0 z-40'
						/>
						<motion.div
							initial={{ opacity: 0, x: 10, scale: 0.96 }}
							animate={{ opacity: 1, x: 0, scale: 1 }}
							exit={{ opacity: 0, x: 10, scale: 0.96 }}
							onClick={e => e.stopPropagation()}
							className='absolute top-0 left-[calc(100%+8px)] z-50 w-[250px] rounded-3xl border border-[#7A303A]/25 bg-[#ADC9D9] p-3 text-[#7A303A] shadow-2xl shadow-[#7A303A]/15'>
							<div className='mb-2 flex items-center justify-between'>
								<p className='text-xs font-semibold'>{selectedDay.key}</p>
								<button
									onClick={() => setSelectedDay(null)}
									className='grid size-6 place-items-center rounded-full text-[#7A303A]/50 transition hover:bg-[#7A303A]/10 hover:text-[#7A303A]'>
									×
								</button>
							</div>
							<div className='grid max-h-[360px] grid-cols-2 items-start gap-2 overflow-hidden'>
								{(() => {
									const shuffled = [...selectedDay.imageUrls]
										.map((url, i) => ({ url, desc: selectedDay.descriptions[i] || '', idx: i }))
										.sort(() => Math.random() - 0.5)
									return shuffled.slice(0, 4).map(({ url, desc, idx }) => (
										<MemoryPhotoCard key={`${selectedDay.key}-${idx}`} imageUrl={url} date={selectedDay.key} description={desc} />
									))
								})()}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</motion.div>
	)
}
