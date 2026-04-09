'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Message } from '@/types';

type ConversationGroup = {
  property_id: string;
  property_title: string;
  property_city: string;
  messages: Message[];
  unread: number;
  last_message: Message;
};

export default function MessagesPage() {
  const [groups, setGroups] = useState<ConversationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllMessages();
  }, []);

  async function fetchAllMessages() {
    // Fetch all messages for all properties the agent has access to
    const res = await fetch('/api/messages/all');
    const json = await res.json();
    setGroups(json.groups || []);
    setLoading(false);
  }

  function timeAgo(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'עכשיו';
    if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דק׳`;
    if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שע׳`;
    return d.toLocaleDateString('he-IL');
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">הודעות</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-white font-medium mb-2">אין הודעות עדיין</h3>
          <p className="text-gray-500 text-sm">הודעות מלקוחות יופיעו כאן</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(group => (
            <Link
              key={group.property_id}
              href={`/properties/${group.property_id}?tab=messages`}
              className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-5 py-4 transition-colors"
            >
              {/* Unread badge */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-lg">
                  🏠
                </div>
                {group.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                    {group.unread}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-medium truncate">{group.property_title}</h3>
                  <span className="text-gray-500 text-xs flex-shrink-0 mr-2">
                    {timeAgo(group.last_message.created_at)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm truncate">
                  <span className="text-gray-500">{group.last_message.sender_name}: </span>
                  {group.last_message.message_text}
                </p>
                <p className="text-gray-600 text-xs mt-0.5">{group.property_city}</p>
              </div>

              <svg className="w-4 h-4 text-gray-600 flex-shrink-0 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
