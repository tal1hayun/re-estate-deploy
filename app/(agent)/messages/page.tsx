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

function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)', flexShrink: 0, opacity: 0.4 }}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

export default function MessagesPage() {
  const [groups, setGroups] = useState<ConversationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAllMessages() {
    const res = await fetch('/api/messages/all');
    const json = await res.json();
    setGroups(json.groups || []);
    setLoading(false);
  }

  useEffect(() => { fetchAllMessages(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

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
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--color-fg)',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}>
          הודעות
        </h1>
        {!loading && groups.length > 0 && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            {groups.reduce((acc, g) => acc + g.unread, 0)} הודעות שלא נקראו
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div className="spinner"/>
        </div>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.25 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 8 }}>
            אין הודעות עדיין
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            הודעות מלקוחות יופיעו כאן
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {groups.map((group, i) => (
            <Link
              key={group.property_id}
              href={`/properties/${group.property_id}?tab=messages`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                textDecoration: 'none',
                borderBottom: i < groups.length - 1 ? '1px solid var(--color-border-soft)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
            >
              {/* Avatar/badge */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 40, height: 40,
                  background: 'var(--color-accent-bg)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(46,168,223,0.15)',
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                {group.unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    minWidth: 18, height: 18,
                    background: 'var(--color-accent)',
                    borderRadius: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#040d11',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '0 4px',
                    border: '1.5px solid var(--color-surface)',
                  }}>
                    {group.unread}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <h3 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: group.unread > 0 ? 600 : 500,
                    color: 'var(--color-fg)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {group.property_title}
                  </h3>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-muted)',
                    fontWeight: 400,
                    flexShrink: 0,
                    marginRight: 8,
                  }}>
                    {timeAgo(group.last_message.created_at)}
                  </span>
                </div>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 300,
                  marginBottom: 2,
                }}>
                  <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>{group.last_message.sender_name}:</span>
                  {' '}{group.last_message.message_text}
                </p>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontWeight: 300 }}>
                  {group.property_city}
                </span>
              </div>

              <IconChevron />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
