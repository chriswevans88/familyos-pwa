import { motion } from 'framer-motion';
import { useId } from 'react';

export function ProgressRing({
  value,
  label,
  color = '#22d3ee',
  size = 112
}: {
  value: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const gradientId = useId();
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="62%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#f5c542" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="text-2xl font-black text-white"
        >
          {Math.round(value)}
        </motion.div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">{label}</div>
      </div>
    </div>
  );
}
