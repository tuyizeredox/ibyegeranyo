'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  House,
  Clapperboard,
  Info,
  Tag,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  LogIn,
  LogOut,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface User {
  id: string;
  fullName: string;
  phone: string;
  subscriptionStatus: string;
  selectedPlan: string | null;
  expiresAt: string | null;
}

type Status = 'active' | 'pending' | 'free';

const statusStyles: Record<Status, { dot: string; badge: string }> = {
  active: { dot: 'bg-emerald-400', badge: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25' },
  pending: { dot: 'bg-amber-400', badge: 'bg-amber-400/10 text-amber-300 ring-amber-400/25' },
  free: { dot: 'bg-slate-500', badge: 'bg-white/5 text-text-muted ring-white/10' },
};

const getStatus = (user: User): Status =>
  user.subscriptionStatus === 'active' || user.subscriptionStatus === 'pending' ? user.subscriptionStatus : 'free';

const getInitials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';

// Scroll position is read through an external store so the bar can firm up
// once content slides beneath it, without a setState-in-effect round trip.
const subscribeToScroll = (listener: () => void) => {
  window.addEventListener('scroll', listener, { passive: true });
  return () => window.removeEventListener('scroll', listener);
};

function Avatar({ user, large = false }: { user: User; large?: boolean }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep font-bold text-background shadow-[inset_0_1px_0_rgba(255,255,255,.35)] ${
        large ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs'
      }`}
    >
      {getInitials(user.fullName)}
      <span
        aria-hidden
        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${statusStyles[getStatus(user)].dot}`}
      />
    </span>
  );
}

function StatusBadge({ user }: { user: User }) {
  const { t } = useI18n();
  const status = getStatus(user);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status].badge}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${statusStyles[status].dot}`} />
      {t(status)}
    </span>
  );
}

function LanguageSwitch({ full = false }: { full?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const options = [
    { value: 'en', short: 'EN', long: t('english') },
    { value: 'rw', short: 'RW', long: t('kinyarwanda') },
  ] as const;

  return (
    <div
      role="group"
      aria-label={t('language')}
      className={`relative grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-1 ${full ? 'w-full' : 'w-[6.5rem]'}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white/[0.12] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          locale === 'rw' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          aria-pressed={locale === option.value}
          className={`relative z-10 rounded-full font-bold transition-colors ${full ? 'h-11 text-sm' : 'h-8 text-xs tracking-wide'} ${
            locale === option.value ? 'text-white' : 'text-white/50 hover:text-white'
          }`}
        >
          {full ? option.long : option.short}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { t } = useI18n();
  const isScrolled = useSyncExternalStore(subscribeToScroll, () => window.scrollY > 8, () => false);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // User not logged in
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // The session is an external source; this runs once after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, []);

  // While the mobile sheet is open: lock page scroll, close on Escape, and
  // close if the viewport grows into the desktop layout.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const onViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onViewportChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onViewportChange);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) setIsUserMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch {
      console.error('Logout failed');
    }
  };

  const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
    { href: '/', label: t('home'), icon: House },
    { href: '/documentaries', label: t('documentaries'), icon: Clapperboard },
    { href: '/about', label: t('about'), icon: Info },
    { href: '/pricing', label: t('pricing'), icon: Tag },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const closeMenus = () => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  };

  // The admin workspace has its own navigation. Rendering the public fixed
  // navbar there overlays the dashboard tabs and prevents them being clicked.
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isSolid = isScrolled || isOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Glass backdrop lives on its own layer: a backdrop-filter on the header
          itself would trap the fixed mobile sheet inside the 4rem bar. */}
      <div
        aria-hidden
        className={`absolute inset-0 border-b backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ${
          isSolid
            ? 'border-white/10 bg-background/90 shadow-[0_10px_40px_-12px_rgba(0,0,0,.7)]'
            : 'border-white/[0.05] bg-background/70'
        }`}
      />
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent transition-opacity duration-500 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <nav aria-label="Main" className="container relative">
        <div className="flex h-16 items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenus}
            className="flex items-center justify-self-start transition-opacity hover:opacity-90"
            aria-label="Ibyegeranyo home"
          >
            <Image
              src="/logo.png"
              alt="Ibyegeranyo"
              width={900}
              height={240}
              loading="eager"
              className="h-10 w-auto sm:h-11"
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      active ? 'bg-white/10 text-white shadow-sm' : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {active && (
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
                    )}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right side */}
          <div className="flex items-center justify-end gap-2 justify-self-end sm:gap-3">
            <div className="hidden lg:block">
              <LanguageSwitch />
            </div>

            {isLoading ? (
              <div aria-hidden className="hidden h-10 w-24 animate-pulse rounded-full bg-white/[0.06] sm:block lg:w-44" />
            ) : user ? (
              <>
                <Link
                  href="/account"
                  onClick={closeMenus}
                  aria-label={t('account')}
                  className="hidden rounded-full transition-transform hover:scale-105 sm:inline-flex lg:hidden"
                >
                  <Avatar user={user} />
                </Link>

                <div ref={userMenuRef} className="relative hidden lg:block">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                    aria-expanded={isUserMenuOpen}
                    aria-controls="user-menu"
                    className="flex h-11 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    <Avatar user={user} />
                    <span className="max-w-[9rem] truncate text-sm font-medium text-white">
                      {user.fullName.trim().split(/\s+/)[0]}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-white/60 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    id="user-menu"
                    inert={!isUserMenuOpen}
                    className={`absolute right-0 top-full mt-3 w-72 origin-top-right rounded-2xl border border-white/10 bg-background-secondary/95 p-2 shadow-[0_24px_60px_-12px_rgba(0,0,0,.8)] backdrop-blur-xl transition-all duration-200 ${
                      isUserMenuOpen ? 'visible scale-100 opacity-100' : 'invisible pointer-events-none scale-95 opacity-0'
                    }`}
                  >
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                      <Avatar user={user} large />
                      <div className="flex min-w-0 flex-col items-start gap-1">
                        <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
                        <StatusBadge user={user} />
                      </div>
                    </div>
                    <div className="my-2 h-px bg-white/[0.06]" />
                    <Link
                      href="/account"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <UserRound size={18} />
                      {t('account')}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-danger/10 hover:text-red-400"
                    >
                      <LogOut size={18} />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden h-10 items-center rounded-full px-4 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white lg:inline-flex"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="group hidden h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold pl-5 pr-4 text-sm font-semibold text-background shadow-[inset_0_1px_0_rgba(255,255,255,.35)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-hover sm:inline-flex"
                >
                  {t('register')}
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <span aria-hidden className="relative block h-3.5 w-5">
                <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${isOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
                <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`absolute left-0 top-3 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${isOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div
        id="mobile-menu"
        inert={!isOpen}
        className={`fixed inset-x-0 bottom-0 top-16 transition-[visibility] duration-300 lg:hidden ${isOpen ? 'visible' : 'invisible'}`}
      >
        <div
          aria-hidden
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`relative max-h-full overflow-y-auto border-b border-white/10 bg-background/95 shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl transition-all duration-300 ease-out motion-reduce:transition-none ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="container flex flex-col gap-6 py-5">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link, index) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <li
                    key={link.href}
                    style={{ transitionDelay: isOpen ? `${80 + index * 40}ms` : '0ms' }}
                    className={`transition-all duration-300 motion-reduce:transition-none ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenus}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-center gap-4 rounded-2xl p-3 transition-colors ${
                        active ? 'bg-white/[0.07] text-white' : 'text-white/75 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                          active
                            ? 'border-gold/30 bg-gold/10 text-gold'
                            : 'border-white/[0.08] bg-white/[0.03] text-white/60 group-hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="flex-1 text-base font-medium">{link.label}</span>
                      <ChevronRight
                        size={18}
                        className={`transition-transform group-hover:translate-x-0.5 ${active ? 'text-gold' : 'text-white/30'}`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{t('language')}</p>
              <LanguageSwitch full />
            </div>

            {!isLoading && (
              <div className="border-t border-white/[0.06] pt-5">
                {user ? (
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} large />
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                        <p className="truncate font-semibold text-white">{user.fullName}</p>
                        <StatusBadge user={user} />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link
                        href="/account"
                        onClick={closeMenus}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                      >
                        <UserRound size={18} />
                        {t('account')}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] text-sm font-semibold text-white transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-red-400"
                      >
                        <LogOut size={18} />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={closeMenus}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                    >
                      <LogIn size={18} />
                      {t('login')}
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMenus}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold text-sm font-semibold text-background transition-colors hover:bg-gold-hover"
                    >
                      {t('register')}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
