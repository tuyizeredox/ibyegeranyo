import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: { href: string; label: string };
}

export function SectionHeading({ eyebrow, title, description, align = 'left', action }: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div
      className={`mb-10 flex flex-col gap-6 md:mb-14 ${
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
      }`}
    >
      <div className={`flex max-w-2xl flex-col gap-4 ${centered ? 'items-center' : 'items-start'}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="font-display text-3xl text-white md:text-5xl">{title}</h2>
        {description && <p className="text-text-muted md:text-lg">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold text-white/80 transition-colors hover:text-white"
        >
          {action.label}
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-all duration-200 group-hover:border-gold group-hover:bg-gold group-hover:text-background">
            <ArrowRight size={16} />
          </span>
        </Link>
      )}
    </div>
  );
}
