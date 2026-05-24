import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export function Card({
  children,
  className,
  interactive = false
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
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
        'relative overflow-hidden',
        className
      )}
    >
      {children}
    </motion.div>
  );
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
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg font-semibold transition',
        'focus:outline-none focus:ring-2 focus:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm',
        variant === 'primary' &&
          'bg-cyan-300 text-ink-950 shadow-glow hover:bg-cyan-200 active:scale-[0.98]',
        variant === 'secondary' &&
          'border border-white/10 bg-white/10 text-white hover:bg-white/20 active:scale-[0.98]',
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
