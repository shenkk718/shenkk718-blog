import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useLatestBlog } from '@/hooks/use-blog-index'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import dayjs from 'dayjs'
import Link from 'next/link'
import { HomeDraggableLayer } from './home-draggable-layer'

export default function ArticleCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { blog, loading } = useLatestBlog()
	const styles = cardStyles.articleCard
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons

	const x = styles.offsetX !== null ? center.x + styles.offsetX : 32
	const y = styles.offsetY !== null ? center.y + styles.offsetY : typeof window !== 'undefined' ? window.innerHeight - styles.height - 80 : 600

	return (
		<HomeDraggableLayer cardKey='articleCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='article-card-wrapper group border-none p-0 max-sm:static'>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-9.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 140, left: -12, top: -16, opacity: 0.8 }}
						/>
					</>
				)}

				{loading ? (
					<div className='flex h-full items-center justify-center'>
						<span className='text-secondary text-xs'>加载中...</span>
					</div>
				) : blog ? (
					<Link href={`/blog/${blog.slug}`} className='block h-full px-4 py-3'>
						<h2 className='text-[10px] font-medium text-[#c8944a]'>最新文章</h2>
						<h3 className='mt-1 line-clamp-2 text-xs leading-snug font-semibold text-white'>{blog.title || blog.slug}</h3>
						<p className='mt-1 text-[10px] text-white/50'>{dayjs(blog.date).format('YYYY/M/D')}</p>

						<div className='article-card-expand mt-2 overflow-hidden'>
							<div className='border-t border-white/15 pt-2'>
								<div className='flex gap-2'>
									{blog.cover ? <img src={blog.cover} alt='cover' className='h-10 w-10 shrink-0 rounded-lg object-cover' /> : null}
									<div className='min-w-0 flex-1'>
										<p className='line-clamp-3 text-[10px] leading-relaxed text-white/60'>{blog.summary || '点击查看更多文章内容...'}</p>
									</div>
								</div>
								<div className='mt-2 flex items-center justify-end'>
									<span className='inline-flex items-center gap-1 rounded-full bg-[#c8944a] px-2.5 py-0.5 text-[10px] font-medium text-white'>阅读全文 →</span>
								</div>
							</div>
						</div>
					</Link>
				) : (
					<div className='flex h-full items-center justify-center'>
						<span className='text-secondary text-xs'>暂无文章</span>
					</div>
				)}
			</Card>
		</HomeDraggableLayer>
	)
}
