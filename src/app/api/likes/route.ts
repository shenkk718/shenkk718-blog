import { NextRequest, NextResponse } from 'next/server'

const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''
const LIKE_KEY_PREFIX = 'likes:'
const RATE_LIMIT_KEY_PREFIX = 'like-rate:'

function json(data: unknown, status = 200) {
	return NextResponse.json(data, { status })
}

function normalizeSlug(slug: string | null) {
	return (slug || 'site').trim().slice(0, 160) || 'site'
}

function getClientIp(request: NextRequest) {
	return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous'
}

async function redisCommand<T>(command: Array<string | number>): Promise<T> {
	if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
		throw new Error('Vercel KV is not configured')
	}

	const res = await fetch(KV_REST_API_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${KV_REST_API_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(command),
		cache: 'no-store'
	})

	const data = await res.json().catch(() => ({}))
	if (!res.ok || data?.error) {
		throw new Error(data?.error || `Redis request failed (${res.status})`)
	}

	return data.result as T
}

export async function GET(request: NextRequest) {
	try {
		const slug = normalizeSlug(request.nextUrl.searchParams.get('slug'))
		const count = await redisCommand<string | number | null>(['GET', `${LIKE_KEY_PREFIX}${slug}`])

		return json({ count: Number(count || 0) })
	} catch (error: any) {
		return json({ count: 0, message: error?.message || 'Failed to get likes' }, KV_REST_API_URL && KV_REST_API_TOKEN ? 500 : 200)
	}
}

export async function POST(request: NextRequest) {
	try {
		const slug = normalizeSlug(request.nextUrl.searchParams.get('slug'))
		const ip = getClientIp(request)
		const today = new Date().toISOString().slice(0, 10)
		const rateKey = `${RATE_LIMIT_KEY_PREFIX}${slug}:${ip}:${today}`

		const alreadyLiked = await redisCommand<number>(['SETNX', rateKey, '1'])
		if (!alreadyLiked) {
			const count = await redisCommand<string | number | null>(['GET', `${LIKE_KEY_PREFIX}${slug}`])
			return json({ count: Number(count || 0), reason: 'rate_limited' })
		}

		await redisCommand<number>(['EXPIRE', rateKey, 60 * 60 * 24])
		const count = await redisCommand<number>(['INCR', `${LIKE_KEY_PREFIX}${slug}`])

		return json({ count })
	} catch (error: any) {
		return json({ message: error?.message || 'Failed to like' }, 500)
	}
}
