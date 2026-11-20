import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  X, 
  Eye, 
  Edit3, 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Building,
  RotateCcw
} from 'lucide-react';
import { 
  Issue, 
  Facility, 
  IssueCategory, 
  IssueFilterState, 
  AgeFilter,
  IssueStatus 
} from '../../types';
import { StatusBadge, SourceBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { formatDateTimeVi, getIssueAgeText, getAgeBracket } from '../../utils/dateUtils';

interface IssuesTabProps {
  issues: Issue[];
  facilities: Facility[];
  categories: IssueCategory[];
  assignees: string[];
  filterState: IssueFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<IssueFilterState>>;
  onOpenCreateModal: () => void;
  onOpenEditModal: (issue: Issue) => void;
  onSelectIssue: (issue: Issue) => void;
  onNavigateToImport: () => void;
}

export const IssuesTab: React.FC<IssuesTabProps> = ({
  issues,
  facilities,
  categories,
  assignees,
  filterState,
  setFilterState,
  onOpenCreateModal,
  onOpenEditModal,
  onSelectIssue,
  onNavigateToImport,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter application
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Search query
      if (filterState.searchQuery.trim()) {
        const query = filterState.searchQuery.toLowerCase();
        const matchId = issue.id.toLowerCase().includes(query);
        const matchFac = issue.facility_name.toLowerCase().includes(query);
        const matchRoom = (issue.room || '').toLowerCase().includes(query);
        const matchTitle = issue.title.toLowerCase().includes(query);
        const matchDesc = issue.description.toLowerCase().includes(query);
        if (!matchId && !matchFac && !matchRoom && !matchTitle && !matchDesc) return false;
      }

      // Facility
      if (filterState.facilityId && filterState.facilityId !== 'all') {
        if (issue.facility_id !== filterState.facilityId) return false;
      }

      // Source
      if (filterState.source && filterState.source !== 'all') {
        if (issue.source !== filterState.source) return false;
      }

      // Category
      if (filterState.category && filterState.category !== 'all') {
        if (issue.category !== filterState.category) return false;
      }

      // Status
      if (filterState.status && filterState.status !== 'all') {
        if (issue.status !== filterState.status) return false;
      }

      // Assignee
      if (filterState.assignee && filterState.assignee !== 'all') {
        if (issue.assignee !== filterState.assignee) return false;
      }

      // Age filter
      if (filterState.ageFilter && filterState.ageFilter !== 'all') {
        const bracket = getAgeBracket(issue.createdAt);
        if (bracket !== filterState.ageFilter) return false;
      }

      // Missing or unverified only
      if (filterState.missingOnly) {
        if (issue.isVerified && !issue.hasMissingInfo) return false;
      }

      return true;
    });
  }, [issues, filterState]);

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / pageSize) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIssues.slice(start, start + pageSize);
  }, [filteredIssues, currentPage]);

  const handleResetFilters = () => {
    setFilterState({
      searchQuery: '',
      facilityId: 'all',
      source: 'all',
      category: 'all',
      status: 'all',
      assignee: 'all',
      ageFilter: 'all',
      dateFrom: '',
      dateTo: '',
      missingOnly: false,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    filterState.searchQuery || 
    filterState.facilityId !== 'all' || 
    filterState.source !== 'all' || 
    filterState.category !== 'all' || 
    filterState.status !== 'all' || 
    filterState.assignee !== 'all' || 
    filterState.ageFilter !== 'all' || 
    filterState.missingOnly;

  return (
    <div className="space-y-5">
      {/* Search & Top Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => {
                setFilterState(prev => ({ ...prev, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Tìm theo mã hồ sơ, cơ sở, phòng, nội dung..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-brand-bg/60 border border-brand-secondary rounded-lg text-brand-text placeholder-brand-muted/70 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setFilterState(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-brand-muted hover:text-brand-text bg-white border border-brand-secondary hover:bg-brand-bg rounded-lg transition-colors"
                title="Bỏ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa lọc</span>
              </button>
            )}

            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo hồ sơ</span>
            </button>
          </div>
        </div>

        {/* Filter Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2 border-t border-brand-border/50 text-xs">
          {/* Facility Filter */}
          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Cơ sở</label>
            <select
              value={filterState.facilityId}
              onChange={(e) => {
                setFilterState(prev => ({ ...prev, facilityId: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-md px-2 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả cơ sở</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Nguồn</label>
            <select
              value={filterState.source}
              onChange={(e) => {
                setFilterState(prev => ({ ...prev, source: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-md px-2 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="Khách hàng phản ánh">Khách hàng phản ánh</option>
              <option value="Nội bộ phát hiện">Nội bộ phát hiện</option>
              <option value="Hướng dẫn khách">Hướng dẫn khách</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Nhóm vấn đề</label>
            <select
              value={filterState.category}
              onChange={(e) => {
                setFilterState(prev => ({ ...prev, category: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-md px-2 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả nhóm</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Trạng thái</label>
            <select
              value={filterState.status}
              onChange={(e) => {
                setFilterState(prev => ({ ...prev, status: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-md px-2 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chưa xử lý">Chưa xử lý</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Cần theo dõi">Cần theo dõi</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Người phụ trách</label>
            <select
              value={filterState.assignee}
              onChange={(e) => {
                setFilterState(prev => ({ ...prev, assignee: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-md px-2 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả nhân sự</option>
              {assignees.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Age Bracket Filter */}
          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Tuổi hồ sơ</label>
            <select
              value={filterState.ageFilter}
              onChange={(e) => {
                setFilterState(prev => ({ ...prev, ageFilter: e.target.value as AgeFilter }));
                setCurrentPage(1);
              }}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-md px-2 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả mốc tuổi</option>
              <option value="<1w">Dưới 1 tuần</option>
              <option value="1-2w">1 – 2 tuần</option>
              <option value="2-4w">2 – 4 tuần</option>
              <option value=">4w">Trên 4 tuần</option>
            </select>
          </div>

          {/* Missing info toggle */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => {
                setFilterState(prev => ({ ...prev, missingOnly: !prev.missingOnly }));
                setCurrentPage(1);
              }}
              className={`w-full py-1.5 px-2 rounded-md font-medium text-xs border transition-colors flex items-center justify-center gap-1 ${
                filterState.missingOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-brand-bg/60 text-brand-muted border-brand-secondary hover:text-brand-text'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Cần rà soát</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-xl border border-brand-border/70 shadow-xs overflow-hidden">
        {/* Table summary bar */}
        <div className="px-5 py-3 border-b border-brand-border/60 bg-brand-bg/30 flex items-center justify-between text-xs text-brand-muted">
          <span>
            Hiển thị <strong>{filteredIssues.length}</strong> hồ sơ phù hợp
          </span>
          <span>Trang {currentPage} / {totalPages}</span>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-bg/80 text-brand-muted text-xs uppercase font-semibold border-b border-brand-border/60">
              <tr>
                <th className="py-3 px-4">Mã hồ sơ</th>
                <th className="py-3 px-4">Ngày ghi nhận</th>
                <th className="py-3 px-4">Cơ sở / Phòng</th>
                <th className="py-3 px-4">Nội dung tóm tắt</th>
                <th className="py-3 px-4">Nhóm vấn đề</th>
                <th className="py-3 px-4">Nguồn</th>
                <th className="py-3 px-4">Người phụ trách</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thời gian mở</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-text">
              {paginatedIssues.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12">
                    <EmptyState
                      title="Không tìm thấy hồ sơ nào"
                      description="Không có hồ sơ vấn đề nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại."
                      actionText="Tạo hồ sơ mới"
                      onAction={onOpenCreateModal}
                      secondaryActionText="Bỏ bộ lọc"
                      onSecondaryAction={handleResetFilters}
                    />
                  </td>
                </tr>
              ) : (
                paginatedIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-brand-bg/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-primary">
                      {issue.id}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-brand-muted whitespace-nowrap">
                      {formatDateTimeVi(issue.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-text">{issue.facility_name}</div>
                      {issue.room ? (
                        <span className="text-xs text-brand-muted">{issue.room}</span>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                          Chưa rõ phòng
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs font-medium truncate" title={issue.title}>
                      {issue.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-brand-muted">
                      {issue.category}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SourceBadge source={issue.source} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-brand-text whitespace-nowrap">
                      {issue.assignee || <span className="text-brand-muted italic">Chưa giao</span>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-brand-muted whitespace-nowrap">
                      {getIssueAgeText(issue.createdAt, issue.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="p-1.5 text-brand-muted hover:text-brand-primary hover:bg-brand-secondary/40 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(issue)}
                          className="p-1.5 text-brand-muted hover:text-brand-primary hover:bg-brand-secondary/40 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-brand-border/60 bg-white flex items-center justify-between">
            <span className="text-xs text-brand-muted">
              Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredIssues.length)} trong {filteredIssues.length} kết quả
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-brand-secondary text-brand-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-bg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'text-brand-text hover:bg-brand-bg border border-transparent'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-brand-secondary text-brand-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-bg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

