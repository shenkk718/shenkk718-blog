import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { useRouter } from 'next/navigation'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useMemo, useState } from 'react'
import picturesList from '../pictures/list.json'

type PictureItem = {
	image?: string
	images?: string[]
}

export default function ArtCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const router = useRouter()
	const styles = cardStyles.artCard
	const hiCardStyles = cardStyles.hiCard

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - styles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - hiCardStyles.height / 2 - styles.height - CARD_SPACING

	const artImages = siteContent.artImages ?? []
	const currentId = siteContent.currentArtImageId
	const currentArt = (currentId ? artImages.find(item => item.id === currentId) : undefined) ?? artImages[0]
	const pictureUrls = useMemo(() => {
		const urls: string[] = []

		for (const picture of picturesList as PictureItem[]) {
			if (picture.image) urls.push(picture.image)
			if (picture.images?.length) urls.push(...picture.images)
		}

		return urls.filter(url => url && !url.startsWith('blob:'))
	}, [])
	const [randomPictureUrl] = useState(() => (pictureUrls.length ? pictureUrls[Math.floor(Math.random() * pictureUrls.length)] : ''))
	const artUrl = currentArt?.url ? `${currentArt.url}?v=${currentArt.id}` : randomPictureUrl || '/images/art/cat.png'

	return (
		<HomeDraggableLayer cardKey='artCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card className='z-20 p-2 max-sm:static max-sm:translate-0' order={styles.order} width={styles.width} height={styles.height} x={x} y={y}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-3.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 160, right: -8, top: -16, opacity: 0.9 }}
						/>
					</>
				)}

				<img onClick={() => router.push('/pictures')} src={artUrl} alt='wall art' className='relative z-10 h-full w-full rounded-[32px] object-cover' />
			</Card>
		</HomeDraggableLayer>
	)
}
