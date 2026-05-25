import { useCallback } from 'react'
import { toast } from 'sonner'
import { useWriteStore } from '../stores/write-store'
import { saveLocalBlog } from '../services/save-local-blog'
import { deleteLocalBlog } from '../services/delete-local-blog'

export function usePublish() {
	const { loading, setLoading, form, cover, images, mode, originalSlug } = useWriteStore()

	const onPublish = useCallback(async () => {
		try {
			setLoading(true)
			await saveLocalBlog({
				form,
				cover,
				images,
				mode,
				originalSlug
			})

			const successMsg = mode === 'edit' ? '更新到本地成功' : '保存到本地成功'
			toast.success(successMsg)
		} catch (err: any) {
			console.error(err)
			toast.error(err?.message || '操作失败')
		} finally {
			setLoading(false)
		}
	}, [form, cover, images, mode, originalSlug, setLoading])

	const onDelete = useCallback(async () => {
		const targetSlug = originalSlug || form.slug
		if (!targetSlug) {
			toast.error('缺少 slug，无法删除')
			return
		}
		try {
			setLoading(true)
			await deleteLocalBlog(targetSlug)
			toast.success('删除本地文章成功')
		} catch (err: any) {
			console.error(err)
			toast.error(err?.message || '删除失败')
		} finally {
			setLoading(false)
		}
	}, [form.slug, originalSlug, setLoading])

	return {
		loading,
		onPublish,
		onDelete
	}
}
