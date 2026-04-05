import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, ArrowLeft, Trash2 } from 'lucide-react'
import DeleteBookButton from '@/components/DeleteBookButton'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!book) notFound()

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        本棚に戻る
      </Link>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex gap-4">
          {book.cover_image ? (
            <img src={book.cover_image} alt={book.title} className="w-20 h-28 object-cover rounded-xl shadow" />
          ) : (
            <div className="w-20 h-28 bg-amber-100 rounded-xl flex items-center justify-center text-3xl">📚</div>
          )}
          <div className="flex-1">
            <h1 className="font-bold text-gray-800 leading-tight">{book.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{book.author}</p>
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">読了日: {book.finished_at}</p>
            {book.page_count > 0 && <p className="text-xs text-gray-400">{book.page_count}ページ</p>}
            {book.price > 0 && <p className="text-xs text-gray-400">¥{book.price.toLocaleString()}</p>}
          </div>
        </div>
      </div>

      {book.impression && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">感想</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{book.impression}</p>
        </div>
      )}

      <DeleteBookButton bookId={book.id} />
    </div>
  )
}
