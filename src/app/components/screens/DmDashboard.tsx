import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, RefreshCw, AlertCircle, CheckCircle2,
  Clock, Send, Users, X, Upload, Wifi, WifiOff,
  RotateCcw, ChevronDown, Instagram,
} from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { api } from '../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type JobStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'rate_limited';
type AccountStatus = 'active' | 'suspended' | 'needs_reauth';

interface IgAccount {
  username: string;
  display_name: string | null;
  status: AccountStatus;
  daily_limit: number;
  sent_today: number;
  last_reset: string;
  created_at: string;
}

interface DmJob {
  job_id: string;
  from_account: string | null;
  to_handle: string;
  message: string;
  campaign_id: string | null;
  lead_id: string | null;
  status: JobStatus;
  error: string | null;
  queued_at: string;
  sent_at: string | null;
  webhook_delivered: boolean;
  duration_ms: number | null;
}

interface DmStats {
  jobs: {
    total_jobs: string;
    sent: string;
    failed: string;
    queued: string;
    sending: string;
    rate_limited: string;
  };
  accounts: {
    total_accounts: string;
    active: string;
    suspended: string;
    needs_reauth: string;
    total_sent_today: string;
  };
  recent_jobs: DmJob[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(d: string | null): string {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const JOB_STATUS: Record<JobStatus, { label: string; color: string; bg: string; pulse?: boolean }> = {
  queued:       { label: 'Queued',       color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  sending:      { label: 'Sending',      color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', pulse: true },
  sent:         { label: 'Sent',         color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  failed:       { label: 'Failed',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  rate_limited: { label: 'Rate Limited', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
};

function JobBadge({ status }: { status: JobStatus }) {
  const m = JOB_STATUS[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: m.bg, color: m.color, borderRadius: 6,
      padding: '2px 8px', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      border: `1px solid ${m.color}30`,
    }}>
      {m.pulse && (
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color, animation: 'pulse 1.4s ease infinite' }} />
      )}
      {m.label}
    </span>
  );
}

const ACCT_STATUS: Record<AccountStatus, { color: string; label: string }> = {
  active:      { color: '#22c55e', label: 'Active' },
  suspended:   { color: '#ef4444', label: 'Suspended' },
  needs_reauth:{ color: '#f97316', label: 'Needs Reauth' },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon: Icon }: {
  label: string; value: string | number; color?: string; icon?: React.ElementType;
}) {
  return (
    <div style={{ background: '#383838', borderRadius: 14, border: '1px solid #4a4a4a', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Icon && <Icon size={14} strokeWidth={1.5} style={{ color: color || '#888' }} />}
      <div style={{ fontSize: 26, fontWeight: 700, color: color || '#e5e5e5', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

// ─── Cookie Import Modal ──────────────────────────────────────────────────────

interface CookieImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

function CookieImportModal({ onClose, onImported }: CookieImportModalProps) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dailyLimit, setDailyLimit] = useState(40);
  const [rawCookies, setRawCookies] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputStyle: React.CSSProperties = {
    background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10,
    padding: '9px 12px', fontSize: 12, color: '#e5e5e5', width: '100%',
    outline: 'none', fontFamily: 'inherit',
  };

  const handleImport = async () => {
    if (!username.trim()) { setError('Username is required.'); return; }
    if (!rawCookies.trim()) { setError('Paste the cookie JSON array.'); return; }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawCookies.trim());
    } catch {
      setError('Invalid JSON — paste the full cookie array from the extraction script.');
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      setError('Cookie data must be a non-empty JSON array.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.post('/dm/accounts', {
        username: username.trim(),
        display_name: displayName.trim() || undefined,
        daily_limit: dailyLimit,
        cookies: parsed,
      });
      onImported();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to register account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#2a2a2a', borderRadius: 20, border: '1px solid #444', padding: 28, width: 500, maxHeight: '92vh', overflowY: 'auto' }}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e5e5' }}>Add Instagram Account</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Import session cookies from a logged-in browser</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={16} /></button>
        </div>

        {/* How to get cookies */}
        <div style={{ background: '#333', borderRadius: 10, border: '1px solid #444', padding: '12px 14px', marginBottom: 18, fontSize: 11, color: '#999', lineHeight: 1.7 }}>
          <div style={{ color: '#d4a853', fontWeight: 700, marginBottom: 6, fontSize: 10, letterSpacing: '0.05em' }}>HOW TO EXTRACT COOKIES</div>
          Run this one-liner on the server, log in manually in the browser, then press Enter:
          <pre style={{ marginTop: 8, background: '#222', borderRadius: 6, padding: '8px 10px', fontSize: 10, color: '#aaa', overflowX: 'auto' }}>{`node /opt/ghostpost/scripts/extract-cookies.js`}</pre>
          Paste the output JSON array below.
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 11, color: '#888', fontWeight: 600, display: 'block', marginBottom: 5 }}>USERNAME</label>
              <input style={inputStyle} value={username} onChange={e => setUsername(e.target.value)} placeholder="your_ig_handle"
                onFocus={e => (e.target.style.borderColor = '#d4a853')} onBlur={e => (e.target.style.borderColor = '#4a4a4a')} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#888', fontWeight: 600, display: 'block', marginBottom: 5 }}>DISPLAY NAME (optional)</label>
              <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="My Main Account"
                onFocus={e => (e.target.style.borderColor = '#d4a853')} onBlur={e => (e.target.style.borderColor = '#4a4a4a')} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600, display: 'block', marginBottom: 5 }}>DAILY LIMIT</label>
            <input type="number" min={1} max={100} style={{ ...inputStyle, width: 100 }} value={dailyLimit}
              onChange={e => setDailyLimit(parseInt(e.target.value) || 40)}
              onFocus={e => (e.target.style.borderColor = '#d4a853')} onBlur={e => (e.target.style.borderColor = '#4a4a4a')} />
            <span style={{ fontSize: 10, color: '#666', marginLeft: 10 }}>DMs per day (Instagram's safe limit is ~50)</span>
          </div>

          <div>
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600, display: 'block', marginBottom: 5 }}>
              COOKIE JSON ARRAY
              <span style={{ fontWeight: 400, marginLeft: 8 }}>— paste output from the extraction script</span>
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: 130, resize: 'vertical', fontFamily: 'monospace', fontSize: 10, lineHeight: 1.5 }}
              value={rawCookies}
              onChange={e => setRawCookies(e.target.value)}
              placeholder='[{"name":"sessionid","value":"...","domain":".instagram.com",...}]'
              onFocus={e => (e.target.style.borderColor = '#d4a853')}
              onBlur={e => (e.target.style.borderColor = '#4a4a4a')}
            />
            {rawCookies.trim() && (() => {
              try { const p = JSON.parse(rawCookies); return Array.isArray(p) ? <div style={{ fontSize: 10, color: '#22c55e', marginTop: 4 }}>{p.length} cookies parsed</div> : null; }
              catch { return <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>Invalid JSON</div>; }
            })()}
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#f87171' }}>
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <GhostButton variant="ghost" size="md" fullWidth onClick={onClose}>Cancel</GhostButton>
            <GhostButton variant="gold" size="md" fullWidth onClick={handleImport} disabled={saving}>
              {saving ? 'Importing...' : 'Import Account'}
            </GhostButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Account card ─────────────────────────────────────────────────────────────

function AccountCard({ account, onStatusChange }: { account: IgAccount; onStatusChange: () => void }) {
  const { color, label } = ACCT_STATUS[account.status];
  const pct = account.daily_limit > 0 ? Math.min(100, Math.round((account.sent_today / account.daily_limit) * 100)) : 0;
  const barColor = pct > 85 ? '#ef4444' : pct > 60 ? '#f97316' : '#22c55e';
  const initials = (account.display_name || account.username).slice(0, 2).toUpperCase();

  const handleToggle = async () => {
    const next = account.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/dm/accounts/${account.username}`, { status: next });
      onStatusChange();
    } catch (err: any) {
      alert(err?.message || 'Failed to update account');
    }
  };

  return (
    <div style={{ background: '#383838', borderRadius: 14, border: '1px solid #4a4a4a', padding: '16px 16px 14px', position: 'relative' }}>
      <div className="flex items-start gap-3">
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#484848', border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa' }}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>@{account.username}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
              {label}
            </span>
          </div>
          {account.display_name && (
            <div style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>{account.display_name}</div>
          )}

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <div style={{ flex: 1, height: 4, background: '#4a4a4a', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap' }}>
              {account.sent_today} / {account.daily_limit}
            </span>
          </div>
          <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>Reset {timeAgo(account.last_reset)}</div>
        </div>
      </div>

      <button
        onClick={handleToggle}
        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4, borderRadius: 6 }}
        title={account.status === 'active' ? 'Suspend account' : 'Re-activate account'}
      >
        {account.status === 'active' ? <WifiOff size={12} /> : <Wifi size={12} />}
      </button>
    </div>
  );
}

// ─── Jobs filter bar ──────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<{ key: JobStatus | 'all'; label: string }> = [
  { key: 'all',          label: 'All' },
  { key: 'queued',       label: 'Queued' },
  { key: 'sending',      label: 'Sending' },
  { key: 'sent',         label: 'Sent' },
  { key: 'failed',       label: 'Failed' },
  { key: 'rate_limited', label: 'Rate Limited' },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function DmDashboard() {
  const [stats, setStats]           = useState<DmStats | null>(null);
  const [accounts, setAccounts]     = useState<IgAccount[]>([]);
  const [jobs, setJobs]             = useState<DmJob[]>([]);
  const [jobsTotal, setJobsTotal]   = useState(0);
  const [loading, setLoading]       = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState('');

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [retrying, setRetrying]     = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch functions ─────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get('/dm/stats');
      setStats(data);
    } catch (err) {
      console.error('[DmDashboard] stats error:', err);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await api.get('/dm/accounts');
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[DmDashboard] accounts error:', err);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50', skip: '0' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (campaignFilter.trim()) params.set('campaign_id', campaignFilter.trim());

      const data = await api.get(`/dm/jobs?${params}`);
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setJobsTotal(data.total ?? 0);
    } catch (err) {
      console.error('[DmDashboard] jobs error:', err);
    }
  }, [statusFilter, campaignFilter]);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchStats(), fetchAccounts(), fetchJobs()]);
    setLoading(false);
  }, [fetchStats, fetchAccounts, fetchJobs]);

  // ── Initial load + 5-second live poll ───────────────────────────────────────

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchStats();
      fetchJobs();
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchStats, fetchJobs]);

  // Re-fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Retry a failed job ───────────────────────────────────────────────────────

  const handleRetry = async (job: DmJob) => {
    setRetrying(job.job_id);
    try {
      // Re-queue by calling /api/dm/send with the same data
      await api.post('/dm/send', {
        instagram_handle: job.to_handle,
        message:          job.message,
        campaign_id:      job.campaign_id || undefined,
        from_account:     job.from_account || undefined,
      });
      await fetchAll();
    } catch (err: any) {
      alert(err?.message || 'Retry failed');
    } finally {
      setRetrying(null);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────

  const failedJobs = jobs.filter(j => j.status === 'failed' || j.status === 'rate_limited');
  const hasSending = jobs.some(j => j.status === 'sending' || j.status === 'queued');

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* ── 1. Stat bar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Queued"
          value={loading ? '—' : (parseInt(stats?.jobs?.queued || '0') + parseInt(stats?.jobs?.sending || '0')).toString()}
          color="#60a5fa"
          icon={Clock}
        />
        <StatCard
          label="Sending Now"
          value={loading ? '—' : stats?.jobs?.sending || '0'}
          color="#fbbf24"
          icon={Send}
        />
        <StatCard
          label="Sent Today"
          value={loading ? '—' : stats?.accounts?.total_sent_today || '0'}
          color="#22c55e"
          icon={CheckCircle2}
        />
        <StatCard
          label="Failed"
          value={loading ? '—' : stats?.jobs?.failed || '0'}
          color="#ef4444"
          icon={AlertCircle}
        />
      </div>

      {/* ── 2. Accounts panel ──────────────────────────────────────────────── */}
      <div style={{ background: '#2e2e2e', borderRadius: 16, border: '1px solid #404040', marginBottom: 20, overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: '1px solid #3a3a3a' }}>
          <div className="flex items-center gap-2.5">
            <Users size={14} strokeWidth={1.5} style={{ color: '#888' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Instagram Accounts</span>
            <span style={{ fontSize: 10, color: '#888', background: '#3a3a3a', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
              {stats?.accounts?.active || '0'} active
            </span>
          </div>
          <GhostButton
            variant="outline" size="sm"
            icon={<Plus size={11} strokeWidth={2.5} />}
            onClick={() => setShowAddAccount(true)}
          >
            Add Account
          </GhostButton>
        </div>

        <div style={{ padding: 14 }}>
          {accountsLoading ? (
            <div style={{ textAlign: 'center', padding: 28, color: '#666', fontSize: 12 }}>Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#666' }}>
              <Instagram size={24} style={{ margin: '0 auto 10px', color: '#555' }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: '#777', marginBottom: 6 }}>No accounts registered</div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>Add an Instagram account to start sending DMs.</div>
              <GhostButton variant="outline" size="sm" icon={<Plus size={11} strokeWidth={2.5} />} onClick={() => setShowAddAccount(true)}>
                Add Account
              </GhostButton>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {accounts.map(a => (
                <AccountCard key={a.username} account={a} onStatusChange={fetchAccounts} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Live jobs table ─────────────────────────────────────────────── */}
      <div style={{ background: '#2e2e2e', borderRadius: 16, border: '1px solid #404040', marginBottom: 20, overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: '1px solid #3a3a3a', flexWrap: 'wrap', gap: 10 }}>
          <div className="flex items-center gap-2.5">
            <Send size={14} strokeWidth={1.5} style={{ color: '#888' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Live Jobs</span>
            <span style={{ fontSize: 10, color: '#888', background: '#3a3a3a', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
              {jobsTotal} total
            </span>
            {hasSending && (
              <span style={{ fontSize: 9, color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fbbf24', animation: 'pulse 1.4s ease infinite' }} />
                LIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter pills */}
            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  style={{
                    background: statusFilter === f.key ? 'rgba(212,168,83,0.12)' : 'transparent',
                    color: statusFilter === f.key ? '#d4a853' : '#888',
                    border: statusFilter === f.key ? '1px solid rgba(212,168,83,0.25)' : '1px solid #404040',
                    borderRadius: 7, padding: '4px 10px', fontSize: 10, fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.03em',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Campaign filter */}
            <input
              type="text"
              value={campaignFilter}
              onChange={e => setCampaignFilter(e.target.value)}
              placeholder="Filter campaign..."
              style={{
                background: '#333', border: '1px solid #444', borderRadius: 8,
                padding: '4px 10px', fontSize: 11, color: '#ccc', outline: 'none', width: 140,
              }}
              onFocus={e => (e.target.style.borderColor = '#d4a853')}
              onBlur={e => (e.target.style.borderColor = '#444')}
            />

            <button
              onClick={() => fetchJobs()}
              style={{ background: 'none', border: '1px solid #404040', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', color: '#777', display: 'flex', alignItems: 'center' }}
              title="Refresh"
            >
              <RefreshCw size={11} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666', fontSize: 12 }}>
            No jobs found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#353535', borderBottom: '1px solid #404040' }}>
                  {['Handle', 'Message', 'Account', 'Campaign', 'Status', 'Queued', 'Sent', ''].map((col, i) => (
                    <th key={i} style={{ padding: '9px 14px', textAlign: 'left', color: '#777', fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.job_id} style={{ borderBottom: '1px solid #383838' }}>
                    <td style={{ padding: '10px 14px', color: '#d4a853', fontWeight: 700, whiteSpace: 'nowrap' }}>@{job.to_handle}</td>
                    <td style={{ padding: '10px 14px', color: '#aaa', maxWidth: 200 }}>
                      <span title={job.message}>{truncate(job.message, 55)}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#888', whiteSpace: 'nowrap' }}>
                      {job.from_account ? `@${job.from_account}` : <span style={{ color: '#555' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#888', whiteSpace: 'nowrap' }}>
                      {job.campaign_id ? truncate(job.campaign_id, 20) : <span style={{ color: '#555' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <JobBadge status={job.status} />
                    </td>
                    <td style={{ padding: '10px 14px', color: '#666', whiteSpace: 'nowrap' }}>{timeAgo(job.queued_at)}</td>
                    <td style={{ padding: '10px 14px', color: '#666', whiteSpace: 'nowrap' }}>{job.sent_at ? timeAgo(job.sent_at) : <span style={{ color: '#444' }}>—</span>}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {(job.status === 'failed' || job.status === 'rate_limited') && (
                        <button
                          onClick={() => handleRetry(job)}
                          disabled={retrying === job.job_id}
                          title="Retry this job"
                          style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: '#d4a853', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, opacity: retrying === job.job_id ? 0.5 : 1 }}
                        >
                          <RotateCcw size={9} strokeWidth={2} />
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Failed jobs panel ────────────────────────────────────────────── */}
      {failedJobs.length > 0 && statusFilter === 'all' && (
        <div style={{ background: '#2e2e2e', borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden' }}>
          <div className="flex items-center gap-2.5" style={{ padding: '13px 18px', borderBottom: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)' }}>
            <AlertCircle size={14} strokeWidth={1.5} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>Failed Jobs</span>
            <span style={{ fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.12)', borderRadius: 6, padding: '2px 7px', fontWeight: 700 }}>
              {failedJobs.length}
            </span>
          </div>

          <div style={{ padding: 14 }} className="space-y-2">
            {failedJobs.map(job => (
              <div key={job.job_id} style={{ background: '#333', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)', padding: '12px 14px' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#d4a853' }}>@{job.to_handle}</span>
                      <JobBadge status={job.status} />
                      {job.campaign_id && (
                        <span style={{ fontSize: 10, color: '#777', background: '#3a3a3a', padding: '1px 6px', borderRadius: 4 }}>{job.campaign_id}</span>
                      )}
                      <span style={{ fontSize: 10, color: '#555' }}>{timeAgo(job.queued_at)}</span>
                    </div>
                    {job.error && (
                      <div style={{ fontSize: 11, color: '#f87171', lineHeight: 1.5, background: 'rgba(239,68,68,0.06)', borderRadius: 6, padding: '6px 8px', marginTop: 4 }}>
                        {job.error}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: '#666', marginTop: 6 }}>
                      {truncate(job.message, 80)}
                    </div>
                  </div>

                  <GhostButton
                    variant="accent" size="sm"
                    icon={<RotateCcw size={10} strokeWidth={2} />}
                    disabled={retrying === job.job_id}
                    onClick={() => handleRetry(job)}
                  >
                    {retrying === job.job_id ? 'Retrying...' : 'Retry'}
                  </GhostButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showAddAccount && (
        <CookieImportModal
          onClose={() => setShowAddAccount(false)}
          onImported={fetchAccounts}
        />
      )}
    </div>
  );
}
