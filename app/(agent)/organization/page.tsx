'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Agent } from '@/types';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 8 }}>
        {children}
      </h2>
      <div style={{ height: 1, background: 'var(--color-border)' }}/>
    </div>
  );
}

export default function OrganizationPage() {
  const { agent: currentAgent, organization } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [catalogCopied, setCatalogCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [deleteProperties, setDeleteProperties] = useState(false);

  const isAdmin = currentAgent?.role === 'admin';

  async function fetchAgents() {
    const res = await fetch('/api/organization/agents');
    const json = await res.json();
    setAgents(json.agents || []);
    setLoading(false);
  }

  useEffect(() => { fetchAgents(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  async function generateInvite() {
    setGenerating(true);
    const res = await fetch('/api/invites', { method: 'POST' });
    const json = await res.json();
    setInviteUrl(json.inviteUrl || '');
    setGenerating(false);
  }

  async function removeAgent(agentId: string) {
    setRemovingId(agentId);
    const res = await fetch(
      `/api/organization/agents/${agentId}?deleteProperties=${deleteProperties}`,
      { method: 'DELETE' }
    );
    setRemovingId(null);
    setConfirmRemoveId(null);
    setDeleteProperties(false);
    if (res.ok) fetchAgents();
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const catalogUrl = typeof window !== 'undefined' && organization
    ? `${window.location.origin}/org/${organization.id}`
    : '';

  async function copyCatalog() {
    if (!catalogUrl) return;
    await navigator.clipboard.writeText(catalogUrl);
    setCatalogCopied(true);
    setTimeout(() => setCatalogCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--color-fg)',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}>
          הארגון שלי
        </h1>
        {organization && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 300 }}>
            {organization.name}
          </p>
        )}
      </div>

      {/* Org Details */}
      <div style={{ marginBottom: 40 }}>
        <SectionTitle>פרטי המשרד</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'שם המשרד', value: organization?.name || '—' },
            { label: 'התפקיד שלי', value: isAdmin ? 'מנהל' : 'סוכן', isRole: true },
            { label: 'אימייל יצירת קשר', value: organization?.contact_email || '—', ltr: true },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--color-border-soft)' : 'none',
              }}
            >
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 400 }}>
                {row.label}
              </span>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: row.isRole ? 600 : 500,
                color: row.isRole && isAdmin ? 'var(--color-accent)' : 'var(--color-fg)',
                direction: row.ltr ? 'ltr' : 'rtl',
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agents */}
      <div style={{ marginBottom: 40 }}>
        <SectionTitle>סוכנים ({agents.length})</SectionTitle>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <div className="spinner"/>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {agents.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < agents.length - 1 ? '1px solid var(--color-border-soft)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--color-accent)',
                    flexShrink: 0,
                  }}>
                    {a.full_name.charAt(0)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-fg)' }}>
                        {a.full_name}
                      </span>
                      {a.user_id === currentAgent?.user_id && (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>(אני)</span>
                      )}
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontWeight: 300 }}>
                      {a.email}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={a.role === 'admin' ? 'status-active' : 'status-inactive'}
                    style={{
                      background: a.role === 'admin' ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                      padding: '3px 10px',
                      borderRadius: 4,
                      letterSpacing: '0.06em',
                    }}>
                    {a.role === 'admin' ? 'מנהל' : 'סוכן'}
                  </span>

                  {/* Remove button — admin only, not self, not other admins */}
                  {isAdmin && a.user_id !== currentAgent?.user_id && a.role !== 'admin' && (
                    confirmRemoveId === a.id ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 8,
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}>
                        {/* Sub-option: delete properties */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          cursor: 'pointer',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-secondary)',
                          userSelect: 'none',
                        }}>
                          <input
                            type="checkbox"
                            checked={deleteProperties}
                            onChange={e => setDeleteProperties(e.target.checked)}
                            style={{ accentColor: 'var(--color-danger)', cursor: 'pointer' }}
                          />
                          מחק גם את הנכסים של הסוכן
                        </label>
                        {!deleteProperties && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontWeight: 300 }}>
                            הנכסים יועברו אליך
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => removeAgent(a.id)}
                            disabled={removingId === a.id}
                            style={{
                              padding: '3px 10px',
                              borderRadius: 4,
                              border: 'none',
                              background: 'var(--color-danger-bg)',
                              color: 'var(--color-danger)',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            {removingId === a.id ? '...' : 'אשר הסרה'}
                          </button>
                          <button
                            onClick={() => { setConfirmRemoveId(null); setDeleteProperties(false); }}
                            style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--color-muted)',
                              fontSize: 'var(--text-xs)',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setConfirmRemoveId(a.id); setDeleteProperties(false); }}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 4,
                          border: '1px solid var(--color-border)',
                          background: 'transparent',
                          color: 'var(--color-muted)',
                          fontSize: 'var(--text-xs)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(240,104,120,0.4)';
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
                        }}
                      >
                        הסר
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Catalog */}
      <div style={{ marginBottom: 40 }}>
        <SectionTitle>קטלוג ציבורי</SectionTitle>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 300, marginBottom: 20, lineHeight: 1.65 }}>
          שתף קישור זה עם לקוחות — הם יוכלו לצפות בכל הנכסים הפעילים של המשרד.
        </p>
        {catalogUrl && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '10px 14px',
          }}>
            <span style={{
              flex: 1, fontSize: 'var(--text-xs)', color: 'var(--color-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              direction: 'ltr', fontFamily: 'monospace',
            }}>
              {catalogUrl}
            </span>
            <a
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 6,
                border: '1px solid var(--color-border)',
                background: 'transparent', color: 'var(--color-secondary)',
                fontSize: 'var(--text-xs)', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none',
              }}
            >
              פתח
            </a>
            <button
              onClick={copyCatalog}
              style={{
                flexShrink: 0, padding: '5px 14px', borderRadius: 6, border: 'none',
                background: catalogCopied ? 'var(--color-success-bg)' : 'var(--color-surface-3)',
                color: catalogCopied ? 'var(--color-success)' : 'var(--color-fg)',
                fontSize: 'var(--text-xs)', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {catalogCopied ? 'הועתק ✓' : 'העתק'}
            </button>
          </div>
        )}
      </div>

      {/* Invite (admin only) */}
      {isAdmin && (
        <div>
          <SectionTitle>הזמן סוכן חדש</SectionTitle>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 300, marginBottom: 20, lineHeight: 1.65 }}>
            צור קישור הזמנה ושלח לסוכן החדש. הקישור תקף ל-7 ימים.
          </p>

          {!inviteUrl ? (
            <button
              onClick={generateInvite}
              disabled={generating}
              className="btn-primary"
              style={{ fontSize: 'var(--text-sm)', padding: '10px 20px' }}
            >
              {generating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}/>
                  מייצר...
                </span>
              ) : '+ צור קישור הזמנה'}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                <span style={{
                  flex: 1,
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  direction: 'ltr',
                  fontFamily: 'monospace',
                }}>
                  {inviteUrl}
                </span>
                <button
                  onClick={copyInvite}
                  style={{
                    flexShrink: 0,
                    padding: '5px 14px',
                    borderRadius: 6,
                    border: 'none',
                    background: copied ? 'var(--color-success-bg)' : 'var(--color-surface-3)',
                    color: copied ? 'var(--color-success)' : 'var(--color-fg)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {copied ? 'הועתק ✓' : 'העתק'}
                </button>
              </div>
              <button
                onClick={generateInvite}
                disabled={generating}
                className="btn-link"
                style={{ textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}
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
