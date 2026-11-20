import os
import sys
import io
import csv
import json
import time
import hashlib
import difflib
import logging
import datetime
import threading
import urllib.request
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

# ---------------------------------------------------------
# CẤU HÌNH HỆ THỐNG
# ---------------------------------------------------------
BOT_TOKEN = "9011254027:AAEiGVrafzpfW0fbmEQ2Tm4vmAp7TrAnbhs"
SHEET_ID = "1wTrRBQUBF9hoIa0XIEpLdBuagN1YQYWVtVOJF2p59Xc"
GID = "1243610857"
SHEET_EXPORT_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"
CHECK_INTERVAL_SECONDS = 30  # Chu kỳ quét Google Sheet (giây)
WEBHOOK_PORT = 5001          # Cổng nhận Webhook từ Zalo / App

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
SUBSCRIBERS_FILE = os.path.join(DATA_DIR, "subscribers.json")
SNAPSHOT_FILE = os.path.join(DATA_DIR, "snapshot.json")
ZALO_TASKS_FILE = os.path.join(DATA_DIR, "zalo_incoming.json")
LOG_FILE = os.path.join(DATA_DIR, "bot.log")

os.makedirs(DATA_DIR, exist_ok=True)

# ---------------------------------------------------------
# LOGGING
# ---------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("TaskDulyBot")

# ---------------------------------------------------------
# QUẢN LÝ SUBSCRIBERS
# ---------------------------------------------------------
subscribers_lock = threading.Lock()

def load_subscribers():
    with subscribers_lock:
        if os.path.exists(SUBSCRIBERS_FILE):
            try:
                with open(SUBSCRIBERS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Lỗi đọc subscribers.json: {e}")
        return {}

def save_subscribers(subs):
    with subscribers_lock:
        try:
            with open(SUBSCRIBERS_FILE, "w", encoding="utf-8") as f:
                json.dump(subs, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Lỗi lưu subscribers.json: {e}")

def add_subscriber(chat_id, user_info):
    subs = load_subscribers()
    str_id = str(chat_id)
    subs[str_id] = {
        "chat_id": chat_id,
        "first_name": user_info.get("first_name", ""),
        "username": user_info.get("username", ""),
        "type": user_info.get("type", "private"),
        "joined_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    save_subscribers(subs)
    logger.info(f"Đã thêm subscriber mới: {chat_id} ({user_info.get('username') or user_info.get('first_name')})")

def remove_subscriber(chat_id):
    subs = load_subscribers()
    str_id = str(chat_id)
    if str_id in subs:
        del subs[str_id]
        save_subscribers(subs)
        logger.info(f"Đã xóa subscriber: {chat_id}")
        return True
    return False

# ---------------------------------------------------------
# QUẢN LÝ TIN NHẮN TỪ ZALO
# ---------------------------------------------------------
zalo_lock = threading.Lock()

def load_zalo_tasks():
    with zalo_lock:
        if os.path.exists(ZALO_TASKS_FILE):
            try:
                with open(ZALO_TASKS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Lỗi đọc zalo_incoming.json: {e}")
        return []

def save_zalo_task(task_item):
    with zalo_lock:
        tasks = []
        if os.path.exists(ZALO_TASKS_FILE):
            try:
                with open(ZALO_TASKS_FILE, "r", encoding="utf-8") as f:
                    tasks = json.load(f)
            except Exception:
                tasks = []
        tasks.insert(0, task_item)
        # Giữ tối đa 500 sự vụ gần nhất
        tasks = tasks[:500]
        try:
            with open(ZALO_TASKS_FILE, "w", encoding="utf-8") as f:
                json.dump(tasks, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Lỗi lưu zalo_incoming.json: {e}")

# ---------------------------------------------------------
# TELEGRAM API CALLS
# ---------------------------------------------------------
def telegram_request(method, payload=None, timeout=30):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    try:
        data = None
        headers = {"User-Agent": "TaskDulyBot/1.0"}
        if payload:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
        
        req = urllib.request.Request(url, data=data, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            res_text = resp.read().decode("utf-8")
            return json.loads(res_text)
    except Exception as e:
        logger.error(f"Lỗi Telegram API ({method}): {e}")
        return None

def send_message(chat_id, text, parse_mode="HTML"):
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True
    }
    return telegram_request("sendMessage", payload)

def broadcast_message(text, parse_mode="HTML"):
    subs = load_subscribers()
    if not subs:
        logger.warning(f"Chưa có ai gõ /start nên chưa có subscriber nhận tin: {text[:60]}...")
        return
    for chat_id_str, info in subs.items():
        try:
            send_message(info["chat_id"], text, parse_mode=parse_mode)
            time.sleep(0.05)  # Tránh Telegram rate limit
        except Exception as e:
            logger.error(f"Lỗi gửi tới chat_id {chat_id_str}: {e}")

# ---------------------------------------------------------
# GOOGLE SHEET FETCH & DIFF
# ---------------------------------------------------------
def fetch_sheet_rows():
    req = urllib.request.Request(SHEET_EXPORT_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        content = resp.read().decode("utf-8", errors="replace")
    
    reader = list(csv.reader(io.StringIO(content)))
    if not reader:
        return [], []
    
    headers = [h.strip() for h in reader[0]]
    raw_rows = reader[1:]
    
    rows = []
    for idx, r in enumerate(raw_rows, start=2):
        padded = r + [""] * (len(headers) - len(r))
        row_dict = {headers[i]: padded[i].strip() for i in range(len(headers))}
        row_str = "|".join([padded[i].strip() for i in range(len(headers))])
        row_hash = hashlib.sha256(row_str.encode("utf-8")).hexdigest()
        
        rows.append({
            "row_num": idx,
            "hash": row_hash,
            "data": row_dict,
            "raw": padded
        })
    return headers, rows

def load_snapshot():
    if os.path.exists(SNAPSHOT_FILE):
        try:
            with open(SNAPSHOT_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Lỗi đọc snapshot.json: {e}")
    return None

def save_snapshot(headers, rows):
    payload = {
        "saved_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_rows": len(rows),
        "headers": headers,
        "rows": rows
    }
    try:
        with open(SNAPSHOT_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Lỗi lưu snapshot.json: {e}")

def get_row_summary(row_data):
    def find_val(keys):
        for k in keys:
            for actual_k, v in row_data.items():
                if k.lower() in actual_k.lower():
                    return v
        return ""
    
    return {
        "date": find_val(["thời gian nhận", "thời gian"]),
        "room": find_val(["tên phòng", "phòng"]),
        "facility": find_val(["cơ sở"]),
        "content": find_val(["nội dung"]),
        "source": find_val(["nguồn report", "nguồn"]),
        "assignee": find_val(["nv xử lý", "người xử lý", "nhân sự"]),
        "status": find_val(["trạng thái"]) or "Chưa xác định",
        "priority": find_val(["mức độ ưu tiên", "ưu tiên"]),
        "completed": find_val(["thời điểm hoàn thành"]),
        "resolution": find_val(["hướng xử lý"]),
        "note": find_val(["ghi chú", "cập nhật trạng thái"])
    }

def format_new_row(row_num, row_data):
    s = get_row_summary(row_data)
    lines = [
        f"🆕 <b>[TASK MỚI TỪ GOOGLE SHEET] Dòng {row_num}</b>",
        f"🏢 <b>Cơ sở:</b> {s['facility'] or 'Chưa rõ'} | 🚪 <b>Phòng:</b> {s['room'] or 'Chưa rõ'}",
        f"📝 <b>Nội dung:</b> {s['content'] or 'Không có nội dung'}"
    ]
    if s["source"]:
        lines.append(f"👤 <b>Nguồn:</b> {s['source']}")
    if s["assignee"]:
        lines.append(f"👷 <b>NV xử lý:</b> {s['assignee']}")
    if s["status"]:
        lines.append(f"🛠️ <b>Trạng thái:</b> <code>{s['status']}</code>")
    if s["priority"]:
        lines.append(f"⚡ <b>Ưu tiên:</b> {s['priority']}")
    if s["date"]:
        lines.append(f"📅 <b>Thời gian:</b> {s['date']}")
    if s["note"]:
        lines.append(f"💬 <b>Ghi chú:</b> {s['note'][:100]}")
    return "\n".join(lines)

def format_row_update(row_num, old_data, new_data):
    s_new = get_row_summary(new_data)
    changes = []
    all_keys = list(dict.fromkeys(list(old_data.keys()) + list(new_data.keys())))
    for k in all_keys:
        v_old = old_data.get(k, "")
        v_new = new_data.get(k, "")
        if v_old != v_new:
            clean_k = k.split("\n")[0].strip()
            changes.append((clean_k, v_old, v_new))
    
    if not changes:
        return None
    
    lines = [
        f"🔄 <b>[CẬP NHẬT SHEET] Dòng {row_num}</b>",
        f"🏢 <b>Cơ sở:</b> {s_new['facility'] or 'Chưa rõ'} | 🚪 <b>Phòng:</b> {s_new['room'] or 'Chưa rõ'}",
        f"📝 <b>Nội dung:</b> {s_new['content'] or 'Không có nội dung'}",
        "\n<b>Chi tiết thay đổi:</b>"
    ]
    
    for k, v_old, v_new in changes[:6]:
        old_display = v_old if v_old else "<i>[trống]</i>"
        new_display = v_new if v_new else "<i>[trống]</i>"
        if len(old_display) > 80:
            old_display = old_display[:77] + "..."
        if len(new_display) > 80:
            new_display = new_display[:77] + "..."
        lines.append(f"• <b>{k}:</b> {old_display} ➔ <b>{new_display}</b>")
    
    if len(changes) > 6:
        lines.append(f"<i>... và {len(changes) - 6} trường khác.</i>")
    
    return "\n".join(lines)

def check_sheet_changes(is_manual=False):
    logger.info("Đang kiểm tra Google Sheet...")
    try:
        headers, new_rows = fetch_sheet_rows()
    except Exception as e:
        logger.error(f"Lỗi fetch Google Sheet: {e}")
        return {"error": str(e), "changes": []}
    
    snapshot = load_snapshot()
    if snapshot is None:
        logger.info(f"Khởi tạo snapshot ban đầu: {len(new_rows)} dòng.")
        save_snapshot(headers, new_rows)
        return {
            "initial": True,
            "total_rows": len(new_rows),
            "changes": []
        }
    
    old_rows = snapshot.get("rows", [])
    old_hashes = [r["hash"] for r in old_rows]
    new_hashes = [r["hash"] for r in new_rows]
    
    if old_hashes == new_hashes:
        logger.info(f"Không có thay đổi. Tổng dòng: {len(new_rows)}")
        return {"total_rows": len(new_rows), "changes": []}
    
    matcher = difflib.SequenceMatcher(None, old_hashes, new_hashes)
    change_messages = []
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue
        elif tag == "insert":
            for j in range(j1, j2):
                nr = new_rows[j]
                change_messages.append(format_new_row(nr["row_num"], nr["data"]))
        elif tag == "replace":
            if (i2 - i1) == (j2 - j1):
                for k in range(i2 - i1):
                    old_r = old_rows[i1 + k]
                    new_r = new_rows[j1 + k]
                    msg = format_row_update(new_r["row_num"], old_r["data"], new_r["data"])
                    if msg:
                        change_messages.append(msg)
            else:
                for j in range(j1, j2):
                    nr = new_rows[j]
                    change_messages.append(format_new_row(nr["row_num"], nr["data"]))
        elif tag == "delete":
            del_count = i2 - i1
            change_messages.append(f"⚠️ <b>[DÒNG BỊ XÓA TRÊN SHEET]</b> Phát hiện {del_count} dòng vừa bị xóa.")
    
    save_snapshot(headers, new_rows)
    logger.info(f"Phát hiện {len(change_messages)} biến động trên Sheet. Đã lưu snapshot mới ({len(new_rows)} dòng).")
    
    if change_messages:
        if len(change_messages) <= 5:
            for msg in change_messages:
                broadcast_message(msg)
        else:
            summary = (
                f"⚡ <b>[PHÁT HIỆN BIẾN ĐỘNG LỚN TRÊN SHEET]</b>\n"
                f"Có tổng cộng <b>{len(change_messages)}</b> cập nhật vừa diễn ra trên Google Sheet.\n"
                f"📊 Tổng số dòng hiện tại: <b>{len(new_rows)}</b>\n\n"
                f"<i>Dưới đây là 5 biến động đầu tiên:</i>"
            )
            broadcast_message(summary)
            for msg in change_messages[:5]:
                broadcast_message(msg)
            if len(change_messages) > 5:
                broadcast_message(f"<i>... và còn {len(change_messages) - 5} biến động khác.</i>")
                
    return {
        "total_rows": len(new_rows),
        "changes": change_messages
    }

# ---------------------------------------------------------
# THREAD 1: GOOGLE SHEET MONITORING
# ---------------------------------------------------------
last_check_status = {
    "last_checked": None,
    "total_rows": 0,
    "last_error": None
}

def sheet_monitor_worker():
    logger.info(f"Sheet Monitor Worker đã khởi động (chu kỳ {CHECK_INTERVAL_SECONDS}s).")
    while True:
        try:
            res = check_sheet_changes()
            last_check_status["last_checked"] = datetime.datetime.now().strftime("%H:%M:%S %d/%m/%Y")
            if "total_rows" in res:
                last_check_status["total_rows"] = res["total_rows"]
            if "error" in res:
                last_check_status["last_error"] = res["error"]
            else:
                last_check_status["last_error"] = None
        except Exception as e:
            logger.error(f"Lỗi ngoại lệ trong monitoring loop: {e}")
            last_check_status["last_error"] = str(e)
        
        time.sleep(CHECK_INTERVAL_SECONDS)

# ---------------------------------------------------------
# THREAD 2: HTTP SERVER (WEBHOOK NHẬN TIN NHẮN TỪ ZALO & API CHO WEB)
# ---------------------------------------------------------
class ZaloWebhookHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/zalo-tasks":
            # Trả về danh sách các task từ Zalo gửi lên (cho Web gọi hiển thị)
            tasks = load_zalo_tasks()
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "ok", "total": len(tasks), "tasks": tasks}, ensure_ascii=False).encode("utf-8"))
        elif parsed.path == "/api/status":
            subs = load_subscribers()
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "bot": "TaskDuly_bot",
                "total_rows": last_check_status["total_rows"],
                "last_checked": last_check_status["last_checked"],
                "subscribers_count": len(subs)
            }).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(b'{"error": "Not Found"}')

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/zalo-webhook":
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                post_body = self.rfile.read(content_length)
                payload = json.loads(post_body.decode("utf-8"))
                
                # Trích xuất dữ liệu từ Zalo
                sender = payload.get("sender", "Thành viên nhóm")
                group_name = payload.get("group_name", "Nhóm Vận Hành Zalo")
                raw_text = payload.get("message") or payload.get("text") or payload.get("content", "")
                facility = payload.get("facility", "")
                room = payload.get("room", "")
                now_str = datetime.datetime.now().strftime("%H:%M:%S %d/%m/%Y")
                
                # Nhận diện cơ sở/phòng nếu chưa có sẵn trong payload
                if not facility:
                    for f in ["NCT", "YH", "399 AC", "42 AC", "2 LB", "29 LB", "LVT", "TS", "17 DC", "Lê Duẩn"]:
                        if f.lower() in raw_text.lower():
                            facility = f
                            break
                
                task_id = f"ZALO-{int(time.time()*1000)%1000000:06d}"
                task_item = {
                    "id": task_id,
                    "sender": sender,
                    "group_name": group_name,
                    "facility": facility or "Chưa xác định",
                    "room": room or "Chưa rõ",
                    "message": raw_text,
                    "created_at": now_str,
                    "status": "Chưa xử lý"
                }
                
                # 1. Lưu vào cơ sở dữ liệu Zalo (cho Web hiển thị)
                save_zalo_task(task_item)
                logger.info(f"Đã nhận phản ánh Zalo mới: [{facility}] {raw_text[:50]}")
                
                # 2. Bắn thông báo ngay lập tức về Telegram Bot!
                tele_msg = (
                    f"💬 <b>[BÁO CÁO MỚI TỪ NHÓM ZALO]</b>\n"
                    f"👥 <b>Nhóm:</b> {group_name}\n"
                    f"👤 <b>Người báo:</b> {sender}\n"
                    f"🏢 <b>Cơ sở:</b> {facility or 'Chưa xác định'} | 🚪 <b>Phòng:</b> {room or 'Chưa rõ'}\n"
                    f"📝 <b>Nội dung:</b> {raw_text}\n"
                    f"⏰ <b>Thời gian:</b> {now_str}\n"
                    f"🆔 <b>Mã hồ sơ:</b> <code>{task_id}</code>"
                )
                broadcast_message(tele_msg)
                
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "status": "ok",
                    "task_id": task_id,
                    "message": "Đã tiếp nhận, lưu vào hệ thống và phát thông báo Telegram!"
                }, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                logger.error(f"Lỗi xử lý webhook Zalo: {e}")
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(b'{"error": "Endpoint Not Found"}')

    def log_message(self, format, *args):
        # Tắt bớt log HTTP mặc định để tránh spam
        return

def webhook_server_worker():
    server_address = ("0.0.0.0", WEBHOOK_PORT)
    httpd = HTTPServer(server_address, ZaloWebhookHandler)
    logger.info(f"Zalo Webhook Server đang lắng nghe tại: http://localhost:{WEBHOOK_PORT}/api/zalo-webhook")
    httpd.serve_forever()

# ---------------------------------------------------------
# THREAD 3: TELEGRAM BOT COMMAND HANDLER
# ---------------------------------------------------------
def handle_telegram_message(msg):
    chat = msg.get("chat", {})
    chat_id = chat.get("id")
    text = msg.get("text", "").strip()
    from_user = msg.get("from", {})
    
    if not chat_id:
        return
    
    user_display = from_user.get("first_name") or from_user.get("username") or "bạn"
    
    if text.startswith("/start"):
        add_subscriber(chat_id, {
            "first_name": from_user.get("first_name", ""),
            "username": from_user.get("username", ""),
            "type": chat.get("type", "private")
        })
        
        total_rows = last_check_status["total_rows"]
        welcome_text = (
            f"👋 <b>Xin chào {user_display}!</b>\n\n"
            f"Chào mừng bạn đến với <b>TaskDuly Bot</b> (@TaskDuly_bot).\n\n"
            f"Tôi sẽ giám sát liên tục Google Sheet quản lý sự cố và nhóm Zalo để <b>tự động thông báo ngay lập tức</b> cho bạn khi có biến động.\n\n"
            f"📊 <b>Thông tin kết nối:</b>\n"
            f"• <b>Google Sheet:</b> <code>DATA BÁO CÁO THÁNG</code> (BẢNG KÊ: {total_rows} dòng)\n"
            f"• <b>Zalo Webhook:</b> Cổng <code>{WEBHOOK_PORT}</code> (Sẵn sàng tiếp nhận tin nhắn từ Zalo)\n"
            f"• <b>Chu kỳ kiểm tra Sheet:</b> mỗi <code>{CHECK_INTERVAL_SECONDS}s</code>\n"
            f"• <b>Trạng thái:</b> 🟢 Đang chạy ngầm liên tục\n\n"
            f"<b>Các lệnh bạn có thể dùng:</b>\n"
            f"👉 /status - Xem trạng thái hệ thống\n"
            f"👉 /check - Kiểm tra ngay lập tức Google Sheet\n"
            f"👉 /zalo - Xem các tin báo Zalo mới nhất\n"
            f"👉 /help - Hướng dẫn sử dụng\n"
            f"👉 /stop - Hủy nhận thông báo"
        )
        send_message(chat_id, welcome_text)
        
    elif text.startswith("/status"):
        subs = load_subscribers()
        zalo_tasks = load_zalo_tasks()
        status_text = (
            f"📊 <b>TRẠNG THÁI HỆ THỐNG TASK DULY</b>\n\n"
            f"• <b>Trạng thái:</b> 🟢 Đang hoạt động bình thường\n"
            f"• <b>Dữ liệu Google Sheet:</b> <code>{last_check_status['total_rows']}</code> dòng\n"
            f"• <b>Lần quét Sheet gần nhất:</b> {last_check_status['last_checked'] or 'Đang kiểm tra...'}\n"
            f"• <b>Tin báo Zalo đã nhận:</b> <code>{len(zalo_tasks)}</code> phản ánh\n"
            f"• <b>Cổng Webhook Zalo:</b> <code>http://localhost:{WEBHOOK_PORT}/api/zalo-webhook</code>\n"
            f"• <b>Người đăng ký nhận tin:</b> {len(subs)} tài khoản\n"
            f"• <b>Lỗi gần nhất:</b> {last_check_status['last_error'] or 'Không có'}"
        )
        send_message(chat_id, status_text)
        
    elif text.startswith("/zalo"):
        tasks = load_zalo_tasks()
        if not tasks:
            send_message(chat_id, "ℹ️ Hiện chưa có phản ánh nào gửi qua Zalo Webhook.")
        else:
            lines = [f"💬 <b>DANH SÁCH {min(len(tasks), 5)} BÁO CÁO GẦN NHẤT TỪ ZALO:</b>\n"]
            for t in tasks[:5]:
                lines.append(f"• <b>[{t['facility']}-{t['room']}]</b> {t['message']} (<i>{t['sender']} lúc {t['created_at']}</i>)")
            send_message(chat_id, "\n".join(lines))
            
    elif text.startswith("/check"):
        send_message(chat_id, "🔍 <i>Đang quét và đối soát trực tiếp với Google Sheet...</i>")
        res = check_sheet_changes(is_manual=True)
        if "error" in res:
            send_message(chat_id, f"❌ Lỗi khi đọc Google Sheet: <code>{res['error']}</code>")
        elif not res.get("changes"):
            send_message(chat_id, f"✅ <b>Không có biến động mới trên Sheet!</b>\nDữ liệu vẫn đồng bộ ({res.get('total_rows', 0)} dòng).")
        else:
            send_message(chat_id, f"⚡ Đã phát hiện và gửi {len(res['changes'])} thông báo biến động!")
            
    elif text.startswith("/stop"):
        if remove_subscriber(chat_id):
            send_message(chat_id, "🛑 <b>Đã hủy nhận thông báo!</b>\nGửi /start bất cứ lúc nào để đăng ký lại.")
        else:
            send_message(chat_id, "ℹ️ Bạn chưa đăng ký nhận thông báo. Gửi /start để đăng ký.")
            
    elif text.startswith("/help"):
        help_text = (
            f"ℹ️ <b>DANH SÁCH LỆNH CỦA BOT:</b>\n\n"
            f"• /start - Đăng ký nhận thông báo biến động tự động\n"
            f"• /check - Quét Google Sheet ngay lập tức\n"
            f"• /zalo - Xem các tin báo sự cố gần nhất từ Zalo\n"
            f"• /status - Xem trạng thái hệ thống và lần quét gần nhất\n"
            f"• /help - Xem tin nhắn trợ giúp\n"
            f"• /stop - Hủy nhận thông báo"
        )
        send_message(chat_id, help_text)
        
    else:
        send_message(chat_id, "💡 Gửi /status để xem trạng thái hoặc /check để kiểm tra Google Sheet ngay lập tức.")

def telegram_poller_worker():
    logger.info("Telegram Poller Worker đã khởi động...")
    offset = 0
    while True:
        try:
            params = {"timeout": 20}
            if offset > 0:
                params["offset"] = offset
            
            res = telegram_request(f"getUpdates?{urllib.parse.urlencode(params)}", timeout=30)
            if res and res.get("ok"):
                updates = res.get("result", [])
                for update in updates:
                    update_id = update.get("update_id", 0)
                    offset = max(offset, update_id + 1)
                    
                    if "message" in update:
                        handle_telegram_message(update["message"])
                    elif "channel_post" in update:
                        handle_telegram_message(update["channel_post"])
            else:
                time.sleep(2)
        except Exception as e:
            logger.error(f"Lỗi trong Telegram polling: {e}")
            time.sleep(3)

# ---------------------------------------------------------
# ENTRYPOINT
# ---------------------------------------------------------
if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("KHỞI ĐỘNG HỆ THỐNG GIÁM SÁT GOOGLE SHEET & TELEGRAM BOT")
    logger.info(f"Bot Token: {BOT_TOKEN[:10]}...{BOT_TOKEN[-5:]}")
    logger.info(f"Sheet URL: {SHEET_EXPORT_URL}")
    logger.info(f"Zalo Webhook Port: {WEBHOOK_PORT}")
    logger.info("=" * 60)
    
    # 1. Khởi tạo snapshot ban đầu
    try:
        init_res = check_sheet_changes()
        logger.info(f"Khởi tạo xong snapshot ban đầu với {init_res.get('total_rows', 0)} dòng.")
        last_check_status["total_rows"] = init_res.get("total_rows", 0)
        last_check_status["last_checked"] = datetime.datetime.now().strftime("%H:%M:%S %d/%m/%Y")
    except Exception as e:
        logger.error(f"Không thể khởi tạo ban đầu: {e}")
    
    # 2. Chạy Thread Monitor Google Sheet
    t_monitor = threading.Thread(target=sheet_monitor_worker, daemon=True)
    t_monitor.start()
    
    # 3. Chạy Thread Webhook Server nhận tin từ Zalo
    t_webhook = threading.Thread(target=webhook_server_worker, daemon=True)
    t_webhook.start()
    
    # 4. Chạy Telegram Poller trên main thread
    try:
        telegram_poller_worker()
    except KeyboardInterrupt:
        logger.info("Đã nhận tín hiệu dừng bot. Tạm biệt!")
