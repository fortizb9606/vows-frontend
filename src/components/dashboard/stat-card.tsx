import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  change: number;
  color: 'primary' | 'secondary' | 'accent';
}

const colorClasses = {
  primary: 'bg-blue-50 text-blue-900 border-blue-200',
  secondary: 'bg-cyan-50 text-cyan-900 border-cyan-200',
  accent: 'bg-sky-50 text-sky-900 border-sky-200',
};

const iconColorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-cyan-600',
  accent: 'text-sky-600',
};

const trendColorClasses = {
  primary: 'text-blue-600 bg-blue-100',
  secondary: 'text-cyan-600 bg-cyan-100',
  accent: 'text-sky-600 bg-sky-100',
};

export default function StatCard({ icon, title, value, change, color }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className={cn('rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow', colorClasses[color])}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <div className={cn('flex items-center gap-1 mt-3 text-sm font-medium px-2 py-1 rounded w-fit', trendColorClasses[color])}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{change}%</span>
          </div>
        </div>
        <div className={cn('p-3 rounded-lg', iconColorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
