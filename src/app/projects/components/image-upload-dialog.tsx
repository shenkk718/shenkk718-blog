'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'

export type ImageItem = { type: 'url'; url: string } | { type: 'file'; file: File; previewUrl: string; hash?: string }

interface ImageUploadDialogProps {
	currentImage?: string
	onClose: () => void
	onSubmit: (image: ImageItem) => void
}

export default function ImageUploadDialog({ currentImage, onClose, onSubmit }: ImageUploadDialogProps) {
	const [urlInput, setUrlInput] = useState(currentImage || '')
	const [previewFile, setPreviewFile] = useState<{ file: File; previewUrl: string } | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			toast.error('请选择图片文件')
			return
		}

		const previewUrl = URL.createObjectURL(file)
		setPreviewFile({ file, previewUrl })
		setUrlInput('')
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (previewFile) {
			onSubmit({
				type: 'file',
				file: previewFile.file,
				previewUrl: previewFile.previewUrl
			})
		} else if (urlInput.trim()) {
			onSubmit({
				type: 'url',
				url: urlInput.trim()
			})
		} else {
			toast.error('请上传图片或输入 URL')
			return
		}

		setPreviewFile(null)
		setUrlInput(currentImage || '')
		onClose()
	}

	const handleClose = () => {
		if (previewFile) {
			URL.revokeObjectURL(previewFile.previewUrl)
		}
		setPreviewFile(null)
		setUrlInput(currentImage || '')
		onClose()
	}

	return (
		<DialogModal open onClose={handleClose} className='w-md border border-[#233D4D] bg-[#F5F1E8] p-6 text-[#233D4D] max-sm:w-full'>
			<div>
				<p className='text-[10px] font-black tracking-[0.28em] text-[#FE7F2D]'>IMAGE</p>
				<h2 className='mt-1 mb-5 text-xl font-black'>选择图片</h2>
			</div>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label className='mb-2 block text-xs font-black tracking-[0.12em] text-[#233D4D]/70'>上传图片</label>
					<input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileSelect} />
					<div
						onClick={() => fileInputRef.current?.click()}
						className='mx-auto flex h-32 w-32 cursor-pointer items-center justify-center border border-dashed border-[#233D4D] bg-[#F5F1E8] transition-colors hover:bg-[#233D4D]/5'>
						{previewFile ? (
							<img src={previewFile.previewUrl} alt='preview' className='h-full w-full object-cover' />
						) : (
							<div className='text-center'>
								<Plus className='mx-auto mb-1 h-8 w-8 text-[#233D4D]/50' />
								<p className='text-xs text-[#233D4D]/60'>点击上传图片</p>
							</div>
						)}
					</div>
				</div>

				<div className='relative'>
					<div className='absolute inset-0 flex items-center'>
						<div className='w-full border-t border-[#233D4D]'></div>
					</div>
					<div className='relative flex justify-center text-sm'>
						<span className='bg-[#F5F1E8] px-4 py-1 text-xs font-black text-[#233D4D]/60'>或</span>
					</div>
				</div>

				<div>
					<label className='mb-2 block text-xs font-black tracking-[0.12em] text-[#233D4D]/70'>图片 URL</label>
					<input
						type='url'
						value={urlInput}
						onChange={e => {
							setUrlInput(e.target.value)
							if (previewFile) {
								URL.revokeObjectURL(previewFile.previewUrl)
								setPreviewFile(null)
							}
						}}
						placeholder='https://example.com/image.png'
						className='w-full border border-[#233D4D] bg-[#F5F1E8] px-4 py-2 text-sm text-[#233D4D] focus:outline-none'
					/>
				</div>

				<div className='flex gap-3 pt-2'>
					<button type='submit' className='flex-1 border border-[#233D4D] bg-[#233D4D] px-4 py-3 text-xs font-black tracking-[0.2em] text-[#F5F1E8] transition-colors hover:bg-[#F5F1E8] hover:text-[#233D4D]'>
						CONFIRM
					</button>
					<button
						type='button'
						onClick={handleClose}
						className='flex-1 border border-[#233D4D] bg-[#F5F1E8] px-4 py-3 text-xs font-black tracking-[0.2em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
						CANCEL
					</button>
				</div>
			</form>
		</DialogModal>
	)
}
