import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Plus, 
  Radio, 
  Smartphone, 
  Bot,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Facility, Issue } from '../../types';

interface ZaloTask {
  id: string;
  sender: string;
  group_name: string;
  facility: string;
  room: string;
  message: string;
  created_at: string;
  status: string;
}

interface ZaloTabProps {
  facilities: Facility[];
  onCreateIssueFromZalo: (task: ZaloTask) => void;
}

export const ZaloTab: React.FC<ZaloTabProps> = ({ facilities, onCreateIssueFromZalo }) => {
  const [tasks, setTasks] = useState<ZaloTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Form simulator
  const [senderName, setSenderName] = useState<string>('Lễ tân NCT');
  const [groupName, setGroupName] = useState<string>('Nhóm Vận Hành DuLy');
  const [facility, setFacility] = useState<string>('NCT');
  const [room, setRoom] = useState<string>('Doraemon');
  const [message, setMessage] = useState<string>('Điều hòa phòng Doraemon bị rò nước, chảy nhiều xuống sàn');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const webhookUrl = 'http://localhost:5001/api/zalo-webhook';

  const fetchZaloTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/zalo-tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setServerOnline(true);
      } else {
        setServerOnline(false);
      }
    } catch (e) {
      setServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZaloTasks();
    const interval = setInterval(fetchZaloTasks, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: senderName,
          group_name: groupName,
          facility,
          room,
          message
        })
      });

      if (res.ok) {
        setNotificationMsg('✅ Đã gửi thành công! Dữ liệu đã cập nhật lên Web và nổ chuông về Telegram Bot.');
        setMessage('');
        fetchZaloTasks();
        setTimeout(() => setNotificationMsg(null), 5000);
      } else {
        setNotificationMsg('❌ Có lỗi xảy ra khi gọi webhook.');
      }
    } catch (err) {
      setNotificationMsg('❌ Không thể kết nối tới Webhook Server (cổng 5001). Hãy đảm bảo file bot.py đang chạy.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                Z
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Kênh Tiếp Nhận Zalo & Telegram Bot
                  {serverOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Webhook Online (Cổng 5001)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3 h-3" />
                      Đang kết nối lại...
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-500">
                  Tự động hứng tin báo sự cố từ Nhóm Zalo vận hành ➔ Hiển thị tức thời trên Web ➔ Bắn thông báo về Telegram Bot (<a href="https://t.me/TaskDuly_bot" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline">@TaskDuly_bot</a>).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchZaloTasks}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới ({tasks.length})
            </button>
            <a
              href="https://t.me/TaskDuly_bot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors shadow-sm"
            >
              <Bot className="w-4 h-4" />
              Mở Telegram Bot
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Webhook endpoint bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-slate-600">
            <Radio className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">Webhook URL:</span>
            <code className="bg-white px-2 py-0.5 border border-slate-200 rounded text-slate-800 font-mono">
              {webhookUrl}
            </code>
          </div>
          <button
            onClick={() => handleCopy(webhookUrl)}
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl ? 'Đã sao chép' : 'Sao chép Endpoint'}
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
          notificationMsg.startsWith('✅') 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notificationMsg}
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Danh sách phản ánh từ Zalo theo thời gian thực
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-bold">
                {tasks.length}
              </span>
            </h2>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Chưa có phản ánh nào từ Zalo</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hãy dùng form bên phải để thử nghiệm gửi tin nhắn mô phỏng, hoặc kết nối script lắng nghe nhóm Zalo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div 
                  key={t.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700">
                        {t.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {t.group_name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {t.created_at}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {t.message}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-3 text-slate-600">
                      <span>👤 Người báo: <b>{t.sender}</b></span>
                      <span>🏢 Cơ sở: <b className="text-blue-600">{t.facility}</b></span>
                      <span>🚪 Phòng: <b>{t.room}</b></span>
                    </div>

                    <button
                      onClick={() => onCreateIssueFromZalo(t)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tạo thành Hồ sơ vấn đề
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Simulator & Setup Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Form Thử Nghiệm Nhanh */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                Mô phỏng tin nhắn từ Nhóm Zalo
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gửi thử tin nhắn trực tiếp vào Webhook để kiểm tra tính năng cập nhật Web & Telegram.
              </p>
            </div>

            <form onSubmit={handleSendTestMessage} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Người gửi
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Lễ tân..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên nhóm Zalo
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nhóm Vận Hành..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cơ sở
                  </label>
                  <input
                    type="text"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="NCT, YH, 2 LB..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên phòng
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Doraemon, Duckling..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung phản ánh sự cố
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập nội dung sự cố..."
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? 'Đang gửi...' : 'Bắn tin thử nghiệm ➔ Web & Telegram'}
              </button>
            </form>
          </div>

          {/* Hướng Dẫn Kết Nối Nhóm Zalo Thật */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Smartphone className="w-4 h-4" />
              Cách kết nối Nhóm Zalo thực tế
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Zalo hiện phân tách Zalo OA (Doanh nghiệp) và Nhóm Zalo cá nhân. Đối với <b>Nhóm Zalo nội bộ</b>, có 3 cách thực tế nhất:
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                <div className="font-semibold text-amber-300">Cách 1: Dùng Bot Zalo Node.js (zca-js / zalo-api)</div>
                <p className="text-[11px] text-slate-400">
                  Dùng 1 nick Zalo phụ (hoặc nick quản lý) quét mã QR đăng nhập 1 lần. Nick này tham gia nhóm Zalo. Script ngầm sẽ tự động đọc tin nhắn trong nhóm và POST thẳng về Webhook URL trên.
                </p>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                <div className="font-semibold text-emerald-300">Cách 2: Đọc thông báo Zalo qua điện thoại Android (MacroDroid)</div>
                <p className="text-[11px] text-slate-400">
                  Cài app MacroDroid lên máy Android có Zalo: Cài rule hễ có thông báo từ Nhóm Zalo chỉ định thì gửi HTTP POST về máy tính. 100% an toàn, không lo khóa nick.
                </p>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                <div className="font-semibold text-blue-300">Cách 3: Zalo OA Webhook (Nếu khách hàng nhắn)</div>
                <p className="text-[11px] text-slate-400">
                  Cấu hình Webhook trong Zalo Developers trỏ về Webhook URL này để bắt sự kiện tin nhắn từ khách hàng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

