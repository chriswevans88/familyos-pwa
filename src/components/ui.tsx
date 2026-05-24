import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles, X } from 'lucide-react';
import type { Member } from '../types';

export function Card({
  children,
  className,
  interactive = false,
  shine = false
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  shine?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      className={clsx(
        'rounded-lg border border-white/10 bg-card-sheen shadow-glass backdrop-blur-xl',
        'before:pointer-events-none before:absolute before:inset-px before:rounded-lg before:border before:border-white/5',
        shine &&
          'after:pointer-events-none after:absolute after:-left-24 after:top-0 after:h-full after:w-24 after:skew-x-[-18deg] after:bg-white/10 after:blur-xl',
        'relative overflow-hidden transition duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function AppLogo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';
  const iconSize = size === 'lg' ? 29 : size === 'sm' ? 18 : 22;

  return (
    <div
      className={clsx(
        'relative grid shrink-0 place-items-center rounded-lg bg-[linear-gradient(145deg,#67e8f9,#6ee7b7_62%,#f5c542)] text-ink-950 shadow-[0_18px_50px_rgba(34,211,238,0.28)]',
        'before:absolute before:inset-1 before:rounded-[0.55rem] before:border before:border-white/45',
        sizeClass,
        className
      )}
    >
      <Sparkles className="relative" size={iconSize} strokeWidth={2.8} />
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'cyan',
  className
}: {
  children: ReactNode;
  tone?: 'cyan' | 'green' | 'amber' | 'rose' | 'violet' | 'white';
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]',
        tone === 'cyan' && 'border-cyan-200/25 bg-cyan-300/12 text-cyan-100',
        tone === 'green' && 'border-emerald-200/25 bg-emerald-300/12 text-emerald-100',
        tone === 'amber' && 'border-amber-200/25 bg-amber-300/12 text-amber-100',
        tone === 'rose' && 'border-rose-200/25 bg-rose-300/12 text-rose-100',
        tone === 'violet' && 'border-violet-200/25 bg-violet-300/12 text-violet-100',
        tone === 'white' && 'border-white/15 bg-white/10 text-white/80',
        className
      )}
    >
      {children}
    </span>
  );
}

export function AvatarStack({ members, limit = 4 }: { members: Member[]; limit?: number }) {
  const visible = members.slice(0, limit);
  const extra = Math.max(0, members.length - visible.length);

  return (
    <div className="flex items-center">
      {visible.map((member, index) => (
        <div
          key={member.id}
          title={`${member.name} - ${member.role}`}
          className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink-950 text-xs font-black text-ink-950 shadow-lg"
          style={{ backgroundColor: member.color, marginLeft: index === 0 ? 0 : -8 }}
        >
          {member.avatar}
        </div>
      ))}
      {extra > 0 && (
        <div className="-ml-2 grid h-9 w-9 place-items-center rounded-full border-2 border-ink-950 bg-white/15 text-xs font-black text-white">
          +{extra}
        </div>
      )}
    </div>
  );
}

export function AnimatedValue({
  value,
  formatValue,
  className
}: {
  value: number;
  formatValue: (value: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const controls = animate(previous.current, value, {
      duration: 0.75,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest)
    });
    previous.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{formatValue(display)}</span>;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: ReactNode;
}) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg font-semibold transition duration-200',
        'focus:outline-none focus:ring-2 focus:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm',
        variant === 'primary' &&
          'bg-cyan-300 text-ink-950 shadow-glow hover:-translate-y-0.5 hover:bg-cyan-200 active:translate-y-0 active:scale-[0.98]',
        variant === 'secondary' &&
          'border border-white/10 bg-white/10 text-white hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 active:scale-[0.98]',
        variant === 'ghost' && 'text-white/75 hover:bg-white/10 active:scale-[0.98]',
        variant === 'danger' &&
          'border border-rose-300/20 bg-rose-400/12 text-rose-100 hover:bg-rose-400/20 active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        'grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white active:scale-95',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm text-white/70">
      <span>{label}</span>
      <input
        className={clsx(
          'min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20',
          className
        )}
        {...props}
      />
    </label>
  );
}

export function SelectField({
  label,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-white/70">
      <span>{label}</span>
      <select
        className={clsx(
          'min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-base text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-white/70">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
      />
    </label>
  );
}

export function Modal({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/55 px-3 pb-3 pt-16 backdrop-blur-md sm:place-items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24 }}
        className="max-h-[88vh] w-full max-w-xl overflow-auto rounded-lg border border-white/10 bg-ink-900 p-4 shadow-glass"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function ProgressBar({
  value,
  color = '#22d3ee',
  className
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx('h-2 overflow-hidden rounded-full bg-white/10', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export function EmptyState({ title, body, icon }: { title: string; body: string; icon: ReactNode }) {
  return (
    <Card className="grid place-items-center gap-3 p-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-cyan-200">{icon}</div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/60">{body}</p>
      </div>
    </Card>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">{eyebrow}</p>}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}
