'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const links = [
	{ label: 'ARCHIVE', href: '/blog' },
	{ label: 'PROJECTS', href: '/projects' },
	{ label: 'LAB', href: '/share' },
	{ label: 'PHOTOS', href: '/pictures' },
	{ label: 'NOTES', href: '/notes' },
	{ label: 'ABOUT', href: '/about' },
	{ label: 'WRITE', href: '/write', accent: true }
]

export default function EditorialNav() {
	const pathname = usePathname()

	return (
		<motion.header
			initial={{ opacity: 0, y: -18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.55, ease: 'easeOut' }}
			className='fixed top-0 right-0 left-0 z-50 border-b border-[#233D4D] bg-[#F5F1E8]/92 text-[#233D4D] backdrop-blur-[2px]'>
			<div className='mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between px-8 max-sm:h-16 max-sm:px-4'>
				<Link href='/' className='group flex items-center gap-3'>
					<span className='h-3 w-3 border border-[#233D4D] bg-[#FE7F2D] transition-transform duration-300 group-hover:rotate-45' />
					<span className='text-sm font-black tracking-[-0.02em] max-sm:text-xs'>SHENKK DIGITAL ARCHIVE</span>
				</Link>

				<nav className='flex items-center gap-8 max-sm:gap-3'>
					{links.map(link => {
						const active = pathname === link.href || pathname.startsWith(`${link.href}/`)

						return (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									'group relative py-2 text-xs font-bold tracking-[0.16em] transition-colors duration-300 max-sm:text-[10px] max-sm:tracking-[0.08em]',
									link.accent && 'border border-[#233D4D] px-3 hover:bg-[#233D4D] hover:!text-[#F5F1E8] max-sm:px-2',
									active ? 'text-[#233D4D]' : 'text-[#233D4D]/68 hover:text-[#233D4D]',
									link.accent && active && 'bg-[#233D4D] !text-[#F5F1E8]'
								)}>
								{link.label}
								<span
									className={cn(
										'absolute bottom-0 left-0 h-[2px] bg-[#FE7F2D] transition-all duration-500 ease-out',
										active ? 'w-full' : 'w-0 group-hover:w-full'
									)}
								/>
							</Link>
						)
					})}
				</nav>
			</div>
		</motion.header>
	)
}
