import Link from 'next/link';
import { Clapperboard, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { href: string; label: string };
}

export function EmptyState({ title, description, icon: Icon = Clapperboard, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60">
        <Icon size={28} />
      </span>
      <p className="text-lg font-medium text-white/85">{title}</p>
      {description && <p className="max-w-md text-sm text-text-muted">{description}</p>}
      {action && (
        <Link href={action.href} className="btn-secondary mt-2 text-sm">
          {action.label}
        </Link>
      )}
    </div>
  );
}
