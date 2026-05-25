'use client'
import { PropsWithChildren } from 'react'
import { useCenterInit } from '@/hooks/use-center'
import BlurredBubblesBackground from './backgrounds/blurred-bubbles'
import NavCard from '@/components/nav-card'
import { Toaster } from 'sonner'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { useSize, useSizeInit } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { ScrollTopButton } from '@/components/scroll-top-button'
import MusicCard from '@/components/music-card'
import ParticlesBackground from './backgrounds/particles'

export default function Layout({ children }: PropsWithChildren) {
	useCenterInit()
	useSizeInit()
	const { cardStyles, siteContent, regenerateKey } = useConfigStore()
	const { maxSM, init } = useSize()

	const backgroundImages = (siteContent.backgroundImages ?? []) as Array<{ id: string; url: string }>
	const currentBackgroundImageId = siteContent.currentBackgroundImageId
	const currentBackgroundImage =
		currentBackgroundImageId && currentBackgroundImageId.trim() ? backgroundImages.find(item => item.id === currentBackgroundImageId) : null

	return (
		<>
			<Toaster
				position='bottom-right'
				richColors
				icons={{
					success: <CircleCheckIcon className='size-4' />,
					info: <InfoIcon className='size-4' />,
					warning: <TriangleAlertIcon className='size-4' />,
					error: <OctagonXIcon className='size-4' />,
					loading: <Loader2Icon className='size-4 animate-spin' />
				}}
				style={
					{
						'--border-radius': '12px'
					} as React.CSSProperties
				}
			/>
			{currentBackgroundImage && (
				<>
					<div
						className='fixed inset-0 z-0 overflow-hidden opacity-100 contrast-110 saturate-125'
						style={{
							backgroundImage: `url(${currentBackgroundImage.url})`,
							backgroundSize: 'cover',
							backgroundPosition: maxSM ? '64% center' : 'center right',
							backgroundRepeat: 'no-repeat'
						}}
					/>
					<div className='pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.5)_34%,rgba(255,255,255,0.08)_66%,rgba(8,18,28,0.18)_100%)]' />
					<div className='pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_78%_30%,rgba(47,203,231,0.18),transparent_34%),radial-gradient(circle_at_88%_66%,rgba(125,18,56,0.28),transparent_32%),linear-gradient(180deg,rgba(20,37,48,0.02)_0%,rgba(20,37,48,0.16)_100%)]' />
				</>
			)}
			<ParticlesBackground quantity={!maxSM ? 110 : 55} ease={80} />
			<BlurredBubblesBackground colors={siteContent.backgroundColors} regenerateKey={regenerateKey} />

			<main className='relative z-10 h-full'>
				{children}
				<NavCard />

				{!maxSM && cardStyles.musicCard?.enabled !== false && <MusicCard />}
			</main>

			{maxSM && init && <ScrollTopButton className='bg-brand/20 fixed right-6 bottom-8 z-50 shadow-md' />}
		</>
	)
}
