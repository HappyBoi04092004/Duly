import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Filter, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  Building2, 
  Sparkles,
  TrendingUp,
  FileText
} from 'lucide-react';
import { 
  Issue, 
  Facility, 
  IssueCategory, 
  BookingRecord, 
  IssueFilterState 
} from '../../types';
import { StatCard } from '../common/StatCard';

interface ReportsTabProps {
  issues: Issue[];
  facilities: Facility[];
  categories: IssueCategory[];
  bookings: BookingRecord[];
  onNavigateToIssuesWithFilter: (filters: Partial<IssueFilterState>) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  issues,
  facilities,
  categories,
  bookings,
  onNavigateToIssuesWithFilter,
}) => {
  // Period filter
  const [periodType, setPeriodType] = useState<'week' | 'month' | 'all'>('week');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-W46');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Draft report text state
  const [reportDraftText, setReportDraftText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Available weeks from bookings and issues
  const availableWeeks = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => { if (b.week_str) set.add(b.week_str); });
    set.add('2026-W47');
    set.add('2026-W46');
    set.add('2026-W45');
    return Array.from(set).sort().reverse();
  }, [bookings]);

  // Filter issues based on report filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (facilityFilter !== 'all' && issue.facility_id !== facilityFilter) return false;
      if (sourceFilter !== 'all' && issue.source !== sourceFilter) return false;
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
      return true;
    });
  }, [issues, facilityFilter, sourceFilter, categoryFilter]);

  // Filter bookings based on period and facility
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (periodType === 'week' && selectedPeriod && b.week_str !== selectedPeriod) {
        return false;
      }
      if (facilityFilter !== 'all' && b.facility_id !== facilityFilter) {
        return false;
      }
      return true;
    });
  }, [bookings, periodType, selectedPeriod, facilityFilter]);

  // Key Aggregations
  const totalIssuesInPeriod = filteredIssues.length;
  const customerFeedbackCount = filteredIssues.filter(i => i.source === 'Khách hàng phản ánh').length;
  const internalIssuesCount = filteredIssues.filter(i => i.source === 'Nội bộ phát hiện').length;
  const customerGuidanceCount = filteredIssues.filter(i => i.source === 'Hướng dẫn khách').length;
  const openIssuesCount = filteredIssues.filter(i => i.status !== 'Đã hoàn thành').length;

  const totalBookingCheckout = useMemo(() => {
    return filteredBookings.reduce((sum, b) => sum + (b.booking_count || 0), 0);
  }, [filteredBookings]);

  // Ratio calculation: (Customer issues / Total booking checkout) * 100
  const overallRate = useMemo(() => {
    if (totalBookingCheckout <= 0) return null;
    return Number(((customerFeedbackCount / totalBookingCheckout) * 100).toFixed(2));
  }, [customerFeedbackCount, totalBookingCheckout]);

  // Facility Table Breakdown
  const facilityRows = useMemo(() => {
    const list = facilityFilter === 'all' 
      ? facilities 
      : facilities.filter(f => f.id === facilityFilter);

    return list.map(fac => {
      const facIssues = filteredIssues.filter(i => i.facility_id === fac.id);
      const custCount = facIssues.filter(i => i.source === 'Khách hàng phản ánh').length;
      const intCount = facIssues.filter(i => i.source === 'Nội bộ phát hiện').length;
      const opCount = facIssues.filter(i => i.status !== 'Đã hoàn thành').length;

      // Group issues by category to find top category
      const catCountMap = new Map<string, number>();
      facIssues.forEach(i => {
        catCountMap.set(i.category, (catCountMap.get(i.category) || 0) + 1);
      });

      let topCategories: { name: string; count: number }[] = [];
      let maxCount = 0;
      catCountMap.forEach((cnt, catName) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          topCategories = [{ name: catName, count: cnt }];
        } else if (cnt === maxCount && maxCount > 0) {
          topCategories.push({ name: catName, count: cnt });
        }
      });

      // Total bookings for this facility in selected period
      const facBookings = filteredBookings.filter(b => b.facility_id === fac.id);
      const facTotalBooking = facBookings.reduce((sum, b) => sum + b.booking_count, 0);

      const rate = facTotalBooking > 0 
        ? Number(((custCount / facTotalBooking) * 100).toFixed(2)) 
        : null;

      return {
        facilityId: fac.id,
        facilityName: fac.name,
        customerFeedback: custCount,
        internalDiscovered: intCount,
        topCategories,
        totalBookings: facTotalBooking,
        rate,
        openIssues: opCount,
      };
    });
  }, [facilities, filteredIssues, filteredBookings, facilityFilter]);

  // Generate automated smart draft report whenever data changes
  useMemo(() => {
    const topFacility = [...facilityRows].sort((a, b) => b.customerFeedback - a.customerFeedback)[0];
    
    // Group all categories
    const allCatMap = new Map<string, number>();
    filteredIssues.forEach(i => {
      allCatMap.set(i.category, (allCatMap.get(i.category) || 0) + 1);
    });
    const sortedCats = Array.from(allCatMap.entries()).sort((a, b) => b[1] - a[1]);
    const topCatName = sortedCats[0] ? `${sortedCats[0][0]} (${sortedCats[0][1]} vụ)` : 'Chưa có';

    const periodLabel = periodType === 'week' ? `Tuần ${selectedPeriod}` : 'Kỳ hiện tại';

    const draft = `BÁO CÁO VẬN HÀNH DULY'S HOUSE - ${periodLabel.toUpperCase()}
1. TỔNG QUAN CHỈ SỐ:
- Tổng số vấn đề phát sinh: ${totalIssuesInPeriod} hồ sơ.
- Cơ cấu nguồn: Khách hàng phản ánh: ${customerFeedbackCount} vụ (${totalIssuesInPeriod ? Math.round((customerFeedbackCount/totalIssuesInPeriod)*100) : 0}%), Nội bộ phát hiện: ${internalIssuesCount} vụ, Hướng dẫn khách: ${customerGuidanceCount} vụ.
- Tình trạng xử lý: ${openIssuesCount} hồ sơ còn mở chưa đóng (${totalIssuesInPeriod ? Math.round((openIssuesCount/totalIssuesInPeriod)*100) : 0}%).
- Tổng lượng booking checkout: ${totalBookingCheckout > 0 ? `${totalBookingCheckout.toLocaleString('vi-VN')} lượt` : 'Chưa đủ dữ liệu booking để tính'}.
- Tỷ lệ phản ánh trên 100 booking: ${overallRate !== null ? `${overallRate}%` : 'Chưa đủ dữ liệu booking để tính'}.

2. CƠ SỞ VÀ NHÓM VẤN ĐỀ NỔI BẬT:
- Nhóm vấn đề ghi nhận nhiều phản ánh nhất: ${topCatName}.
- Cơ sở cần chú ý nhất: ${topFacility && topFacility.customerFeedback > 0 ? `${topFacility.facilityName} (${topFacility.customerFeedback} phản ánh từ khách)` : 'Tất cả các cơ sở đều ổn định'}.

3. ĐỀ XUẤT HÀNH ĐỘNG VẬN HÀNH:
- Ưu tiên xử lý dứt điểm các hồ sơ tồn đọng mở trên 1 tuần tại các cơ sở điểm nóng.
- Rà soát các hồ sơ chưa xác minh số phòng để chốt phương án bảo dưỡng.`;

    setReportDraftText(draft);
  }, [facilityRows, filteredIssues, totalIssuesInPeriod, customerFeedbackCount, internalIssuesCount, customerGuidanceCount, openIssuesCount, totalBookingCheckout, overallRate, periodType, selectedPeriod]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportDraftText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-brand-border/40">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-text">
            <Filter className="w-4 h-4 text-brand-primary" />
            <span>Bộ lọc báo cáo vận hành</span>
          </div>

          {/* Period Type Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-muted">Chọn kỳ:</span>
            <div className="flex items-center bg-brand-bg p-1 rounded-lg border border-brand-secondary/60 text-xs font-medium">
              <button
                onClick={() => setPeriodType('week')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  periodType === 'week' ? 'bg-brand-primary text-white font-semibold' : 'text-brand-text'
                }`}
              >
                Theo tuần
              </button>
              <button
                onClick={() => setPeriodType('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  periodType === 'all' ? 'bg-brand-primary text-white font-semibold' : 'text-brand-text'
                }`}
              >
                Toàn thời gian
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 text-xs">
          {periodType === 'week' && (
            <div>
              <label className="block text-[11px] font-medium text-brand-muted mb-1">Kỳ tuần</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-2.5 py-1.5 text-brand-text font-medium"
              >
                {availableWeeks.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Cơ sở</label>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-2.5 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả 14 cơ sở</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Nguồn ghi nhận</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-2.5 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="Khách hàng phản ánh">Khách hàng phản ánh</option>
              <option value="Nội bộ phát hiện">Nội bộ phát hiện</option>
              <option value="Hướng dẫn khách">Hướng dẫn khách</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-brand-muted mb-1">Nhóm vấn đề</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-2.5 py-1.5 text-brand-text"
            >
              <option value="all">Tất cả nhóm</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Tổng vấn đề trong kỳ"
          value={totalIssuesInPeriod}
          subValue="hồ sơ"
          icon={<FileText className="w-5 h-5" />}
          onClick={() => onNavigateToIssuesWithFilter({})}
          hint="Xem hồ sơ"
        />

        <StatCard
          title="Khách hàng phản ánh"
          value={customerFeedbackCount}
          subValue="vụ việc"
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          badgeColor="bg-red-50 text-red-800"
          onClick={() => onNavigateToIssuesWithFilter({ source: 'Khách hàng phản ánh' })}
          hint="Bấm để lọc"
        />

        <StatCard
          title="Booking checkout"
          value={totalBookingCheckout > 0 ? totalBookingCheckout.toLocaleString('vi-VN') : '—'}
          subValue={totalBookingCheckout > 0 ? 'lượt checkout' : 'Chưa có dữ liệu'}
          icon={<Calendar className="w-5 h-5 text-blue-600" />}
          hint={totalBookingCheckout === 0 ? 'Chưa đủ dữ liệu' : 'Từ file booking'}
        />

        <div className="bg-white rounded-xl p-5 border border-brand-border/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-brand-muted">Tỷ lệ trên 100 booking</span>
            <div className="p-2 rounded-lg bg-brand-bg text-brand-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {overallRate !== null ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-brand-primary">
                  {overallRate}%
                </span>
                <span className="text-xs text-brand-muted">phản ánh / 100 booking</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 block">
                Chưa đủ dữ liệu booking để tính
              </span>
            )}
          </div>
          <p className="text-[11px] text-brand-muted mt-2">
            Công thức: (Phản ánh khách ÷ Booking checkout) × 100
          </p>
        </div>

        <StatCard
          title="Hồ sơ còn mở"
          value={openIssuesCount}
          subValue="chưa đóng"
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          badge={openIssuesCount > 0 ? 'Cần xử lý' : 'Đã hoàn tất'}
          badgeColor={openIssuesCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'}
          onClick={() => onNavigateToIssuesWithFilter({ status: 'Đang xử lý' })}
          hint="Bấm để lọc"
        />
      </div>

      {/* Facility Table Breakdown (Specification Section 7: Bảng theo cơ sở) */}
      <div className="bg-white rounded-xl border border-brand-border/70 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-border/60 bg-brand-bg/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-brand-text">Bảng chi tiết theo cơ sở</h3>
            <p className="text-xs text-brand-muted">
              Nhấp vào bất kỳ số liệu nào để mở danh sách các hồ sơ tương ứng
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-primary">
            {facilityRows.length} cơ sở
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-bg/80 text-brand-muted uppercase text-xs font-semibold border-b border-brand-border/60">
              <tr>
                <th className="py-3 px-4">Cơ sở</th>
                <th className="py-3 px-4 text-center">Phản ánh khách</th>
                <th className="py-3 px-4 text-center">Vấn đề nội bộ</th>
                <th className="py-3 px-4">Nhóm nổi bật nhất</th>
                <th className="py-3 px-4 text-right">Booking checkout</th>
                <th className="py-3 px-4 text-right">Tỷ lệ / 100 booking</th>
                <th className="py-3 px-4 text-center">Hồ sơ còn mở</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-text">
              {facilityRows.map((row) => (
                <tr key={row.facilityId} className="hover:bg-brand-bg/40 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToIssuesWithFilter({ facilityId: row.facilityId })}
                      className="font-bold text-brand-text hover:text-brand-primary hover:underline text-left inline-flex items-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                      <span>{row.facilityName}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {row.customerFeedback > 0 ? (
                      <button
                        onClick={() => onNavigateToIssuesWithFilter({ facilityId: row.facilityId, source: 'Khách hàng phản ánh' })}
                        className="font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200 transition-colors"
                        title="Bấm để xem hồ sơ"
                      >
                        {row.customerFeedback}
                      </button>
                    ) : (
                      <span className="text-brand-muted">0</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {row.internalDiscovered > 0 ? (
                      <button
                        onClick={() => onNavigateToIssuesWithFilter({ facilityId: row.facilityId, source: 'Nội bộ phát hiện' })}
                        className="font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                        title="Bấm để xem hồ sơ"
                      >
                        {row.internalDiscovered}
                      </button>
                    ) : (
                      <span className="text-brand-muted">0</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {row.topCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.topCategories.map(cat => (
                          <button
                            key={cat.name}
                            onClick={() => onNavigateToIssuesWithFilter({ facilityId: row.facilityId, category: cat.name })}
                            className="text-xs bg-brand-bg hover:bg-brand-secondary/60 text-brand-text px-2 py-0.5 rounded border border-brand-secondary transition-colors"
                            title={`Xem các hồ sơ thuộc nhóm "${cat.name}"`}
                          >
                            {cat.name} ({cat.count})
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-brand-muted italic">Không có sự cố</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-medium">
                    {row.totalBookings > 0 ? (
                      <span>{row.totalBookings.toLocaleString('vi-VN')}</span>
                    ) : (
                      <span className="text-xs text-brand-muted italic">Thiếu file</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {row.rate !== null ? (
                      <span className="font-bold text-brand-primary">
                        {row.rate}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-800 italic bg-amber-50 px-1.5 py-0.5 rounded">
                        Chưa đủ dữ liệu booking để tính
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {row.openIssues > 0 ? (
                      <button
                        onClick={() => onNavigateToIssuesWithFilter({ facilityId: row.facilityId, status: 'Đang xử lý' })}
                        className="font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200"
                      >
                        {row.openIssues}
                      </button>
                    ) : (
                      <span className="text-xs text-green-700 font-medium">0 (Đã đóng)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Report Draft & Copy Section (Specification Section 7: Nhận xét báo cáo) */}
      <div className="bg-white rounded-xl border border-brand-border/70 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-bg text-brand-primary">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-brand-text">Bản nháp nhận xét báo cáo tự động</h3>
              <p className="text-xs text-brand-muted">
                Hệ thống tổng hợp nhận xét dựa trên dữ liệu thật. Bạn có thể chỉnh sửa trực tiếp trước khi sao chép.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-xs shrink-0"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Đã sao chép vào bộ nhớ tạm' : 'Sao chép nhận xét'}</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            rows={10}
            value={reportDraftText}
            onChange={(e) => setReportDraftText(e.target.value)}
            className="w-full bg-brand-bg/50 border border-brand-secondary rounded-xl p-4 font-mono text-xs sm:text-sm leading-relaxed text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
            placeholder="Nội dung nhận xét báo cáo..."
          />
        </div>

        <div className="flex items-center justify-between text-xs text-brand-muted">
          <span>* Nhận xét hoàn toàn dựa trên dữ liệu hiển thị, không suy đoán ngoài số liệu.</span>
          <span>{reportDraftText.length} ký tự</span>
        </div>
      </div>
    </div>
  );
};

