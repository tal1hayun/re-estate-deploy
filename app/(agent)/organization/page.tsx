'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Agent, Organization } from '@/types';

export default function OrganizationPage() {
  const { agent: currentAgent, organization } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAdmin = currentAgent?.role === 'admin';

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    const res = await fetch('/api/organization/agents');
    const json = await res.json();
    setAgents(json.agents || []);
    setLoading(false);
  }

  async function generateInvite() {
    setGenerating(true);
    const res = await fetch('/api/invites', { method: 'POST' });
    const json = await res.json();
    setInviteUrl(json.inviteUrl || '');
    setGenerating(false);
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">הארגון שלי</h1>

      {/* Org details */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold text-lg mb-4">פרטי המשרד</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">שם המשרד</span>
            <span className="text-white text-sm">{organization?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">התפקיד שלי</span>
            <span className={`text-sm px-2 py-0.5 rounded-full ${isAdmin ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
              {isAdmin ? 'מנהל' : 'סוכן'}
            </span>
          </div>
        </div>
      </div>

      {/* Agents list */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold text-lg mb-4">
          סוכנים ({agents.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {agents.map(a => (
              <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {a.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{a.full_name}</span>
                      {a.user_id === currentAgent?.user_id && (
                        <span className="text-xs text-gray-500">(אני)</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs">{a.email}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.role === 'admin' ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                  {a.role === 'admin' ? 'מנהל' : 'סוכן'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite (admin only) */}
      {isAdmin && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-2">הזמן סוכן חדש</h2>
          <p className="text-gray-500 text-sm mb-4">
            צור קישור הזמנה ושלח לסוכן החדש. הקישור תקף ל-7 ימים.
          </p>

          {!inviteUrl ? (
            <button
              onClick={generateInvite}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {generating ? 'מייצר...' : '+ צור קישור הזמנה'}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center gap-3">
                <span className="text-gray-300 text-sm flex-1 truncate font-mono">{inviteUrl}</span>
                <button
                  onClick={copyInvite}
                  className={`flex-shrink-0 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    copied ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {copied ? 'הועתק ✓' : 'העתק'}
                </button>
              </div>
              <button
                onClick={generateInvite}
                disabled={generating}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                צור קישור חדש
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
