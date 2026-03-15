'use client';

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, User } from 'lucide-react';
import apiClient from '@/lib/apiClient';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {}
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/subjects" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
            <BookOpen className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">LearnSpace</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/subjects" className="text-gray-600 hover:text-gray-900 font-medium">Browse Courses</Link>
            {user ? (
              <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
                <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-medium">{user.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
