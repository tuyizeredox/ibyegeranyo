interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  children?: React.ReactNode;
}

/** Opening band for inner pages: ambient glows, a faint grid and a display title. */
export function PageHeader({ eyebrow, title, description, align = 'left', children }: PageHeaderProps) {
  const centered = align === 'center';
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-44 left-[8%] h-80 w-[36rem] max-w-full rounded-full bg-gold/[0.07] blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>
      <div className={`container flex flex-col gap-5 pb-14 pt-16 md:pb-20 md:pt-24 ${centered ? 'items-center text-center' : 'items-start'}`}>
        {eyebrow && <p className="eyebrow animate-fade-up motion-reduce:animate-none">{eyebrow}</p>}
        <h1 className="max-w-4xl animate-fade-up font-display text-4xl text-white [animation-delay:100ms] motion-reduce:animate-none sm:text-5xl md:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl animate-fade-up text-base text-text-muted [animation-delay:200ms] motion-reduce:animate-none md:text-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
