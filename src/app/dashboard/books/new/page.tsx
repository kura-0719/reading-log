'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Star, X } from 'lucide-react'

interface BookInfo {
  title: string
  author: string
  isbn: string
  cover_image: string
  page_count: number
  price: number
}

export default function NewBookPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BookInfo[]>([])
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null)
  const [searching, setSearching] = useState(false)

  const [rating, setRating] = useState(0)
  const [impression, setImpression] = useState('')
  const [finishedAt, setFinishedAt] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const searchBooks = async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearchResults([])

    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=8`
      )
      const data = await res.json()

      const books: BookInfo[] = (data.items ?? []).map((item: any) => {
        const info = item.volumeInfo
        const isbns: any[] = info.industryIdentifiers ?? []
        const isbn13 = isbns.find((i: any) => i.type === 'ISBN_13')?.identifier ?? ''
        return {
          title: info.title ?? '',
          author: (info.authors ?? []).join(', '),
          isbn: isbn13,
          cover_image: info.imageLinks?.thumbnail?.replace('http:', 'https:') ?? '',
          page_count: info.pageCount ?? 0,
          price: item.saleInfo?.listPrice?.amount ?? 0,
        }
      })
      setSearchResults(books)
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBook) return
    if (rating === 0) { setError('評価を選択してください'); return }

    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    const { error: insertError } = await supabase.from('books').insert({
      user_id: profile!.id,
      title: selectedBook.title,
      author: selectedBook.author,
      isbn: selectedBook.isbn,
      cover_image: selectedBook.cover_image,
      page_count: selectedBook.page_count,
      price: selectedBook.price,
      rating,
      impression,
      finished_at: finishedAt,
    })

    if (insertError) {
      setError('登録に失敗しました')
      setSubmitting(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">読んだ本を記録する</h1>

      {/* 書籍検索 */}
      {!selectedBook && (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-700">本を検索</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
              placeholder="タイトル・著者名・ISBNで検索"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={searchBooks}
              disabled={searching}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {searching && <p className="text-sm text-gray-400 text-center py-4">検索中...</p>}

          <div className="space-y-2">
            {searchResults.map((book, i) => (
              <button
                key={i}
                onClick={() => setSelectedBook(book)}
                className="w-full flex gap-3 items-start p-3 rounded-xl hover:bg-amber-50 transition text-left border border-transparent hover:border-amber-200"
              >
                {book.cover_image ? (
                  <img src={book.cover_image} alt={book.title} className="w-10 h-14 object-cover rounded" />
                ) : (
                  <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                )}
                <div>
                  <p className="font-medium text-sm text-gray-800 leading-tight">{book.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                  {book.page_count > 0 && <p className="text-xs text-gray-400">{book.page_count}ページ</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 選択した本の情報 */}
      {selectedBook && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex gap-3 items-start">
              {selectedBook.cover_image ? (
                <img src={selectedBook.cover_image} alt={selectedBook.title} className="w-14 h-20 object-cover rounded-lg shadow" />
              ) : (
                <div className="w-14 h-20 bg-gray-100 rounded-lg" />
              )}
              <div className="flex-1">
                <p className="font-bold text-gray-800">{selectedBook.title}</p>
                <p className="text-sm text-gray-500">{selectedBook.author}</p>
                {selectedBook.page_count > 0 && <p className="text-xs text-gray-400 mt-1">{selectedBook.page_count}ページ</p>}
                {selectedBook.price > 0 && <p className="text-xs text-gray-400">¥{selectedBook.price.toLocaleString()}</p>}
              </div>
              <button
                type="button"
                onClick={() => { setSelectedBook(null); setSearchResults([]) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            {/* 読了日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">読了日</label>
              <input
                type="date"
                value={finishedAt}
                onChange={(e) => setFinishedAt(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* 評価 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">評価</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 感想 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">感想</label>
              <textarea
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                rows={4}
                placeholder="読んでみての感想を書いてみましょう..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? '保存中...' : '記録する'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
