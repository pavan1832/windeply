'use client';
import { useEffect, useState, useRef } from 'react';
import { api, Log } from '../../lib/api';
import { PageHeader, Spinner, EmptyState } from '../../components/ui';

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const params: Record<string, string> = { limit: '300' };
      if (filterLevel) params.level = filterLevel;
      if (search) params.search = search;
      const data = await api.getLogs(params);
      setLogs(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterLevel, search]);

  useEffect(() => {
    if (!autoRefresh) return;
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [autoRefresh, filterLevel, search]);

  const levelColors: Record<string, string> = {
    info: 'text-terminal-accent',
    warn: 'text-terminal-yellow',
    error: 'text-terminal-red',
    debug: 'text-terminal-muted',
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="Audit Logs"
        subtitle={`${logs.length} entries`}
        action={
          <button
            onClick={() => setAutoRefresh(a => !a)}
            className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${
              autoRefresh
                ? 'border-terminal-green text-terminal-green bg-terminal-green/10'
                : 'border-terminal-border text-terminal-muted'
            }`}
          >
            {autoRefresh ? '● LIVE' : '○ PAUSED'}
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-terminal-surface border border-terminal-border text-terminal-text rounded px-3 py-2 font-mono text-sm placeholder-terminal-muted focus:outline-none focus:border-terminal-accent"
        />
        <div className="flex gap-1">
          {['', 'info', 'warn', 'error', 'debug'].map(l => (
            <button
              key={l}
              onClick={() => setFilterLevel(l)}
              className={`px-3 py-2 text-xs font-mono rounded border transition-all ${
                filterLevel === l
                  ? 'border-terminal-accent text-terminal-accent bg-terminal-accent/10'
                  : 'border-terminal-border text-terminal-muted hover:border-terminal-muted'
              }`}
            >
              {l || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {/* Log Terminal */}
      <div className="terminal-card p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-terminal-border bg-black/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-terminal-red/60"></div>
            <div className="w-3 h-3 rounded-full bg-terminal-yellow/60"></div>
            <div className="w-3 h-3 rounded-full bg-terminal-green/60"></div>
          </div>
          <div className="text-xs font-mono text-terminal-muted ml-2">windeply-log-viewer — bash</div>
          <div className="ml-auto text-xs font-mono text-terminal-muted">{logs.length} lines</div>
        </div>

        <div className="log-terminal h-[calc(100vh-320px)] overflow-y-auto p-4 rounded-none">
          {logs.length === 0 ? (
            <EmptyState message="No log entries match your criteria." />
          ) : (
            <>
              {logs.map((log, i) => (
                <div
                  key={log.id}
                  className={`flex gap-3 py-0.5 hover:bg-white/3 rounded px-1 transition-colors ${
                    log.level === 'error' ? 'bg-terminal-red/5' : ''
                  }`}
                >
                  <span className="text-terminal-muted shrink-0 text-xs tabular-nums w-20">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                  <span className="text-terminal-muted shrink-0 text-xs w-5 text-center tabular-nums opacity-50">
                    {(logs.length - i).toString().padStart(3, '0')}
                  </span>
                  <span className={`shrink-0 font-bold uppercase text-xs w-14 ${levelColors[log.level] || levelColors.info}`}>
                    [{log.level}]
                  </span>
                  {log.machine_name && (
                    <span className="text-terminal-muted shrink-0 text-xs w-28 truncate font-mono">
                      {log.machine_name}
                    </span>
                  )}
                  {log.step_name && (
                    <span className="text-terminal-muted shrink-0 text-xs hidden lg:block">
                      [{log.step_name}]
                    </span>
                  )}
                  <span className={`${
                    log.level === 'error' ? 'text-terminal-red' :
                    log.level === 'warn' ? 'text-terminal-yellow' :
                    'text-terminal-text'
                  } flex-1`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
