'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { agent, organization } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">שלום, {agent?.full_name?.split(' ')[0] || 'סוכן'} 👋</h1>
        <p className="text-gray-400 mt-1">ברוך הבא למערכת ניהול הנכסים</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'נכסים פעילים', value: '0', icon: '🏠' },
          { label: 'הודעות חדשות', value: '0', icon: '💬' },
          { label: 'קישורים שנשלחו', value: '0', icon: '🔗' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Office Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">פעולות מהירות</h2>
          <div className="space-y-3">
            <Link href="/properties/new" className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-3 transition-colors">
              <span className="text-lg">＋</span>
              הוסף נכס חדש
            </Link>
            <Link href="/properties" className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-3 transition-colors">
              <span className="text-lg">🏘</span>
              צפה בכל הנכסים
            </Link>
            <Link href="/messages" className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-3 transition-colors">
              <span className="text-lg">💬</span>
              הודעות
            </Link>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">פרטי המשרד</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">שם המשרד</span>
              <span className="text-white">{organization?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">תפקיד</span>
              <span className="text-white">{agent?.role === 'admin' ? 'מנהל' : 'סוכן'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">אימייל</span>
              <span className="text-white">{agent?.email || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
