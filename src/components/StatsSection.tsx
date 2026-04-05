'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

interface Book {
  finished_at: string
  page_count: number
  price: number
}

interface Props {
  books: Book[]
}

function getMonthlyStats(books: Book[]) {
  const map: Record<string, { count: number; pages: number; amount: number }> = {}

  books.forEach((book) => {
    const month = book.finished_at?.slice(0, 7) // "YYYY-MM"
    if (!month) return
    if (!map[month]) map[month] = { count: 0, pages: 0, amount: 0 }
    map[month].count += 1
    map[month].pages += book.page_count ?? 0
    map[month].amount += book.price ?? 0
  })

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, stats]) => ({
      month: month.replace('-', '/'),
      冊数: stats.count,
      ページ数: stats.pages,
      金額: stats.amount,
    }))
}

export default function StatsSection({ books }: Props) {
  const monthlyData = getMonthlyStats(books)
  const totalBooks = books.length
  const totalPages = books.reduce((s, b) => s + (b.page_count ?? 0), 0)
  const totalAmount = books.reduce((s, b) => s + (b.price ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">{totalBooks}</p>
          <p className="text-xs text-gray-500 mt-1">読了冊数</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">{totalPages.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">総ページ数</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">¥{totalAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">総書籍費用</p>
        </div>
      </div>

      {/* グラフ */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">月別読了冊数（直近6ヶ月）</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="冊数" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">月別書籍費用（直近6ヶ月）</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => typeof v === 'number' ? `¥${v.toLocaleString()}` : v} />
              <Bar dataKey="金額" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
