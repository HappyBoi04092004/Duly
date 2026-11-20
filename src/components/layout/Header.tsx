import React from 'react';
import { Menu, Plus, RefreshCw, Upload, Download, Sparkles } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'overview':
        return {
          title: 'Tổng quan vận hành',
          description: 'Theo dõi chỉ số trọng yếu, cơ cấu vấn đề và danh sách cần ưu tiên xử lý trong kỳ.',
          primaryBtnText: 'Tạo hồ sơ mới',
          primaryIcon: Plus,
          secondaryBtnText: 'Nhập dữ liệu',
          secondaryIcon: Upload,
        };
      case 'issues':
        return {
          title: 'Hồ sơ vấn đề',
          description: 'Danh sách và chi tiết các phản ánh từ khách hàng, phát hiện nội bộ và hướng dẫn khách.',
          primaryBtnText: 'Tạo hồ sơ mới',
          primaryIcon: Plus,
          secondaryBtnText: 'Tải file mẫu',
          secondaryIcon: Download,
        };
      case 'import':
        return {
          title: 'Nhập dữ liệu vận hành',
          description: 'Tải lên danh sách hồ sơ vấn đề từ Excel/CSV hoặc dữ liệu số lượng booking checkout theo tuần.',
          primaryBtnText: 'Tải mẫu Excel',
          primaryIcon: Download,
        };
      case 'reports':
        return {
          title: 'Báo cáo & Phân tích',
          description: 'Tổng hợp tỷ lệ phản ánh trên 100 booking checkout, so sánh cơ sở và tạo bản nháp báo cáo tuần/tháng.',
          primaryBtnText: 'Sao chép nhận xét',
          primaryIcon: Sparkles,
        };
      case 'settings':
        return {
          title: 'Danh mục & Cài đặt hệ thống',
          description: 'Quản lý 14 cơ sở, danh sách phòng, nhóm vấn đề, người phụ trách và đồng bộ dữ liệu.',
          primaryBtnText: 'Thêm cơ sở mới',
          primaryIcon: Plus,
        };
      case 'zalo':
        return {
          title: 'Kênh Tiếp Nhận Zalo & Bot Telegram',
          description: 'Hứng tin báo sự cố từ Nhóm Zalo thời gian thực, lưu trữ trên hệ thống và bắn cảnh báo về Telegram Bot @TaskDuly_bot.',
          primaryBtnText: 'Tạo hồ sơ mới',
          primaryIcon: Plus,
          secondaryBtnText: 'Làm mới',
          secondaryIcon: RefreshCw,
        };
      default:
        return {
          title: 'DuLy’s House | Operations',
          description: 'Hệ thống Quản lý Vận hành, Theo dõi Sự cố và Báo cáo Hiệu suất.',
          primaryBtnText: 'Thao tác',
          primaryIcon: Plus,
        };
    }
  };

  const info = getHeaderInfo();
  const PrimaryIcon = info.primaryIcon;

  return (
    <header className="bg-white border-b border-brand-border/60 sticky top-0 z-20 px-4 sm:px-8 py-4 sm:py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title & Description */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="sm:hidden p-2 rounded-lg text-brand-text hover:bg-brand-bg border border-brand-secondary/60"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
                {info.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-muted mt-0.5 max-w-2xl">
              {info.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {info.secondaryBtnText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-brand-text bg-white border border-brand-secondary hover:bg-brand-bg rounded-lg transition-colors"
            >
              {info.secondaryIcon && <info.secondaryIcon className="w-4 h-4 text-brand-muted" />}
              <span>{info.secondaryBtnText}</span>
            </button>
          )}

          <button
            onClick={onPrimaryAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-all shadow-sm active:scale-95"
          >
            <PrimaryIcon className="w-4 h-4" />
            <span>{info.primaryBtnText}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

