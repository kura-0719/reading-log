import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Star, BookOpen } from 'lucide-react'

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', profile.id)
    .order('finished_at', { ascending: false })

  const totalBooks = books?.length ?? 0
  const totalPages = books?.reduce((s, b) => s + (b.page_count ?? 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">{profile.display_name ?? profile.username}</h1>
          <p className="text-sm text-gray-400">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>}

          <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{totalBooks}</p>
              <p className="text-xs text-gray-500">読了冊数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{totalPages.toLocaleString()}</p>
              <p className="text-xs text-gray-500">総ページ数</p>
            </div>
          </div>
        </div>

        {/* 本棚 */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">読んだ本</h2>
          {books && books.length > 0 ? (
            <div className="space-y-3">
              {books.map((book) => (
                <div key={book.id} className="flex gap-3 bg-white rounded-2xl p-4 shadow-sm">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} className="w-12 h-16 object-cover rounded-lg shadow" />
                  ) : (
                    <div className="w-12 h-16 bg-amber-100 rounded-lg flex items-center justify-center text-amber-400">📚</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{book.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
                    <div className="flex gap-0.5 mt-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    {book.impression && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{book.impression}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{book.finished_at}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <p className="text-gray-400 text-sm">まだ記録した本がありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
