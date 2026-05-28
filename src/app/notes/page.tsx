import NotesContent from './notes-content'

export default function NotesPage() {
	return (
		<div className='relative min-h-screen overflow-hidden bg-[#F5F1E8] px-8 pt-28 pb-20 text-[#233D4D] max-sm:px-4 max-sm:pt-24'>
			<section className='mx-auto mb-14 grid max-w-[1280px] grid-cols-[0.85fr_1.15fr] gap-10 border-b border-[#233D4D] pb-10 max-lg:grid-cols-1'>
				<div>
					<p className='mb-5 text-xs font-black tracking-[0.34em] text-[#FE7F2D]'>NOTES / FRAGMENTS</p>
					<h1 className='text-[clamp(64px,10vw,156px)] leading-[0.82] font-black tracking-[-0.09em]'>
						TINY
						<br />
						NOTES
					</h1>
				</div>
				<div className='flex items-end'>
					<p className='max-w-xl border-l border-[#233D4D] pl-5 text-sm leading-7 font-semibold tracking-[0.04em] text-[#233D4D]/72 max-lg:border-l-0 max-lg:border-t max-lg:pt-5 max-lg:pl-0'>
						UNFINISHED THOUGHTS, DAILY SENTENCES, PRIVATE OBSERVATIONS AND SMALL PIECES OF MEMORY COLLECTED AS A DIGITAL FIELD NOTE.
					</p>
				</div>
			</section>

			<div className='mx-auto max-w-[1280px] border border-[#233D4D] bg-[#F5F1E8] px-6 py-10 max-sm:px-3'>
				<NotesContent />
			</div>
		</div>
	)
}
