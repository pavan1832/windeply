'use client';
import { ReactNode } from 'react';

// Status Badge
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: 'bg-terminal-green/10 text-terminal-green border border-terminal-green/20',
    failed: 'bg-terminal-red/10 text-terminal-red border border-terminal-red/20',
    running: 'bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/20',
    pending: 'bg-terminal-yellow/10 text-terminal-yellow border border-terminal-yellow/20',
    cancelled: 'bg-terminal-muted/10 text-terminal-muted border border-terminal-muted/20',
    online: 'bg-terminal-green/10 text-terminal-green border border-terminal-green/20',
    offline: 'bg-terminal-red/10 text-terminal-red border border-terminal-red/20',
    deploying: 'bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/20',
    unknown: 'bg-terminal-muted/10 text-terminal-muted border border-terminal-muted/20',
  };
  return (
    <span className={`status-badge ${map[status] || map.unknown}`}>
      {status}
    </span>
  );
}

// Stat Card
export function StatCard({ label, value, color, icon, sub }: {
  label: string; value: string | number; color: string; icon: string; sub?: string;
}) {
  const borderMap: Record<string, string> = {
    accent: 'border-terminal-accent/40',
    green: 'border-terminal-green/40',
    red: 'border-terminal-red/40',
    yellow: 'border-terminal-yellow/40',
    muted: 'border-terminal-muted/40',
  };
  const textMap: Record<string, string> = {
    accent: 'text-terminal-accent',
    green: 'text-terminal-green',
    red: 'text-terminal-red',
    yellow: 'text-terminal-yellow',
    muted: 'text-terminal-muted',
  };
  return (
    <div className={`terminal-card border-l-2 ${borderMap[color]} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-terminal-muted text-xs font-mono uppercase tracking-widest mb-2">{label}</div>
          <div className={`text-3xl font-display font-bold ${textMap[color]}`}>{value}</div>
          {sub && <div className="text-terminal-muted text-xs mt-1 font-mono">{sub}</div>}
        </div>
        <div className="text-2xl opacity-40">{icon}</div>
      </div>
    </div>
  );
}

// Progress Steps
export function DeploymentProgress({ current, total, steps }: { current: number; total: number; steps?: string[] }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const defaultSteps = ['Initialize', 'OS Config', 'Software', 'Security', 'Finalize'];
  const stepLabels = steps || defaultSteps;

  return (
    <div>
      <div className="flex justify-between text-xs font-mono text-terminal-muted mb-2">
        <span>Progress</span>
        <span className="text-terminal-accent">{pct}%</span>
      </div>
      <div className="progress-bar mb-4">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-1">
        {stepLabels.map((step, i) => (
          <div key={i} className="flex-1 text-center">
            <div className={`h-1 rounded mb-1 transition-all ${
              i < current ? 'bg-terminal-green' :
              i === current ? 'bg-terminal-accent animate-pulse' :
              'bg-terminal-border'
            }`} />
            <div className={`text-xs font-mono truncate ${
              i < current ? 'text-terminal-green' :
              i === current ? 'text-terminal-accent' :
              'text-terminal-muted'
            }`}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Page Header
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-display font-bold text-white">{title}</h1>
        {subtitle && <p className="text-terminal-muted text-sm font-mono mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Button
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'danger' | 'ghost' | 'secondary';
  size?: 'sm' | 'md'; disabled?: boolean; className?: string;
}) {
  const variants = {
    primary: 'bg-terminal-accent text-terminal-bg hover:bg-terminal-accent/90 font-semibold',
    danger: 'bg-terminal-red/20 text-terminal-red border border-terminal-red/30 hover:bg-terminal-red/30',
    ghost: 'text-terminal-muted hover:text-terminal-text hover:bg-white/5 border border-terminal-border',
    secondary: 'bg-terminal-border text-terminal-text hover:bg-terminal-border/70',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

// Log Level Indicator
export function LogLevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    info: 'text-terminal-accent',
    warn: 'text-terminal-yellow',
    error: 'text-terminal-red',
    debug: 'text-terminal-muted',
  };
  return <span className={`font-mono text-xs font-bold uppercase ${map[level] || map.info}`}>[{level}]</span>;
}

// Loading spinner
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-terminal-accent font-mono text-sm animate-pulse">Loading...</div>
    </div>
  );
}

// Empty state
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-terminal-muted">
      <div className="text-4xl mb-3 opacity-30">◈</div>
      <div className="font-mono text-sm">{message}</div>
    </div>
  );
}
