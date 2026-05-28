'use client'

import HiCard from '@/app/(home)/hi-card'
import Link from 'next/link'
import { useSize } from '@/hooks/use-size'
import { motion } from 'motion/react'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { useConfigStore } from './stores/config-store'
import { toast } from 'sonner'
import ConfigDialog from './config-dialog/index'
import { useEffect } from 'react'
import SnowfallBackground from '@/layout/backgrounds/snowfall'
import blogsData from '../../../public/blogs/index.json'
import projects from '../projects/list.json'
import LikeButton from '@/components/like-button'

type BlogIndexItem = {
	slug: string
	title: string
	date?: string
	summary?: string
	hidden?: boolean
}

const blogs = blogsData as BlogIndexItem[]

export default function Home() {
	const { maxSM } = useSize()
	const { cardStyles, configDialogOpen, setConfigDialogOpen, siteContent } = useConfigStore()
	const editing = useLayoutEditStore(state => state.editing)
	const saveEditing = useLayoutEditStore(state => state.saveEditing)
	const cancelEditing = useLayoutEditStore(state => state.cancelEditing)
	const visibleBlogs = [...blogs].filter(item => !item.hidden).sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
	const latestBlog = visibleBlogs[0]

	const handleSave = () => {
		saveEditing()
		toast.success('首页布局偏移已保存（尚未提交到远程配置）')
	}

	const handleCancel = () => {
		cancelEditing()
		toast.info('已取消此次拖拽布局修改')
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === ',')) {
				e.preventDefault()
				setConfigDialogOpen(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [setConfigDialogOpen])

	return (
		<>
			{siteContent.enableChristmas && <SnowfallBackground zIndex={0} count={!maxSM ? 125 : 20} />}

			<section className='relative min-h-screen overflow-hidden pt-24'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className='pointer-events-none fixed top-32 left-8 z-10 max-w-[48vw] text-[#233D4D] max-sm:top-24 max-sm:left-4 max-sm:max-w-[92vw]'>
					<p className='mb-5 text-xs font-black tracking-[0.34em] text-[#FE7F2D]'>WEB3 · ART · CREATIVE CODING</p>
					<h1 className='text-[clamp(64px,9vw,140px)] leading-[0.86] font-black tracking-[-0.08em]'>
						SHENKK
						<br />
						DIGITAL
						<br />
						ARCHIVE
					</h1>
					<div className='mt-8 h-px w-48 bg-[#233D4D]' />
					<p className='mt-6 max-w-md text-sm leading-6 font-semibold tracking-[0.04em] text-[#233D4D]/72'>
						A PERSONAL INDEX OF CODE, VISUAL SYSTEMS, CREATIVE EXPERIMENTS AND DIGITAL MEMORY.
					</p>
				</motion.div>

				<div className='max-sm:flex max-sm:flex-col max-sm:items-center max-sm:gap-6 max-sm:pt-[420px] max-sm:pb-20'>
					{cardStyles.hiCard?.enabled !== false && <HiCard />}
				</div>

				<div className='absolute left-8 bottom-8 z-20 flex items-center gap-4 border border-[#233D4D] bg-[#F5F1E8] px-4 py-3 text-[#233D4D] max-sm:left-4 max-sm:bottom-4'>
					<div className='border-r border-[#233D4D] pr-4'>
						<p className='text-[10px] font-black tracking-[0.28em] text-[#FE7F2D]'>LIKE THIS ARCHIVE</p>
						<p className='mt-1 text-xs font-semibold tracking-[0.08em] text-[#233D4D]/70'>留下一个数字痕迹</p>
					</div>
					<LikeButton slug='site-home' className='!border-0 !bg-transparent !p-0 text-[#233D4D]' />
				</div>

				<button
					onClick={() => setConfigDialogOpen(true)}
					className='absolute right-8 bottom-8 z-20 border border-[#233D4D] bg-[#F5F1E8] px-4 py-3 text-xs font-black tracking-[0.2em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8] max-sm:right-4 max-sm:bottom-4'>
					SETTINGS
				</button>
			</section>

			{editing && (
				<div className='pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-6'>
					<div className='pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2 shadow-lg backdrop-blur'>
						<span className='text-xs text-gray-600'>正在编辑首页布局，拖拽卡片调整位置</span>
						<div className='flex gap-2'>
							<motion.button
								type='button'
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleCancel}
								className='rounded-xl border bg-white px-3 py-1 text-xs font-medium text-gray-700'>
								取消
							</motion.button>
							<motion.button type='button' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} className='brand-btn px-3 py-1 text-xs'>
								保存偏移
							</motion.button>
						</div>
					</div>
				</div>
			)}

			<motion.section
				initial={{ opacity: 0, y: 28 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.75, ease: 'easeOut' }}
				className='relative z-20 min-h-screen border-t border-[#233D4D] bg-[#F5F1E8] px-8 py-24 text-[#233D4D] max-sm:px-4'>
				<div className='grid grid-cols-[0.8fr_1.2fr] gap-10 max-lg:grid-cols-1'>
					<div>
						<p className='mb-4 text-xs font-black tracking-[0.34em] text-[#FE7F2D]'>02 / SELECTED WRITING</p>
						<h2 className='text-[clamp(54px,8vw,128px)] leading-[0.84] font-black tracking-[-0.08em]'>
							FEATURED
							<br />
							ARTICLES
						</h2>
						{latestBlog && (
							<Link
								href={`/blog/${latestBlog.slug}`}
								className='group mt-10 block border border-[#233D4D] transition-colors duration-300 hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
								<div className='flex items-center justify-between border-b border-[#233D4D] px-4 py-3 font-mono text-xs group-hover:border-[#F5F1E8]/40'>
									<span className='text-[#FE7F2D] group-hover:text-[#FE7F2D]'>LATEST ARTICLE</span>
									<span>{latestBlog.date?.slice(0, 10)}</span>
								</div>
								<div className='p-4'>
									<h3 className='text-3xl leading-none font-black tracking-[-0.06em]'>{latestBlog.title || latestBlog.slug}</h3>
									<p className='mt-4 line-clamp-3 text-sm leading-6 opacity-72'>{latestBlog.summary || 'CLICK TO READ THE LATEST ARCHIVE ENTRY.'}</p>
									<div className='mt-8 flex items-center justify-between border-t border-[#233D4D] pt-3 text-xs font-black tracking-[0.22em] group-hover:border-[#F5F1E8]/40'>
										<span>READ NOW</span>
										<span className='text-[#FE7F2D]'>↗</span>
									</div>
								</div>
							</Link>
						)}
						<div className='mt-5 flex flex-wrap gap-3'>
							<Link
								href='/write'
								className='inline-flex items-center border border-[#233D4D] px-5 py-3 text-xs font-black tracking-[0.24em] text-[#233D4D] transition-colors duration-300 hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
								WRITE NEW ARTICLE
								<span className='ml-8 text-[#FE7F2D]'>↗</span>
							</Link>
							<Link
								href='/notes'
								className='inline-flex items-center border border-[#233D4D] px-5 py-3 text-xs font-black tracking-[0.24em] text-[#233D4D] transition-colors duration-300 hover:bg-[#FE7F2D] hover:text-[#233D4D]'>
								NOTES / 随笔
								<span className='ml-8'>↗</span>
							</Link>
						</div>
					</div>
					<div className='border-t border-[#233D4D]'>
						{visibleBlogs
							.slice(0, 4)
							.map((item, index) => (
								<Link
									key={item.slug}
									href={`/blog/${item.slug}`}
									className='group grid grid-cols-[72px_1fr_120px] items-center gap-5 border-b border-[#233D4D] py-6 transition-colors duration-300 hover:bg-[#233D4D] hover:px-4 hover:text-[#F5F1E8] max-sm:grid-cols-1'>
									<span className='font-mono text-xs text-[#FE7F2D]'>{String(index + 1).padStart(2, '0')}</span>
									<div>
										<h3 className='text-2xl font-black tracking-[-0.04em]'>{item.title}</h3>
										<p className='mt-2 text-sm opacity-70'>{item.summary || 'NO SUMMARY'}</p>
									</div>
									<span className='text-right font-mono text-xs opacity-70 max-sm:text-left'>{item.date?.slice(0, 10)}</span>
								</Link>
							))}
					</div>
				</div>
			</motion.section>

			<motion.section
				initial={{ opacity: 0, y: 28 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.75, ease: 'easeOut' }}
				className='relative z-20 min-h-screen border-t border-[#233D4D] bg-[#F5F1E8] px-8 py-24 text-[#233D4D] max-sm:px-4'>
				<div className='mb-14 flex items-end justify-between gap-8 max-sm:block'>
					<h2 className='text-[clamp(58px,10vw,156px)] leading-[0.84] font-black tracking-[-0.08em]'>
						PROJECT
						<br />
						ARCHIVE
					</h2>
					<p className='max-w-sm border-l border-[#233D4D] pl-5 text-sm leading-6 font-semibold text-[#233D4D]/72 max-sm:mt-8 max-sm:border-l-0 max-sm:border-t max-sm:pt-4 max-sm:pl-0'>
						HARD GRID SYSTEM FOR TECHNICAL BUILDS, WEB3 EXPERIMENTS AND DIGITAL PRODUCTS.
					</p>
				</div>
				<div className='grid grid-cols-2 border-t border-l border-[#233D4D] max-lg:grid-cols-1'>
					{projects.map(project => (
						<Link
							key={project.name}
							href={project.url}
							target='_blank'
							className='group min-h-[360px] border-r border-b border-[#233D4D] p-6 transition-colors duration-300 hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
							<div className='mb-8 flex items-center justify-between font-mono text-xs'>
								<span>{project.year}</span>
								<span className='text-[#FE7F2D] group-hover:text-[#F5F1E8]'>OPEN</span>
							</div>
							<h3 className='max-w-xl text-4xl leading-none font-black tracking-[-0.06em]'>{project.name}</h3>
							<p className='mt-8 line-clamp-5 max-w-xl text-sm leading-6 opacity-72'>{project.description}</p>
						</Link>
					))}
				</div>
			</motion.section>

			<motion.section
				initial={{ opacity: 0, y: 28 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.75, ease: 'easeOut' }}
				className='relative z-20 min-h-screen border-t border-[#233D4D] bg-[#F5F1E8] px-8 py-24 text-[#233D4D] max-sm:px-4'>
				<p className='mb-8 text-xs font-black tracking-[0.34em] text-[#FE7F2D]'>04 / ABOUT</p>
				<h2 className='max-w-[1400px] text-[clamp(64px,11vw,168px)] leading-[0.82] font-black tracking-[-0.09em]'>
					CREATIVE
					<br />
					DEVELOPER
					<br />
					BUILDING
					<br />
					DIGITAL MEMORY.
				</h2>
				<div className='mt-16 grid grid-cols-[1fr_1fr] gap-10 border-t border-[#233D4D] pt-10 max-lg:grid-cols-1'>
					<p className='text-2xl leading-9 font-black tracking-[-0.04em]'>
						I DESIGN AND BUILD PERSONAL SYSTEMS FOR WRITING, IMAGES, PROJECTS AND CREATIVE CODING.
					</p>
					<p className='max-w-xl text-sm leading-7 font-semibold text-[#233D4D]/72'>
						This archive is not just a blog. It is a long-term digital identity: a place where code, design, Web3 thinking, visual experiments and personal records are collected into one editorial system.
					</p>
				</div>
			</motion.section>

			{siteContent.enableChristmas && <SnowfallBackground zIndex={2} count={!maxSM ? 125 : 20} />}
			<ConfigDialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} />
		</>
	)
}
