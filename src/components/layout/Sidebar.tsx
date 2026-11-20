import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  UploadCloud, 
  BarChart3, 
  Settings, 
  Home, 
  AlertCircle,
  Building2,
  MessageSquare
} from 'lucide-react';

export type NavTab = 'overview' | 'issues' | 'zalo' | 'import' | 'reports' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openIssuesCount: number;
  unverifiedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openIssuesCount,
  unverifiedCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: unverifiedCount > 0 ? `${unverifiedCount} cần rà soát` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'issues' as NavTab,
      label: 'Hồ sơ vấn đề',
      icon: FileSpreadsheet,
      badge: openIssuesCount > 0 ? `${openIssuesCount} mở` : undefined,
      badgeColor: 'bg-red-100 text-red-900',
    },
    {
      id: 'zalo' as NavTab,
      label: 'Kênh Zalo & Bot',
      icon: MessageSquare,
      badge: 'Live',
      badgeColor: 'bg-blue-100 text-blue-900',
    },
    {
      id: 'import' as NavTab,
      label: 'Nhập dữ liệu',
      icon: UploadCloud,
    },
    {
      id: 'reports' as NavTab,
      label: 'Báo cáo',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavTab,
      label: 'Danh mục / Cài đặt',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-border/70 flex flex-col shrink-0 h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-brand-border/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-sm">
          <Home className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight text-brand-text">
            DuLy’s House
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] font-semibold tracking-wider text-brand-muted uppercase">
              Operations
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-brand-secondary/60 text-brand-primary rounded">
              v13
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-brand-muted uppercase tracking-wider">
          Điều hướng chính
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-brand-text hover:bg-brand-bg hover:text-brand-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-muted'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-brand-border/60 bg-brand-bg/50">
        <div className="flex items-center gap-2.5 text-xs text-brand-muted">
          <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
          <div className="truncate">
            <p className="font-medium text-brand-text truncate">14 Cơ sở đang hoạt động</p>
            <p className="text-[11px] text-brand-muted">TP.HCM • Vũng Tàu • Đà Lạt</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

