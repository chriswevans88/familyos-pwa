import { motion } from 'framer-motion';

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
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
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
          stroke={color}
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
        <div className="text-2xl font-black text-white">{Math.round(value)}</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">{label}</div>
      </div>
    </div>
  );
}
