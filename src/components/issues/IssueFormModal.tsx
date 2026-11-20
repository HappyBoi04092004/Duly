import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { 
  Issue, 
  Facility, 
  IssueCategory, 
  IssueSource, 
  IssueStatus 
} from '../../types';

interface IssueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issueData: any, isEdit: boolean) => void;
  editingIssue?: Issue | null;
  facilities: Facility[];
  categories: IssueCategory[];
  assignees: string[];
}

export const IssueFormModal: React.FC<IssueFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingIssue,
  facilities,
  categories,
  assignees,
}) => {
  const [facilityId, setFacilityId] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [source, setSource] = useState<IssueSource>('Khách hàng phản ánh');
  const [assignee, setAssignee] = useState<string>('');
  const [status, setStatus] = useState<IssueStatus>('Chưa xử lý');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [initialNotes, setInitialNotes] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingIssue) {
      setFacilityId(editingIssue.facility_id);
      setRoom(editingIssue.room || '');
      setTitle(editingIssue.title);
      setDescription(editingIssue.description);
      setCategory(editingIssue.category);
      setSource(editingIssue.source);
      setAssignee(editingIssue.assignee);
      setStatus(editingIssue.status);
      setCreatedAt(editingIssue.createdAt ? editingIssue.createdAt.substring(0, 16) : '');
      setInitialNotes(editingIssue.initialNotes || '');
    } else {
      setFacilityId(facilities[0]?.id || '');
      setRoom('');
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.name || '');
      setSource('Khách hàng phản ánh');
      setAssignee(assignees[0] || '');
      setStatus('Chưa xử lý');
      
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setCreatedAt(now.toISOString().slice(0, 16));
      setInitialNotes('');
    }
    setErrors({});
  }, [editingIssue, facilities, categories, assignees, isOpen]);

  if (!isOpen) return null;

  const currentFacility = facilities.find(f => f.id === facilityId);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!facilityId) newErrors.facilityId = 'Vui lòng chọn cơ sở (bắt buộc)';
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tóm tắt vấn đề (bắt buộc)';
    if (!category) newErrors.category = 'Vui lòng chọn nhóm vấn đề (bắt buộc)';
    if (!source) newErrors.source = 'Vui lòng chọn nguồn ghi nhận (bắt buộc)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fac = facilities.find(f => f.id === facilityId);
    const facility_name = fac ? fac.name : 'Chưa xác định';

    const payload = {
      facility_id: facilityId,
      facility_name,
      room: room.trim(),
      title: title.trim(),
      description: description.trim() || title.trim(),
      category,
      source,
      assignee,
      status,
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      initialNotes: initialNotes.trim(),
      isVerified: true,
      hasMissingInfo: !room.trim(),
    };

    onSave(payload, !!editingIssue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col z-10 overflow-hidden border border-brand-border">
        {/* Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
          <div>
            <h3 className="text-lg font-bold text-brand-text">
              {editingIssue ? `Chỉnh sửa hồ sơ: ${editingIssue.id}` : 'Tạo hồ sơ vấn đề mới'}
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Ghi nhận đầy đủ thông tin để phân loại và theo dõi tiến độ xử lý.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* Facility & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Cơ sở <span className="text-red-500">*</span>
              </label>
              <select
                value={facilityId}
                onChange={(e) => {
                  setFacilityId(e.target.value);
                  setRoom('');
                }}
                className={`w-full bg-brand-bg/60 border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                  errors.facilityId ? 'border-red-500 bg-red-50/30' : 'border-brand-secondary'
                }`}
              >
                <option value="">-- Chọn cơ sở --</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                ))}
              </select>
              {errors.facilityId && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.facilityId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Phòng / Khu vực (nếu có)
              </label>
              {currentFacility && currentFacility.rooms.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="">-- Chọn phòng hoặc tự gõ --</option>
                    {currentFacility.rooms.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Ví dụ: P.102, Sảnh lễ tân..."
                  className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">
              Nội dung tóm tắt vấn đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Máy lạnh phòng P.102 chảy nước làm ướt thảm..."
              className={`w-full bg-brand-bg/60 border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                errors.title ? 'border-red-500 bg-red-50/30' : 'border-brand-secondary'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">
              Mô tả chi tiết nội dung
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi lại chi tiết lời khách phản ánh hoặc tình trạng kiểm tra ban đầu..."
              className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Category & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Nhóm vấn đề <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full bg-brand-bg/60 border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                  errors.category ? 'border-red-500 bg-red-50/30' : 'border-brand-secondary'
                }`}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Nguồn ghi nhận <span className="text-red-500">*</span>
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as IssueSource)}
                className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="Khách hàng phản ánh">Khách hàng phản ánh</option>
                <option value="Nội bộ phát hiện">Nội bộ phát hiện</option>
                <option value="Hướng dẫn khách">Hướng dẫn khách</option>
              </select>
            </div>
          </div>

          {/* Assignee & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Người phụ trách
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">-- Chưa phân công --</option>
                {assignees.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="Chưa xử lý">Chưa xử lý</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Cần theo dõi">Cần theo dõi</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Date & Initial Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Ngày giờ ghi nhận
              </label>
              <input
                type="datetime-local"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Ghi chú ban đầu
              </label>
              <input
                type="text"
                value={initialNotes}
                onChange={(e) => setInitialNotes(e.target.value)}
                placeholder="Ví dụ: Đã liên hệ thợ điện lạnh qua xử lý..."
                className="w-full bg-brand-bg/60 border border-brand-secondary rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Submit footer */}
          <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-brand-text bg-white border border-brand-secondary hover:bg-brand-bg rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{editingIssue ? 'Lưu thay đổi' : 'Tạo hồ sơ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

