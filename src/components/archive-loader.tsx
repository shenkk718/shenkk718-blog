type ArchiveLoaderProps = {
	label?: string
	fullScreen?: boolean
}

export default function ArchiveLoader({ label = 'LOADING ARCHIVE', fullScreen = true }: ArchiveLoaderProps) {
	return (
		<div className={fullScreen ? 'flex min-h-screen items-center justify-center bg-[#F5F1E8] text-[#233D4D]' : 'flex h-full min-h-[320px] items-center justify-center text-[#233D4D]'}>
			<div className='flex flex-col items-center gap-8 border border-[#233D4D] bg-[#F5F1E8] px-12 py-10 max-sm:px-8'>
				<div className='archive-spinner' aria-hidden='true'>
					<div />
					<div />
					<div />
					<div />
					<div />
					<div />
				</div>
				<div className='text-center'>
					<p className='text-xs font-black tracking-[0.34em] text-[#FE7F2D]'>{label}</p>
					<p className='mt-3 text-xs font-semibold tracking-[0.12em] text-[#233D4D]/64'>NETWORK IS REBUILDING THE DIGITAL FIELD</p>
				</div>
			</div>
		</div>
	)
}
