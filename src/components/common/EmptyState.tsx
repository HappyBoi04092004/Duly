import React from 'react';
import { FolderOpen, Plus, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-xl border border-dashed border-brand-border/80">
      <div className="w-14 h-14 rounded-full bg-brand-bg flex items-center justify-center text-brand-primary mb-4">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-brand-text mb-1">{title}</h3>
      <p className="text-sm text-brand-muted max-w-md mb-6">{description}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-secondary hover:bg-brand-bg rounded-lg transition-colors"
          >
            {secondaryActionText}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

