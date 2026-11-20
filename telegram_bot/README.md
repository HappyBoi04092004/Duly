# TaskDuly Telegram Monitor Bot (@TaskDuly_bot)

Hệ thống tự động giám sát liên tục Google Sheet quản lý sự cố và báo cáo tức thì khi có biến động về Telegram bot.

---

## 📌 Thông tin cấu hình
- **Bot Username:** [@TaskDuly_bot](https://t.me/TaskDuly_bot)
- **Token:** `9011254027:AAEiGVrafzpfW0fbmEQ2Tm4vmAp7TrAnbhs`
- **Google Sheet theo dõi:** [Google Sheets (gid: 1243610857)](https://docs.google.com/spreadsheets/d/1wTrRBQUBF9hoIa0XIEpLdBuagN1YQYWVtVOJF2p59Xc/edit?gid=1243610857#gid=1243610857)
- **Chu kỳ quét:** Mỗi 30 giây (có thể điều chỉnh trong [bot.py](bot.py))

---

## 🚀 Hướng dẫn kích hoạt nhận thông báo

1. Mở Telegram và truy cập bot: [t.me/TaskDuly_bot](https://t.me/TaskDuly_bot)
2. Bấm nút **START** (hoặc gửi tin nhắn `/start`).
3. Bot sẽ xác nhận đăng ký thành công và tự động thông báo ngay khi có biến động trên trang tính.
4. *Mẹo:* Bạn cũng có thể thêm bot vào Group chat của nhóm vận hành và gửi `/start` để cả nhóm cùng nhận thông báo!

---

## ⚡ Các lệnh hỗ trợ trên Bot

| Lệnh | Chức năng |
| :--- | :--- |
| `/start` | Đăng ký nhận thông báo biến động |
| `/check` | Kiểm tra Google Sheet ngay lập tức |
| `/status`| Xem trạng thái hệ thống, số dòng dữ liệu, thời gian quét gần nhất |
| `/help`  | Xem trợ giúp |
| `/stop`  | Hủy đăng ký nhận thông báo |

---

## 📂 Cấu trúc thư mục

- `bot.py`: Mã nguồn chính xử lý quét sheet, tính toán sai khác (diffing) và gửi thông báo.
- `start_bot.bat`: File khởi động nhanh bot trên Windows.
- `data/subscribers.json`: Danh sách người dùng / nhóm đăng ký nhận thông báo.
- `data/snapshot.json`: Bản ghi trạng thái gần nhất của Google Sheet để đối soát.
- `data/bot.log`: Nhật ký hoạt động của bot.

