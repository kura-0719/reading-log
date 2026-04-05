'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export default function DeleteBookButton({ bookId }: { bookId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('books').delete().eq('id', bookId)
    router.push('/dashboard')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm flex gap-3">
        <p className="flex-1 text-sm text-gray-600">この記録を削除しますか？</p>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border"
        >
          キャンセル
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          {deleting ? '削除中...' : '削除'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition"
    >
      <Trash2 className="w-4 h-4" />
      この記録を削除する
    </button>
  )
}
