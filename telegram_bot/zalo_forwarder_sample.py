"""
Zalo Webhook Forwarder Test Script
Sử dụng script này để gửi dữ liệu mô phỏng hoặc làm mẫu chuyển tiếp từ Zalo vào Webhook DuLy
"""
import urllib.request
import json
import sys

WEBHOOK_URL = "http://localhost:5001/api/zalo-webhook"

def send_zalo_report(sender, group_name, message, facility="NCT", room="Doraemon"):
    payload = {
        "sender": sender,
        "group_name": group_name,
        "facility": facility,
        "room": room,
        "message": message
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(WEBHOOK_URL, data=data, headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            print("=> Thành công:", res)
    except Exception as e:
        print("=> Lỗi kết nối Webhook:", e)

if __name__ == "__main__":
    sender = sys.argv[1] if len(sys.argv) > 1 else "Lễ tân NCT"
    group = sys.argv[2] if len(sys.argv) > 2 else "Nhóm Vận Hành DuLy"
    msg = sys.argv[3] if len(sys.argv) > 3 else "Khách báo bồn rửa mặt phòng Duckling bị nghẹt nước"
    print(f"Đang gửi phản ánh từ Zalo: [{sender} @ {group}] => {msg}")
    send_zalo_report(sender, group, msg, facility="NCT", room="Duckling")

