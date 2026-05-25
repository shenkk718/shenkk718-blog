import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

type NoteItem = {
	id: string
	content: string
	createdAt: string
}

type SaveNotesPayload = {
	notes?: NoteItem[]
}

const notesListPath = path.join(process.cwd(), 'src', 'app', 'notes', 'list.json')

function isValidNote(note: NoteItem) {
	return Boolean(note.id && note.content?.trim() && note.createdAt)
}

export async function POST(request: NextRequest) {
	try {
		const payload = (await request.json()) as SaveNotesPayload
		const notes = Array.isArray(payload.notes) ? payload.notes.filter(isValidNote) : []

		await mkdir(path.dirname(notesListPath), { recursive: true })
		await writeFile(notesListPath, JSON.stringify(notes, null, '\t') + '\n', 'utf8')

		return NextResponse.json({ message: '保存成功', count: notes.length })
	} catch (error: any) {
		return NextResponse.json({ message: error?.message || '保存失败' }, { status: 500 })
	}
}
