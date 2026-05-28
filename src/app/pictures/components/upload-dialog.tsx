'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'
import type { ImageItem } from '../../projects/components/image-upload-dialog'

interface UploadDialogProps {
	onClose: () => void
	onSubmit: (payload: { images: ImageItem[]; description: string }) => void
}

export default function UploadDialog({ onClose, onSubmit }: UploadDialogProps) {
	const [description, setDescription] = useState('')
	const [images, setImages] = useState<ImageItem[]>([])
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (files.length === 0) return

		const nextImages: ImageItem[] = []

		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				toast.error('请选择图片文件')
				return
			}

			const previewUrl = URL.createObjectURL(file)
			nextImages.push({
				type: 'file',
				file,
				previewUrl
			})
		}

		setImages(nextImages)
	}

	const handleSubmit = () => {
		if (images.length === 0) {
			toast.error('请至少选择一张图片')
			return
		}

		onSubmit({
			images,
			description
		})

		setImages([])
		setDescription('')
		onClose()
	}

	const handleClose = () => {
		images.forEach(image => {
			if (image.type === 'file') {
				URL.revokeObjectURL(image.previewUrl)
			}
		})
		setImages([])
		setDescription('')
		onClose()
	}

	return (
		<DialogModal open onClose={handleClose} className='w-md border border-[#233D4D] bg-[#F5F1E8] p-6 text-[#233D4D] max-sm:w-full'>
			<div className='space-y-5'>
				<div>
					<p className='text-[10px] font-black tracking-[0.28em] text-[#FE7F2D]'>UPLOAD</p>
					<h2 className='mt-1 text-xl font-black'>上传图片</h2>
				</div>

				<div>
					<label className='mb-2 block text-xs font-black tracking-[0.12em] text-[#233D4D]/70'>选择图片（可多选）</label>
					<input ref={fileInputRef} type='file' accept='image/*' multiple className='hidden' onChange={handleFileSelect} />

					{images.length === 0 ? (
						<div
							onClick={() => fileInputRef.current?.click()}
							className='flex h-32 cursor-pointer items-center justify-center border border-dashed border-[#233D4D] bg-[#F5F1E8] transition-colors hover:bg-[#233D4D]/5'>
							<div className='text-center'>
								<Plus className='mx-auto mb-1 h-8 w-8 text-[#233D4D]/50' />
								<p className='text-xs text-[#233D4D]/60'>点击选择图片</p>
							</div>
						</div>
					) : (
						<>
							<div className='relative flex h-40 items-center justify-center overflow-visible border border-[#233D4D] bg-[#F5F1E8]'>
								{images.slice(0, 3).map((image, index) =>
									image.type === 'file' ? (
										<div
											key={index}
											className={`absolute h-32 w-44 overflow-hidden border border-[#233D4D] bg-[#F5F1E8] transition-transform ${
												images.length === 1
													? 'z-20'
													: index === 0
														? '-left-4 -translate-y-2 -rotate-6'
														: index === 1
															? 'z-20 rotate-1'
															: 'right-0 translate-y-2 rotate-6'
											}`}>
											<img src={image.previewUrl} alt={`preview-${index}`} className='h-full w-full object-cover' />
										</div>
									) : null
								)}

								{images.length > 3 && (
									<div className='absolute right-4 -bottom-2 border border-[#233D4D] bg-[#233D4D] px-3 py-1 text-xs text-[#F5F1E8]'>共 {images.length} 张</div>
								)}
							</div>

							<div className='mt-3 flex items-center justify-between'>
								<span className='text-xs text-[#233D4D]/60'>已选择 {images.length} 张图片</span>
								<button
									type='button'
									onClick={() => fileInputRef.current?.click()}
									className='border border-[#233D4D] bg-[#F5F1E8] px-3 py-1.5 text-xs font-black text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
									继续添加
								</button>
							</div>
						</>
					)}
				</div>

				<div>
					<label className='mb-2 block text-xs font-black tracking-[0.12em] text-[#233D4D]/70'>描述（可选，应用于本次所有图片）</label>
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						placeholder='这组图片的说明...'
						className='w-full border border-[#233D4D] bg-[#F5F1E8] px-3 py-2 text-sm text-[#233D4D] focus:outline-none'
						rows={3}
					/>
				</div>

				<div className='mt-5 flex gap-3'>
					<button
						type='button'
						onClick={handleClose}
						className='flex-1 border border-[#233D4D] bg-[#F5F1E8] px-4 py-3 text-xs font-black tracking-[0.2em] text-[#233D4D] transition-colors hover:bg-[#233D4D] hover:text-[#F5F1E8]'>
						CANCEL
					</button>
					<button
						type='button'
						onClick={handleSubmit}
						className='flex-1 border border-[#233D4D] bg-[#233D4D] px-4 py-3 text-xs font-black tracking-[0.2em] text-[#F5F1E8] transition-colors hover:bg-[#F5F1E8] hover:text-[#233D4D]'>
						UPLOAD
					</button>
				</div>
			</div>
		</DialogModal>
	)
}
