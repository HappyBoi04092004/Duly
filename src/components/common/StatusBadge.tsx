import React from 'react';
import { IssueStatus, IssueSource } from '../../types';

interface StatusBadgeProps {
  status: IssueStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Đã hoàn thành':
        return 'bg-[#2F6B4F]/10 text-[#2F6B4F] border-[#2F6B4F]/30';
      case 'Đang xử lý':
        return 'bg-[#A86616]/10 text-[#A86616] border-[#A86616]/30';
      case 'Cần theo dõi':
        return 'bg-[#356A83]/10 text-[#356A83] border-[#356A83]/30';
      case 'Chưa xử lý':
      default:
        return 'bg-[#A83A32]/10 text-[#A83A32] border-[#A83A32]/30';
    }
  };

  const dotColor = () => {
    switch (status) {
      case 'Đã hoàn thành': return 'bg-[#2F6B4F]';
      case 'Đang xử lý': return 'bg-[#A86616]';
      case 'Cần theo dõi': return 'bg-[#356A83]';
      case 'Chưa xử lý':
      default: return 'bg-[#A83A32]';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${getStyle()} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor()}`} />
      <span>{status}</span>
    </span>
  );
};

interface SourceBadgeProps {
  source: IssueSource | string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  let style = 'bg-[#6B4E3D]/10 text-[#6B4E3D] border-[#6B4E3D]/20';
  if (source === 'Khách hàng phản ánh') {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (source === 'Nội bộ phát hiện') {
    style = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (source === 'Hướng dẫn khách') {
    style = 'bg-purple-50 text-purple-800 border-purple-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${style}`}>
      {source}
    </span>
  );
};

