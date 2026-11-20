import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  User, 
  Tag, 
  MessageSquare, 
  Send, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Building,
  Check
} from 'lucide-react';
import { Issue, IssueStatus, TimelineEvent } from '../../types';
import { StatusBadge, SourceBadge } from '../common/StatusBadge';
import { formatDateTimeVi, getIssueAgeText } from '../../utils/dateUtils';

interface IssueDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
  onEdit: (issue: Issue) => void;
  onStatusChange: (issueId: string, newStatus: IssueStatus) => void;
  onAddTimelineEvent: (issueId: string, author: string, action: string, content: string) => void;
  assignees: string[];
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onEdit,
  onStatusChange,
  onAddTimelineEvent,
  assignees,
}) => {
  const [commentAuthor, setCommentAuthor] = useState<string>(assignees[0] || 'Trưởng ca Vận hành');
  const [commentContent, setCommentContent] = useState<string>('');
  const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!issue) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    onAddTimelineEvent(
      issue.id,
      commentAuthor,
      'Cập nhật diễn biến',
      commentContent.trim()
    );

    setCommentContent('');
    setIsAddingEvent(false);
    showToast('Đã thêm diễn biến mới vào hồ sơ');
  };

  const handleQuickStatus = (newStatus: IssueStatus) => {
    onStatusChange(issue.id, newStatus);
    onAddTimelineEvent(
      issue.id,
      commentAuthor,
      `Đổi trạng thái sang [${newStatus}]`,
      `Quản lý cập nhật trạng thái hồ sơ từ [${issue.status}] sang [${newStatus}].`
    );
    showToast(`Đã chuyển trạng thái sang "${newStatus}"`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col z-10 overflow-hidden border border-brand-border">
        {/* Toast inside modal */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-brand-primary text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 border-b border-brand-border/70 flex items-start justify-between bg-brand-bg/40">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono text-sm font-bold text-brand-primary bg-brand-secondary/40 px-2 py-0.5 rounded">
                {issue.id}
              </span>
              <StatusBadge status={issue.status} />
              <SourceBadge source={issue.source} />
              {(!issue.isVerified || issue.hasMissingInfo) && (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Cần rà soát
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-text">
              {issue.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(issue)}
              className="p-2 text-brand-text hover:text-brand-primary hover:bg-white rounded-lg border border-brand-secondary transition-colors"
              title="Chỉnh sửa hồ sơ"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-brand-muted hover:text-brand-text hover:bg-white rounded-lg border border-transparent hover:border-brand-secondary transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Quick status change bar */}
          <div className="bg-brand-bg/60 p-3.5 rounded-xl border border-brand-secondary/60 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-brand-muted">
              Chuyển nhanh trạng thái:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['Chưa xử lý', 'Đang xử lý', 'Cần theo dõi', 'Đã hoàn thành'] as IssueStatus[]).map((st) => (
                <button
                  key={st}
                  disabled={issue.status === st}
                  onClick={() => handleQuickStatus(st)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    issue.status === st
                      ? 'bg-brand-primary text-white shadow-xs cursor-default'
                      : 'bg-white text-brand-text hover:bg-brand-secondary/50 border border-brand-secondary/80'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white border border-brand-border/70 text-xs sm:text-sm">
            <div>
              <span className="text-brand-muted text-xs block mb-1">Cơ sở / Phòng</span>
              <div className="font-semibold text-brand-text flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-brand-primary" />
                <span>{issue.facility_name}</span>
              </div>
              <span className="text-xs text-brand-muted font-medium">
                {issue.room || <span className="text-amber-700 italic">Chưa xác định phòng</span>}
              </span>
            </div>

            <div>
              <span className="text-brand-muted text-xs block mb-1">Nhóm vấn đề</span>
              <div className="font-medium text-brand-text">{issue.category}</div>
            </div>

            <div>
              <span className="text-brand-muted text-xs block mb-1">Người phụ trách</span>
              <div className="font-medium text-brand-text flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-muted" />
                <span>{issue.assignee || 'Chưa phân công'}</span>
              </div>
            </div>

            <div>
              <span className="text-brand-muted text-xs block mb-1">Thời gian ghi nhận</span>
              <div className="font-medium text-brand-text">
                {formatDateTimeVi(issue.createdAt)}
              </div>
              <span className="text-xs text-brand-muted">
                (Đang mở: {getIssueAgeText(issue.createdAt, issue.status)})
              </span>
            </div>
          </div>

          {/* Description & Initial Notes */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                Nội dung vấn đề ban đầu
              </h4>
              <div className="p-4 bg-brand-bg/40 rounded-xl border border-brand-secondary/50 text-sm leading-relaxed text-brand-text whitespace-pre-line">
                {issue.description || issue.title}
              </div>
            </div>

            {issue.initialNotes && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  Ghi chú ban đầu
                </h4>
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 text-xs text-amber-950">
                  {issue.initialNotes}
                </div>
              </div>
            )}
          </div>

          {/* Timeline / Diễn biến cập nhật */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                <h4 className="font-bold text-sm text-brand-text">
                  Dòng thời gian & Diễn biến cập nhật ({issue.timeline?.length || 0})
                </h4>
              </div>

              {!isAddingEvent && (
                <button
                  onClick={() => setIsAddingEvent(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>+ Cập nhật diễn biến mới</span>
                </button>
              )}
            </div>

            {/* Add event form */}
            {isAddingEvent && (
              <form onSubmit={handleAddComment} className="p-4 mb-4 bg-brand-bg rounded-xl border border-brand-secondary space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-text">Thêm cập nhật diễn biến</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingEvent(false)}
                    className="text-xs text-brand-muted hover:text-brand-text"
                  >
                    Hủy
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-brand-muted mb-1">Người cập nhật</label>
                    <select
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="w-full text-xs bg-white border border-brand-secondary rounded-lg px-2.5 py-1.5 text-brand-text"
                    >
                      {assignees.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1">Nội dung diễn biến</label>
                  <textarea
                    rows={3}
                    required
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Mô tả chi tiết diễn biến, vật tư đã mua, trao đổi với khách..."
                    className="w-full text-xs bg-white border border-brand-secondary rounded-lg p-2.5 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingEvent(false)}
                    className="px-3 py-1.5 text-xs text-brand-muted hover:text-brand-text"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Lưu diễn biến</span>
                  </button>
                </div>
              </form>
            )}

            {/* Timeline Stream */}
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-brand-secondary/80">
              {(!issue.timeline || issue.timeline.length === 0) ? (
                <div className="text-xs text-brand-muted italic pl-6">
                  Chưa có lịch sử diễn biến nào.
                </div>
              ) : (
                issue.timeline.map((event, idx) => (
                  <div key={event.id || idx} className="relative flex items-start gap-4 pl-8">
                    {/* Bullet */}
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-brand-primary shadow-xs -translate-x-1/2" />
                    
                    <div className="flex-1 bg-white p-3.5 rounded-xl border border-brand-border/60 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-xs text-brand-text">
                          {event.author}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-brand-primary font-medium bg-brand-secondary/40 px-1.5 py-0.5 rounded">
                            {event.action}
                          </span>
                          <span className="text-[11px] text-brand-muted">
                            {formatDateTimeVi(event.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-brand-text leading-relaxed whitespace-pre-line">
                        {event.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-brand-border/60 bg-brand-bg/50 flex items-center justify-between">
          <button
            onClick={() => onEdit(issue)}
            className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa toàn bộ hồ sơ</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-brand-text bg-white border border-brand-secondary hover:bg-brand-bg rounded-lg transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

