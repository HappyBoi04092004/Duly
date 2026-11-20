import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subValue?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  trend?: string;
  onClick?: () => void;
  hint?: string;
  isActive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon,
  badge,
  badgeColor = 'text-brand-muted bg-brand-secondary/40',
  onClick,
  hint,
  isActive = false,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative bg-white rounded-xl p-5 border transition-all duration-200 text-left ${
        onClick
          ? 'cursor-pointer hover:shadow-md hover:border-brand-primary/40 hover:-translate-y-0.5'
          : ''
      } ${
        isActive 
          ? 'ring-2 ring-brand-primary border-brand-primary shadow-sm' 
          : 'border-brand-border/60'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-brand-muted">{title}</span>
        <div className="p-2 rounded-lg bg-brand-bg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-200">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-brand-text">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-medium text-brand-muted">
            {subValue}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {badge ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium ${badgeColor}`}>
            {badge}
          </span>
        ) : (
          <span className="text-brand-muted">{hint || 'Bấm xem chi tiết'}</span>
        )}

        {onClick && (
          <span className="inline-flex items-center text-brand-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 gap-0.5">
            Xem hồ sơ <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
};

