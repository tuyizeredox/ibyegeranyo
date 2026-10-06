import { CalendarDays } from 'lucide-react';
import { PageHeader } from './PageHeader';

interface LegalPageProps {
  title: string;
  updated: string;
  sections: [title: string, copy: string][];
}

/** Shared layout for the privacy policy and terms: sticky contents + numbered sections. */
export function LegalPage({ title, updated, sections }: LegalPageProps) {
  return (
    <article>
      <PageHeader eyebrow="LEGAL" title={title}>
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-text-muted">
          <CalendarDays size={14} />
          <span>{updated}</span>
        </p>
      </PageHeader>

      <div className="container grid gap-10 py-14 md:py-20 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <nav aria-label={title} className="hidden lg:block">
          <ol className="sticky top-28 flex flex-col gap-1 border-l border-white/[0.08]">
            {sections.map(([heading], index) => (
              <li key={heading}>
                <a
                  href={`#section-${index + 1}`}
                  className="-ml-px block border-l border-transparent py-2 pl-5 text-sm text-text-muted transition-colors hover:border-gold hover:text-white"
                >
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex max-w-3xl flex-col gap-5">
          {sections.map(([heading, copy], index) => (
            <section
              key={heading}
              id={`section-${index + 1}`}
              className="scroll-mt-28 rounded-3xl border border-white/[0.07] bg-surface/40 p-6 md:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-sm font-bold text-gold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-3 pt-1">
                  <h2 className="text-xl font-semibold text-white">{heading}</h2>
                  <p className="text-text-muted">{copy}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
