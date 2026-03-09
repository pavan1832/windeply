'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Dashboard', icon: '⬡' },
  { href: '/jobs', label: 'Deployments', icon: '▶' },
  { href: '/logs', label: 'Audit Logs', icon: '≡' },
  { href: '/templates', label: 'Templates', icon: '⊞' },
  { href: '/machines', label: 'Machines', icon: '◈' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 border-r border-terminal-border bg-terminal-surface flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-terminal-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-terminal-accent rounded flex items-center justify-center text-terminal-bg font-bold text-sm">W</div>
          <div>
            <div className="font-display font-bold text-white text-sm leading-tight">WinDeply</div>
            <div className="text-terminal-muted text-xs font-mono">v1.0.0 · ENTERPRISE</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <div className="text-terminal-muted text-xs font-mono uppercase tracking-widest px-2 mb-3">Navigation</div>
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                active
                  ? 'bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/20'
                  : 'text-terminal-muted hover:text-terminal-text hover:bg-white/5'
              }`}
            >
              <span className="font-mono text-base w-4 text-center">{item.icon}</span>
              <span className={active ? 'font-medium' : ''}>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-terminal-accent"></span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-terminal-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded bg-terminal-border flex items-center justify-center text-xs font-mono text-terminal-accent">AD</div>
          <div>
            <div className="text-xs font-medium text-white">admin</div>
            <div className="text-xs text-terminal-muted">Administrator</div>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-terminal-green"></div>
        </div>
      </div>
    </aside>
  );
}
