export async function deleteLocalBlog(slug: string): Promise<void> {
	if (!slug) throw new Error('缺少 slug，无法删除')

	const response = await fetch(`/api/local-blog?slug=${encodeURIComponent(slug)}`, {
		method: 'DELETE'
	})

	const result = await response.json().catch(() => null)

	if (!response.ok) {
		throw new Error(result?.message || '删除本地文章失败')
	}
}
