const COLORS = [
  'bg-violet-600', 'bg-blue-600', 'bg-teal-600',
  'bg-green-700', 'bg-orange-600', 'bg-rose-600', 'bg-indigo-600',
];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  generic?: boolean;
}

const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };

export function Avatar({ name, size = 'md', generic = false }: AvatarProps) {
  const initials = generic
    ? '?'
    : name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
  const color = generic ? 'bg-slate-400' : colorFromName(name);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold ${color} ${sizeMap[size]}`}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
