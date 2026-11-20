import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  MessageSquareWarning, 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  PieChart as PieIcon, 
  Building2, 
  Filter, 
  ChevronRight,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import { 
  Issue, 
  Facility, 
  IssueCategory, 
  IssueFilterState,
  BookingRecord
} from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge, SourceBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { getIssueAgeText, formatDateVi } from '../../utils/dateUtils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';

interface OverviewTabProps {
  issues: Issue[];
  facilities: Facility[];
  categories: IssueCategory[];
  bookings: BookingRecord[];
  onNavigateToIssuesWithFilter: (filters: Partial<IssueFilterState>) => void;
  onNavigateToImport: () => void;
  onSelectIssue: (issue: Issue) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  issues,
  facilities,
  categories,
  bookings,
  onNavigateToIssuesWithFilter,
  onNavigateToImport,
  onSelectIssue,
}) => {
  // Period filter: 'all' | '7days' | '30days' | 'this_month'
  const [periodFilter, setPeriodFilter] = useState<'all' | '7days' | '30days'>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Tab for bottom list: 'recent' vs 'longest_open'
  const [listTab, setListTab] = useState<'recent' | 'longest_open'>('recent');

  // Filter issues according to overview filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Period
      if (periodFilter === '7days') {
        const issueTime = new Date(issue.createdAt).getTime();
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (issueTime < cutoff) return false;
      } else if (periodFilter === '30days') {
        const issueTime = new Date(issue.createdAt).getTime();
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (issueTime < cutoff) return false;
      }

      // Facility
      if (facilityFilter !== 'all' && issue.facility_id !== facilityFilter) {
        return false;
      }

      // Source
      if (sourceFilter !== 'all' && issue.source !== sourceFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'all' && issue.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [issues, periodFilter, facilityFilter, sourceFilter, categoryFilter, statusFilter]);

  // Key metrics
  const totalCount = filteredIssues.length;
  const customerFeedbackCount = filteredIssues.filter(i => i.source === 'Khách hàng phản ánh').length;
  const internalDiscoveredCount = filteredIssues.filter(i => i.source === 'Nội bộ phát hiện').length;
  const customerGuidanceCount = filteredIssues.filter(i => i.source === 'Hướng dẫn khách').length;
  const completedCount = filteredIssues.filter(i => i.status === 'Đã hoàn thành').length;
  const openCount = filteredIssues.filter(i => i.status !== 'Đã hoàn thành').length;

  // Alerts calculations
  const unverifiedOrMissingList = useMemo(() => {
    return issues.filter(i => !i.isVerified || i.hasMissingInfo);
  }, [issues]);

  const openOver1Week = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return issues.filter(i => i.status !== 'Đã hoàn thành' && new Date(i.createdAt).getTime() < cutoff);
  }, [issues]);

  const openOver2Weeks = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    return issues.filter(i => i.status !== 'Đã hoàn thành' && new Date(i.createdAt).getTime() < cutoff);
  }, [issues]);

  const openOver4Weeks = useMemo(() => {
    const cutoff = Date.now() - 28 * 24 * 60 * 60 * 1000;
    return issues.filter(i => i.status !== 'Đã hoàn thành' && new Date(i.createdAt).getTime() < cutoff);
  }, [issues]);

  // Identify facility with most complaints
  const facilityComplaints = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    filteredIssues.forEach(i => {
      const current = map.get(i.facility_id) || { id: i.facility_id, name: i.facility_name, count: 0 };
      current.count += 1;
      map.set(i.facility_id, current);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredIssues]);

  const topFacility = facilityComplaints[0];

  // Chart 1: Time trend (by day/week)
  const timeTrendData = useMemo(() => {
    const dateMap = new Map<string, { date: string; displayDate: string; total: number; customer: number; internal: number }>();
    
    // Sort chronological
    const sorted = [...filteredIssues].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    sorted.forEach(item => {
      const dateKey = item.createdAt.split('T')[0];
      const parts = dateKey.split('-');
      const displayDate = `${parts[2]}/${parts[1]}`;
      const entry = dateMap.get(dateKey) || { date: dateKey, displayDate, total: 0, customer: 0, internal: 0 };
      entry.total += 1;
      if (item.source === 'Khách hàng phản ánh') entry.customer += 1;
      if (item.source === 'Nội bộ phát hiện') entry.internal += 1;
      dateMap.set(dateKey, entry);
    });

    return Array.from(dateMap.values());
  }, [filteredIssues]);

  // Chart 2: Source distribution
  const sourceChartData = useMemo(() => {
    const sources = [
      { name: 'Khách hàng phản ánh', value: customerFeedbackCount, color: '#A83A32' },
      { name: 'Nội bộ phát hiện', value: internalDiscoveredCount, color: '#356A83' },
      { name: 'Hướng dẫn khách', value: customerGuidanceCount, color: '#6B4E3D' },
    ];
    return sources.filter(s => s.value > 0);
  }, [customerFeedbackCount, internalDiscoveredCount, customerGuidanceCount]);

  // Chart 3: Category breakdown
  const categoryChartData = useMemo(() => {
    const catMap = new Map<string, number>();
    filteredIssues.forEach(i => {
      catMap.set(i.category, (catMap.get(i.category) || 0) + 1);
    });
    return Array.from(catMap.entries()).map(([name, count]) => ({
      name: name.length > 20 ? name.substring(0, 18) + '...' : name,
      fullName: name,
      count,
    })).sort((a, b) => b.count - a.count);
  }, [filteredIssues]);

  // Bottom table: Recent or Longest open
  const displayList = useMemo(() => {
    if (listTab === 'recent') {
      return [...filteredIssues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    } else {
      return [...filteredIssues]
        .filter(i => i.status !== 'Đã hoàn thành')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 8);
    }
  }, [filteredIssues, listTab]);

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-brand-border/40">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-text">
            <Filter className="w-4 h-4 text-brand-primary" />
            <span>Bộ lọc tổng quan</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-muted">Kỳ xem:</span>
            <div className="flex items-center bg-brand-bg p-1 rounded-lg border border-brand-secondary/60 text-xs font-medium">
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  periodFilter === 'all'
                    ? 'bg-brand-primary text-white font-semibold shadow-xs'
                    : 'text-brand-text hover:text-brand-primary'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setPeriodFilter('7days')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  periodFilter === '7days'
                    ? 'bg-brand-primary text-white font-semibold shadow-xs'
                    : 'text-brand-text hover:text-brand-primary'
                }`}
              >
                7 ngày qua
              </button>
              <button
                onClick={() => setPeriodFilter('30days')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  periodFilter === '30days'
                    ? 'bg-brand-primary text-white font-semibold shadow-xs'
                    : 'text-brand-text hover:text-brand-primary'
                }`}
              >
                30 ngày qua
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1">Cơ sở</label>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">Tất cả 14 cơ sở</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1">Nguồn ghi nhận</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="Khách hàng phản ánh">Khách hàng phản ánh</option>
              <option value="Nội bộ phát hiện">Nội bộ phát hiện</option>
              <option value="Hướng dẫn khách">Hướng dẫn khách</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1">Nhóm vấn đề</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">Tất cả nhóm</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chưa xử lý">Chưa xử lý</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Cần theo dõi">Cần theo dõi</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State when no issues match */}
      {issues.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="Chưa có dữ liệu hồ sơ vấn đề nào"
          description="Hiện tại hệ thống chưa ghi nhận hồ sơ nào trong kho lưu trữ. Bạn có thể tự tạo hồ sơ đầu tiên hoặc tải file Excel lên."
          actionText="Nhập file Excel ngay"
          onAction={onNavigateToImport}
        />
      ) : (
        <>
          {/* Key Metrics Cards (6 Metrics per specification) */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            <StatCard
              title="Tổng vấn đề trong kỳ"
              value={totalCount}
              subValue="hồ sơ"
              icon={<FileText className="w-5 h-5" />}
              onClick={() => onNavigateToIssuesWithFilter({})}
              hint="Xem tất cả"
            />
            <StatCard
              title="Khách hàng phản ánh"
              value={customerFeedbackCount}
              subValue={`${totalCount ? Math.round((customerFeedbackCount / totalCount) * 100) : 0}%`}
              icon={<MessageSquareWarning className="w-5 h-5" />}
              badgeColor="bg-red-50 text-red-800"
              onClick={() => onNavigateToIssuesWithFilter({ source: 'Khách hàng phản ánh' })}
              hint="Bấm để lọc"
            />
            <StatCard
              title="Nội bộ phát hiện"
              value={internalDiscoveredCount}
              subValue={`${totalCount ? Math.round((internalDiscoveredCount / totalCount) * 100) : 0}%`}
              icon={<Search className="w-5 h-5" />}
              onClick={() => onNavigateToIssuesWithFilter({ source: 'Nội bộ phát hiện' })}
              hint="Bấm để lọc"
            />
            <StatCard
              title="Hướng dẫn khách"
              value={customerGuidanceCount}
              subValue={`${totalCount ? Math.round((customerGuidanceCount / totalCount) * 100) : 0}%`}
              icon={<HelpCircle className="w-5 h-5" />}
              onClick={() => onNavigateToIssuesWithFilter({ source: 'Hướng dẫn khách' })}
              hint="Bấm để lọc"
            />
            <StatCard
              title="Đã hoàn thành"
              value={completedCount}
              subValue={`${totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              badgeColor="bg-green-50 text-green-800"
              onClick={() => onNavigateToIssuesWithFilter({ status: 'Đã hoàn thành' })}
              hint="Bấm để lọc"
            />
            <StatCard
              title="Hồ sơ còn mở"
              value={openCount}
              subValue="cần xử lý"
              icon={<Clock className="w-5 h-5" />}
              badge={openCount > 0 ? 'Đang mở' : 'Tất cả xong'}
              badgeColor={openCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'}
              onClick={() => onNavigateToIssuesWithFilter({ status: 'Đang xử lý' })}
              hint="Bấm để lọc"
            />
          </div>

          {/* Alert Section (Khu vực cảnh báo - Specification Section 4) */}
          <div className="bg-white rounded-xl border border-brand-border/70 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-brand-text">Khu vực cảnh báo trọng tâm</h3>
                <p className="text-xs text-brand-muted">Các vấn đề cần sự can thiệp của Quản lý vận hành ngay hôm nay</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alert 1: Thiếu thông tin / Chưa xác minh */}
              <div 
                onClick={() => onNavigateToIssuesWithFilter({ missingOnly: true })}
                className="cursor-pointer group p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    Rà soát dữ liệu
                  </span>
                  <span className="text-xl font-bold text-amber-900">{unverifiedOrMissingList.length}</span>
                </div>
                <h4 className="text-sm font-semibold text-brand-text group-hover:text-amber-900 transition-colors">
                  Hồ sơ thiếu thông tin / Chưa xác minh
                </h4>
                <p className="text-xs text-brand-muted mt-1">
                  Có {unverifiedOrMissingList.length} hồ sơ chưa xác định phòng hoặc cơ sở. Nhấp vào để bổ sung thông tin.
                </p>
                <div className="mt-3 flex items-center text-xs font-semibold text-amber-900 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Mở danh sách rà soát</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Alert 2: Hồ sơ tồn lâu ngày (>1w, >2w, >4w) */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-900 bg-red-100 px-2 py-0.5 rounded">
                    Tồn đọng thời gian
                  </span>
                  <span className="text-xl font-bold text-red-900">{openOver1Week.length}</span>
                </div>
                <h4 className="text-sm font-semibold text-brand-text">
                  Hồ sơ mở quá hạn giải quyết
                </h4>
                <div className="mt-2 space-y-1.5 text-xs">
                  <button 
                    onClick={() => onNavigateToIssuesWithFilter({ ageFilter: '1-2w', status: 'Đang xử lý' })}
                    className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-red-100/70 text-red-950 font-medium transition-colors"
                  >
                    <span>Mở từ 1 – 2 tuần:</span>
                    <span className="font-bold underline">{openOver1Week.length - openOver2Weeks.length} hồ sơ</span>
                  </button>
                  <button 
                    onClick={() => onNavigateToIssuesWithFilter({ ageFilter: '2-4w', status: 'Đang xử lý' })}
                    className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-red-100/70 text-red-950 font-medium transition-colors"
                  >
                    <span>Mở từ 2 – 4 tuần:</span>
                    <span className="font-bold underline">{openOver2Weeks.length - openOver4Weeks.length} hồ sơ</span>
                  </button>
                  <button 
                    onClick={() => onNavigateToIssuesWithFilter({ ageFilter: '>4w', status: 'Đang xử lý' })}
                    className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-red-100/70 text-red-950 font-bold transition-colors"
                  >
                    <span>Mở trên 4 tuần:</span>
                    <span className="font-extrabold text-red-700 bg-white px-1.5 py-0.5 rounded border border-red-300">
                      {openOver4Weeks.length} hồ sơ
                    </span>
                  </button>
                </div>
              </div>

              {/* Alert 3: Điểm nóng cơ sở */}
              <div 
                onClick={() => {
                  if (topFacility) onNavigateToIssuesWithFilter({ facilityId: topFacility.id });
                }}
                className="cursor-pointer group p-4 rounded-xl border border-brand-border bg-brand-bg/50 hover:bg-brand-bg hover:border-brand-primary/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-secondary/60 px-2 py-0.5 rounded">
                    Điểm nóng cơ sở
                  </span>
                  <Building2 className="w-4 h-4 text-brand-primary" />
                </div>
                <h4 className="text-sm font-semibold text-brand-text group-hover:text-brand-primary transition-colors">
                  {topFacility ? topFacility.name : 'Chưa có dữ liệu'}
                </h4>
                <p className="text-xs text-brand-muted mt-1">
                  Đang ghi nhận số lượng sự cố cao nhất ({topFacility ? topFacility.count : 0} vấn đề trong kỳ lọc).
                </p>
                <div className="mt-3 flex items-center text-xs font-semibold text-brand-primary gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Xem hồ sơ cơ sở này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Xu hướng theo thời gian */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-brand-border/70 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-primary" />
                  <h3 className="font-bold text-sm text-brand-text">Xu hướng ghi nhận vấn đề theo thời gian</h3>
                </div>
                <span className="text-xs text-brand-muted">Đơn vị: Số hồ sơ</span>
              </div>

              <div className="h-64 w-full">
                {timeTrendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                    Chưa có đủ mốc thời gian để vẽ đồ thị
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6B4E3D" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6B4E3D" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE1" />
                      <XAxis dataKey="displayDate" stroke="#77716B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#77716B" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8DED3', borderRadius: '8px', fontSize: '12px' }}
                        labelFormatter={(label) => `Ngày ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        name="Tổng số vấn đề"
                        stroke="#6B4E3D" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Cơ cấu theo nguồn ghi nhận */}
            <div className="bg-white rounded-xl border border-brand-border/70 p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-brand-primary" />
                  <h3 className="font-bold text-sm text-brand-text">Cơ cấu theo nguồn</h3>
                </div>
              </div>

              <div className="h-56 w-full relative flex-1 flex items-center justify-center">
                {sourceChartData.length === 0 ? (
                  <span className="text-xs text-brand-muted">Không có dữ liệu</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {sourceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8DED3', borderRadius: '8px', fontSize: '12px' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend with direct filter click */}
              <div className="space-y-1.5 pt-2 border-t border-brand-border/50 text-xs">
                {sourceChartData.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => onNavigateToIssuesWithFilter({ source: item.name })}
                    className="w-full flex items-center justify-between p-1 rounded hover:bg-brand-bg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-brand-text truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-brand-text">{item.value} ({totalCount ? Math.round((item.value / totalCount) * 100) : 0}%)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Recent Issues & Longest Open Issues */}
          <div className="bg-white rounded-xl border border-brand-border/70 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-brand-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-text">Danh sách hồ sơ</span>
                <div className="flex bg-brand-bg p-0.5 rounded-lg border border-brand-secondary/60 text-xs">
                  <button
                    onClick={() => setListTab('recent')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      listTab === 'recent'
                        ? 'bg-brand-primary text-white font-semibold'
                        : 'text-brand-text hover:text-brand-primary'
                    }`}
                  >
                    Hồ sơ mới nhất
                  </button>
                  <button
                    onClick={() => setListTab('longest_open')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      listTab === 'longest_open'
                        ? 'bg-brand-primary text-white font-semibold'
                        : 'text-brand-text hover:text-brand-primary'
                    }`}
                  >
                    Hồ sơ tồn lâu nhất ({openCount})
                  </button>
                </div>
              </div>

              <button
                onClick={() => onNavigateToIssuesWithFilter({})}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
              >
                <span>Xem tất cả hồ sơ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Issues List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-brand-bg/60 text-brand-muted text-xs uppercase font-medium border-b border-brand-border/60">
                  <tr>
                    <th className="py-3 px-4">Mã hồ sơ</th>
                    <th className="py-3 px-4">Cơ sở / Phòng</th>
                    <th className="py-3 px-4">Nội dung tóm tắt</th>
                    <th className="py-3 px-4">Nguồn</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Thời gian mở</th>
                    <th className="py-3 px-4 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 text-brand-text">
                  {displayList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-brand-muted">
                        Không có hồ sơ nào trong danh mục này.
                      </td>
                    </tr>
                  ) : (
                    displayList.map((issue) => (
                      <tr 
                        key={issue.id} 
                        onClick={() => onSelectIssue(issue)}
                        className="hover:bg-brand-bg/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-brand-primary">
                          {issue.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-brand-text">{issue.facility_name}</div>
                          {issue.room ? (
                            <span className="text-xs text-brand-muted">{issue.room}</span>
                          ) : (
                            <span className="text-[11px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded">Chưa rõ phòng</span>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate font-medium">
                          {issue.title}
                        </td>
                        <td className="py-3 px-4">
                          <SourceBadge source={issue.source} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={issue.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-xs text-brand-muted">
                          {getIssueAgeText(issue.createdAt, issue.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIssue(issue);
                            }}
                            className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            Xem <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

