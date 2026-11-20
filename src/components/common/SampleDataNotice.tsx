import React from 'react';
import { Database, Info, X } from 'lucide-react';

interface SampleDataNoticeProps {
  isSampleData: boolean;
  onNavigateToImport?: () => void;
}

export const SampleDataNotice: React.FC<SampleDataNoticeProps> = ({
  isSampleData,
  onNavigateToImport,
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (!isSampleData || dismissed) return null;

  return (
    <div className="bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-lg mb-6 flex items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm">
      <div className="flex items-center gap-2.5">
        <span className="p-1 rounded bg-amber-200/60 text-amber-800 shrink-0">
          <Database className="w-4 h-4" />
        </span>
        <div>
          <span className="font-semibold text-amber-950 uppercase tracking-wider text-[11px] bg-amber-200/50 px-1.5 py-0.5 rounded mr-2">
            Dữ liệu mẫu
          </span>
          <span>
            Hệ thống đang hiển thị dữ liệu mô phỏng vận hành 14 cơ sở DuLy’s House. Để dùng dữ liệu thực tế, vui lòng nhập file booking & hồ sơ mới.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onNavigateToImport && (
          <button
            onClick={onNavigateToImport}
            className="text-xs font-semibold text-amber-900 underline hover:text-amber-950"
          >
            Nhập file ngay
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-950 p-1 rounded hover:bg-amber-100"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

