import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  FileSpreadsheet, 
  UploadCloud, 
  BarChart3, 
  Settings, 
  Home,
  MessageSquare
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openIssuesCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  openIssuesCount,
}) => {
  if (!isOpen) return null;

  const navItems = [
    { id: 'overview' as NavTab, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'issues' as NavTab, label: 'Hồ sơ vấn đề', icon: FileSpreadsheet, badge: openIssuesCount > 0 ? `${openIssuesCount}` : undefined },
    { id: 'zalo' as NavTab, label: 'Kênh Zalo & Bot', icon: MessageSquare },
    { id: 'import' as NavTab, label: 'Nhập dữ liệu', icon: UploadCloud },
    { id: 'reports' as NavTab, label: 'Báo cáo', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Danh mục / Cài đặt', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex sm:hidden">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-brand-text">DuLy’s House</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-brand-text hover:bg-brand-bg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-900'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

