'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, BarChart2, PlusCircle, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  username: string
}

export default function Navbar({ username }: NavbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-amber-600">
          <BookOpen className="w-5 h-5" />
          <span>読書ログ</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">統計</span>
          </Link>
          <Link
            href="/dashboard/books/new"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">記録</span>
          </Link>
          <Link
            href={`/${username}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">公開ページ</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-red-500 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  )
}
