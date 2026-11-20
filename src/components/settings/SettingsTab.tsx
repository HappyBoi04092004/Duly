import React, { useState } from 'react';
import { 
  Building, 
  Layers, 
  Users, 
  Shield, 
  Database, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Download, 
  Upload, 
  RefreshCw,
  Search,
  Lock,
  DoorOpen
} from 'lucide-react';
import { 
  Facility, 
  IssueCategory, 
  GeneralSettings, 
  Issue 
} from '../../types';
import { 
  resetToDemoData, 
  exportAllDataJSON, 
  importAllDataJSON, 
  clearAllData 
} from '../../services/storage';

interface SettingsTabProps {
  facilities: Facility[];
  categories: IssueCategory[];
  assignees: string[];
  settings: GeneralSettings;
  issues: Issue[];
  onUpdateFacilities: (facilities: Facility[]) => void;
  onUpdateCategories: (categories: IssueCategory[]) => void;
  onUpdateAssignees: (assignees: string[]) => void;
  onUpdateSettings: (settings: GeneralSettings) => void;
  onRefreshData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  facilities,
  categories,
  assignees,
  settings,
  issues,
  onUpdateFacilities,
  onUpdateCategories,
  onUpdateAssignees,
  onUpdateSettings,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'facilities' | 'categories' | 'assignees' | 'system'>('facilities');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Facility Edit / Add Modal state
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [isAddFacilityOpen, setIsAddFacilityOpen] = useState<boolean>(false);
  const [facCode, setFacCode] = useState<string>('');
  const [facName, setFacName] = useState<string>('');
  const [facAddress, setFacAddress] = useState<string>('');
  const [facRoomsStr, setFacRoomsStr] = useState<string>('');

  // Category Edit / Add Modal state
  const [editingCategory, setEditingCategory] = useState<IssueCategory | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [catName, setCatName] = useState<string>('');
  const [catDesc, setCatDesc] = useState<string>('');

  // Assignee Add state
  const [newAssigneeName, setNewAssigneeName] = useState<string>('');

  // Notice Toast
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Facility Actions
  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facCode.trim() || !facName.trim()) return;

    const rooms = facRoomsStr
      .split(',')
      .map(r => r.trim())
      .filter(Boolean);

    if (editingFacility) {
      const updated = facilities.map(f => 
        f.id === editingFacility.id
          ? { ...f, code: facCode.trim(), name: facName.trim(), address: facAddress.trim(), rooms }
          : f
      );
      onUpdateFacilities(updated);
      showNotice(`Đã cập nhật thông tin cơ sở "${facName}"`);
    } else {
      const newFac: Facility = {
        id: `FAC-${String(facilities.length + 1).padStart(2, '0')}`,
        code: facCode.trim(),
        name: facName.trim(),
        address: facAddress.trim(),
        rooms,
        status: 'active',
      };
      onUpdateFacilities([...facilities, newFac]);
      showNotice(`Đã thêm mới cơ sở "${facName}"`);
    }

    setEditingFacility(null);
    setIsAddFacilityOpen(false);
  };

  const handleToggleFacilityStatus = (facility: Facility) => {
    const isUsing = issues.some(i => i.facility_id === facility.id);
    const newStatus = facility.status === 'active' ? 'inactive' : 'active';

    if (newStatus === 'inactive' && isUsing) {
      if (!confirm(`Cơ sở "${facility.name}" đang có các hồ sơ vấn đề liên kết. Hệ thống sẽ chuyển sang trạng thái "Ngừng sử dụng" để giữ lịch sử thay vì xóa. Bạn có đồng ý không?`)) {
        return;
      }
    }

    const updated = facilities.map(f => f.id === facility.id ? { ...f, status: newStatus as any } : f);
    onUpdateFacilities(updated);
    showNotice(`Đã chuyển cơ sở "${facility.name}" sang trạng thái ${newStatus === 'active' ? 'Đang hoạt động' : 'Ngừng sử dụng'}`);
  };

  // Category Actions
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      const updated = categories.map(c => 
        c.id === editingCategory.id ? { ...c, name: catName.trim(), description: catDesc.trim() } : c
      );
      onUpdateCategories(updated);
      showNotice(`Đã cập nhật nhóm "${catName}"`);
    } else {
      const newCat: IssueCategory = {
        id: `CAT-${String(categories.length + 1).padStart(2, '0')}`,
        name: catName.trim(),
        description: catDesc.trim(),
        status: 'active',
      };
      onUpdateCategories([...categories, newCat]);
      showNotice(`Đã thêm nhóm "${catName}"`);
    }

    setEditingCategory(null);
    setIsAddCategoryOpen(false);
  };

  const handleToggleCategoryStatus = (category: IssueCategory) => {
    const isUsing = issues.some(i => i.category === category.name);
    const newStatus = category.status === 'active' ? 'inactive' : 'active';

    if (newStatus === 'inactive' && isUsing) {
      if (!confirm(`Nhóm "${category.name}" đang được sử dụng trong các hồ sơ vấn đề. Chuyển sang "Ngừng sử dụng" để bảo toàn dữ liệu?`)) {
        return;
      }
    }

    const updated = categories.map(c => c.id === category.id ? { ...c, status: newStatus as any } : c);
    onUpdateCategories(updated);
    showNotice(`Đã chuyển nhóm sang trạng thái ${newStatus === 'active' ? 'Hoạt động' : 'Ngừng sử dụng'}`);
  };

  // Assignee Actions
  const handleAddAssignee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssigneeName.trim()) return;
    if (assignees.includes(newAssigneeName.trim())) {
      alert('Nhân sự này đã có trong danh sách');
      return;
    }
    const updated = [...assignees, newAssigneeName.trim()];
    onUpdateAssignees(updated);
    setNewAssigneeName('');
    showNotice(`Đã thêm nhân sự "${newAssigneeName.trim()}"`);
  };

  // System Backup / Reset Actions
  const handleExportBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duly_house_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Đã tải xuống file sao lưu hệ thống toàn vẹn');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllDataJSON(content);
      if (success) {
        onRefreshData();
        showNotice('Khôi phục dữ liệu từ file sao lưu thành công!');
      } else {
        alert('File không hợp lệ hoặc bị lỗi cấu trúc JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu mẫu gốc (14 cơ sở, danh mục chuẩn, hồ sơ mẫu & booking mẫu v13)? Mọi thay đổi hiện tại sẽ được thay thế bằng dữ liệu demo.')) {
      resetToDemoData();
      onRefreshData();
      showNotice('Đã khôi phục dữ liệu mẫu gốc thành công');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="p-3 bg-brand-primary text-white text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-300" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="bg-white p-2 rounded-xl border border-brand-border/70 flex flex-wrap gap-2 shadow-xs">
        <button
          onClick={() => setActiveSubTab('facilities')}
          className={`py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'facilities'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-brand-text hover:bg-brand-bg'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Danh mục 14 Cơ sở ({facilities.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'categories'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-brand-text hover:bg-brand-bg'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Nhóm vấn đề ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('assignees')}
          className={`py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'assignees'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-brand-text hover:bg-brand-bg'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Người phụ trách ({assignees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system')}
          className={`py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'system'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-brand-text hover:bg-brand-bg'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Hệ thống & Dữ liệu</span>
        </button>
      </div>

      {/* SUBTAB 1: FACILITIES */}
      {activeSubTab === 'facilities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm cơ sở hoặc mã..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-brand-bg/60 border border-brand-secondary rounded-lg text-brand-text"
              />
            </div>

            <button
              onClick={() => {
                setEditingFacility(null);
                setFacCode(`DULY-${String(facilities.length + 1).padStart(2, '0')}`);
                setFacName('');
                setFacAddress('');
                setFacRoomsStr('');
                setIsAddFacilityOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm cơ sở mới</span>
            </button>
          </div>

          {/* Facilities List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities
              .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.code.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(fac => {
                const countIssues = issues.filter(i => i.facility_id === fac.id).length;
                return (
                  <div key={fac.id} className="bg-white rounded-xl border border-brand-border/70 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-brand-primary bg-brand-secondary/40 px-2 py-0.5 rounded">
                          {fac.code}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${fac.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {fac.status === 'active' ? 'Hoạt động' : 'Ngừng dùng'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-brand-text mb-1">{fac.name}</h4>
                      {fac.address && <p className="text-xs text-brand-muted mb-2">{fac.address}</p>}

                      {/* Rooms list */}
                      <div className="pt-2 border-t border-brand-border/40">
                        <span className="text-[11px] font-medium text-brand-muted block mb-1">
                          Danh sách phòng ({fac.rooms.length}):
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                          {fac.rooms.map(r => (
                            <span key={r} className="text-[10px] bg-brand-bg text-brand-text px-1.5 py-0.5 rounded border border-brand-secondary/60">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-border/40 flex items-center justify-between text-xs">
                      <span className="text-brand-muted">
                        <strong>{countIssues}</strong> hồ sơ liên quan
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingFacility(fac);
                            setFacCode(fac.code);
                            setFacName(fac.name);
                            setFacAddress(fac.address || '');
                            setFacRoomsStr(fac.rooms.join(', '));
                            setIsAddFacilityOpen(true);
                          }}
                          className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-bg rounded"
                          title="Sửa cơ sở"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleFacilityStatus(fac)}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            fac.status === 'active'
                              ? 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100'
                              : 'text-green-800 bg-green-50 border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {fac.status === 'active' ? 'Ngừng dùng' : 'Kích hoạt lại'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ISSUE CATEGORIES */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-brand-border/70 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-brand-text">Phân loại nhóm vấn đề</h3>
              <p className="text-xs text-brand-muted">Được dùng khi tạo hồ sơ và phân tích báo cáo</p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCatName('');
                setCatDesc('');
                setIsAddCategoryOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nhóm vấn đề</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-brand-border/70 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-brand-bg/80 text-brand-muted uppercase text-xs font-semibold border-b border-brand-border/60">
                <tr>
                  <th className="py-3 px-4">Mã nhóm</th>
                  <th className="py-3 px-4">Tên nhóm vấn đề</th>
                  <th className="py-3 px-4">Mô tả chi tiết</th>
                  <th className="py-3 px-4">Số hồ sơ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-brand-text">
                {categories.map(cat => {
                  const count = issues.filter(i => i.category === cat.name).length;
                  return (
                    <tr key={cat.id} className="hover:bg-brand-bg/40">
                      <td className="py-3 px-4 font-mono font-bold text-brand-primary">{cat.id}</td>
                      <td className="py-3 px-4 font-semibold">{cat.name}</td>
                      <td className="py-3 px-4 text-brand-muted text-xs">{cat.description}</td>
                      <td className="py-3 px-4 font-bold">{count}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cat.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {cat.status === 'active' ? 'Hoạt động' : 'Ngừng dùng'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCatName(cat.name);
                              setCatDesc(cat.description);
                              setIsAddCategoryOpen(true);
                            }}
                            className="p-1 text-brand-muted hover:text-brand-text"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleCategoryStatus(cat)}
                            className="text-xs text-amber-800 hover:underline"
                          >
                            {cat.status === 'active' ? 'Ngừng dùng' : 'Kích hoạt'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ASSIGNEES */}
      {activeSubTab === 'assignees' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-brand-border/70 shadow-xs">
            <h3 className="text-sm font-bold text-brand-text mb-1">Thêm người phụ trách mới</h3>
            <form onSubmit={handleAddAssignee} className="flex gap-2 max-w-md mt-3">
              <input
                type="text"
                value={newAssigneeName}
                onChange={(e) => setNewAssigneeName(e.target.value)}
                placeholder="Ví dụ: Hoàng Tuấn Kiệt (Kỹ thuật điện)..."
                className="flex-1 bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-xs text-brand-text"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-primary rounded-lg shadow-xs hover:bg-brand-primary-hover"
              >
                Thêm nhân sự
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-brand-border/70 shadow-xs p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
              Danh sách nhân sự vận hành hiện tại ({assignees.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {assignees.map((name, idx) => {
                const count = issues.filter(i => i.assignee === name).length;
                return (
                  <div key={idx} className="p-3 rounded-lg bg-brand-bg/60 border border-brand-secondary/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-secondary text-brand-primary font-bold text-xs flex items-center justify-center">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-brand-text block">{name}</span>
                        <span className="text-[11px] text-brand-muted">{count} hồ sơ đang xử lý</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SYSTEM & DATA MANAGEMENT */}
      {activeSubTab === 'system' && (
        <div className="space-y-6">
          {/* Permission info block per spec */}
          <div className="bg-white p-5 rounded-xl border border-brand-border/70 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-bg text-brand-primary">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-brand-text">Thông tin phân quyền & Phiên bản site</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  <strong>Site:</strong> DuLy’s House | Operations (Phiên bản: v13.0) <br />
                  <strong>Quyền hiện ghi nhận:</strong> Chế độ tùy chỉnh, chỉ chủ sở hữu được cấp quyền theo tiêu chuẩn vận hành nội bộ.
                </p>
              </div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="bg-white p-5 rounded-xl border border-brand-border/70 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-brand-text">Sao lưu & Khôi phục dữ liệu toàn hệ thống</h3>
            <p className="text-xs text-brand-muted">
              Xuất toàn bộ 14 cơ sở, danh mục nhóm vấn đề, hồ sơ sự cố và số booking checkout thành tệp JSON an toàn.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Tải file sao lưu JSON</span>
              </button>

              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-text bg-white border border-brand-secondary hover:bg-brand-bg rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-brand-muted" />
                <span>Khôi phục từ file JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </label>

              <button
                onClick={handleResetData}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors ml-auto"
              >
                <RefreshCw className="w-4 h-4 text-amber-700" />
                <span>Đặt lại dữ liệu mẫu gốc (v13)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facility Edit Modal */}
      {isAddFacilityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-brand-border">
            <h3 className="text-base font-bold text-brand-text mb-4">
              {editingFacility ? 'Chỉnh sửa thông tin cơ sở' : 'Thêm cơ sở mới'}
            </h3>
            <form onSubmit={handleSaveFacility} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Mã cơ sở</label>
                <input
                  type="text"
                  required
                  value={facCode}
                  onChange={(e) => setFacCode(e.target.value)}
                  placeholder="Ví dụ: DULY-TD"
                  className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Tên cơ sở</label>
                <input
                  type="text"
                  required
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  placeholder="Ví dụ: DuLy Thảo Điền"
                  className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Địa chỉ / Khu vực</label>
                <input
                  type="text"
                  value={facAddress}
                  onChange={(e) => setFacAddress(e.target.value)}
                  placeholder="Ví dụ: Quận 2, TP.HCM"
                  className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Danh sách phòng (ngăn cách bằng dấu phẩy)
                </label>
                <textarea
                  rows={3}
                  value={facRoomsStr}
                  onChange={(e) => setFacRoomsStr(e.target.value)}
                  placeholder="P.101, P.102, P.201, Studio River..."
                  className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsAddFacilityOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-brand-text bg-white border border-brand-secondary rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-primary rounded-lg shadow-xs"
                >
                  Lưu cơ sở
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-brand-border">
            <h3 className="text-base font-bold text-brand-text mb-4">
              {editingCategory ? 'Chỉnh sửa nhóm vấn đề' : 'Thêm nhóm vấn đề mới'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Tên nhóm vấn đề</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ví dụ: An toàn & PCCC"
                  className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Mô tả hướng dẫn phân loại</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Ghi chú chi tiết phạm vi các vấn đề thuộc nhóm này..."
                  className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-brand-text bg-white border border-brand-secondary rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-primary rounded-lg shadow-xs"
                >
                  Lưu nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

