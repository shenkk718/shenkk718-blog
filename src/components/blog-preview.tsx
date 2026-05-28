'use client'

import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useSize } from '@/hooks/use-size'
import { BlogSidebar } from '@/components/blog-sidebar'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import ArchiveLoader from '@/components/archive-loader'

type BlogPreviewProps = {
	markdown: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	slug?: string
}

export function BlogPreview({ markdown, title, tags, date, summary, cover, slug }: BlogPreviewProps) {
	const { maxSM: isMobile } = useSize()
	const { content, toc, loading } = useMarkdownRender(markdown)
	const { siteContent } = useConfigStore()
	const summaryInContent = siteContent.summaryInContent ?? false

	if (loading) {
		return <ArchiveLoader label='RENDERING ARTICLE' fullScreen={false} />
	}

	return (
		<div className='mx-auto flex max-w-[1280px] justify-center gap-6 px-8 pt-28 pb-16 text-[#233D4D] max-sm:block max-sm:px-4 max-sm:pt-24'>
			<motion.article
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: INIT_DELAY }}
				className='static flex-1 overflow-auto border border-[#233D4D] bg-[#F5F1E8] p-0'>
				<div>
					<header className='border-b border-[#233D4D] px-8 py-8 max-sm:px-4'>
						<p className='mb-5 text-xs font-black tracking-[0.34em] text-[#FE7F2D]'>ARCHIVE ENTRY</p>
						<h1 className='max-w-[900px] text-[clamp(42px,7vw,96px)] leading-[0.86] font-black tracking-[-0.08em]'>{title}</h1>

						<div className='mt-8 flex flex-wrap items-center gap-3 border-t border-[#233D4D] pt-4 font-mono text-xs uppercase tracking-[0.18em] text-[#233D4D]/72'>
							<span>{date}</span>
							{tags.map(t => (
								<span key={t} className='border border-[#233D4D] px-2 py-1 text-[#233D4D]'>
									#{t}
								</span>
							))}
						</div>

						{summary && summaryInContent && <div className='mt-6 max-w-2xl border-l border-[#FE7F2D] pl-4 text-sm leading-7 font-semibold text-[#233D4D]/72'>“{summary}”</div>}
					</header>

					<div className='prose prose-sm max-w-none cursor-text px-8 py-10 max-sm:px-4'>{content}</div>
				</div>
			</motion.article>

			{!isMobile && <BlogSidebar cover={cover} summary={summary} toc={toc} slug={slug} />}
		</div>
	)
}
