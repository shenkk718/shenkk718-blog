import NotesContent from './notes-content'

export default function NotesPage() {
	return (
		<div className='relative min-h-screen overflow-hidden px-6 py-24 max-sm:px-4'>
			<div className='pointer-events-none absolute top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#87CEFA]/25 blur-3xl' />
			<div className='pointer-events-none absolute right-10 bottom-10 h-72 w-72 rounded-full bg-[#FF9800]/15 blur-3xl' />
			<NotesContent />
		</div>
	)
}
