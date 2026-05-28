'use client'

import { motion } from 'motion/react'
import { ANIMATION_DELAY, INIT_DELAY } from '@/consts'
import LikeButton from '@/components/like-button'
import { BlogToc } from '@/components/blog-toc'
import { ScrollTopButton } from '@/components/scroll-top-button'
import { useConfigStore } from '@/app/(home)/stores/config-store'

type TocItem = {
	id: string
	text: string
	level: number
}

type BlogSidebarProps = {
	cover?: string
	summary?: string
	toc: TocItem[]
	slug?: string
}

export function BlogSidebar({ cover, summary, toc, slug }: BlogSidebarProps) {
	const { siteContent } = useConfigStore()
	const summaryInContent = siteContent.summaryInContent ?? false

	return (
		<aside className='sticky flex w-[240px] shrink-0 flex-col items-start gap-4 self-start max-sm:hidden' style={{ top: 112 }}>
			{cover && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: INIT_DELAY + ANIMATION_DELAY * 1 }}
					className='w-full border border-[#233D4D] bg-[#F5F1E8] p-3'>
					<img src={cover} alt='cover' className='h-auto w-full border border-[#233D4D] object-cover' />
				</motion.div>
			)}

			{summary && !summaryInContent && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: INIT_DELAY + ANIMATION_DELAY * 2 }}
					className='w-full border border-[#233D4D] bg-[#F5F1E8] p-4 text-sm'>
					<h2 className='mb-3 border-b border-[#233D4D] pb-2 text-xs font-black tracking-[0.24em] text-[#FE7F2D]'>SUMMARY</h2>
					<div className='scrollbar-none max-h-[240px] cursor-text overflow-auto leading-6 text-[#233D4D]/72'>{summary}</div>
				</motion.div>
			)}

			<BlogToc toc={toc} delay={INIT_DELAY + ANIMATION_DELAY * 3} />

			<LikeButton slug={slug} delay={(INIT_DELAY + ANIMATION_DELAY * 4) * 1000} />

			<ScrollTopButton delay={INIT_DELAY + ANIMATION_DELAY * 5} />
		</aside>
	)
}
