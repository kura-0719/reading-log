import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Star } from 'lucide-react'
import StatsSection from '@/components/StatsSection'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user!.id)
    .order('finished_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* 統計セクション */}
      <StatsSection books={books ?? []} />

      {/* 本棚 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">読んだ本</h2>
          <Link
            href="/dashboard/books/new"
            className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            記録する
          </Link>
        </div>

        {books && books.length > 0 ? (
          <div className="space-y-3">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/dashboard/books/${book.id}`}
                className="flex gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                {book.cover_image ? (
                  <img src={book.cover_image} alt={book.title} className="w-12 h-16 object-cover rounded-lg shadow" />
                ) : (
                  <div className="w-12 h-16 bg-amber-100 rounded-lg flex items-center justify-center text-amber-400 text-xs">📚</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{book.finished_at}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-500 text-sm">まだ記録した本がありません</p>
            <Link
              href="/dashboard/books/new"
              className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
            >
              最初の本を記録する
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
