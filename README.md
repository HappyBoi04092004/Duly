# DuLy’s House | Operations (Phiên bản v13)

Phần mềm Quản lý Vận hành, Theo dõi Sự cố và Báo cáo Hiệu suất dành cho chuỗi cơ sở lưu trú **DuLy’s House**, được xây dựng chuẩn xác theo tài liệu đặc tả [dac-ta-ui-ux-duly-house.md](file:///D:/ABC/dac-ta-ui-ux-duly-house.md).

---

## 🌟 Tính năng nổi bật

### 1. Tổng quan vận hành (Dashboard)
- **6 Thẻ chỉ số trọng yếu**: Tổng số vấn đề, Phản ánh từ khách hàng, Phát hiện nội bộ, Hướng dẫn khách, Đã hoàn thành, Hồ sơ còn mở.
- **Tương tác trực tiếp (Drill-down)**: Bấm vào bất kỳ thẻ chỉ số hoặc khu vực cảnh báo nào sẽ lập tức mở đúng danh sách các hồ sơ cấu thành chỉ số đó.
- **Khu vực cảnh báo trọng tâm**:
  - Hồ sơ thiếu thông tin hoặc chưa xác minh (chưa có phòng, chưa nhận diện cơ sở).
  - Hồ sơ mở quá hạn theo từng mốc: 1 tuần, 2 tuần và trên 4 tuần.
  - Điểm nóng cơ sở đang có nhiều phản ánh nhất.
- **Biểu đồ trực quan**:
  - Biểu đồ xu hướng vấn đề theo dòng thời gian (Recharts Area Chart).
  - Biểu đồ cơ cấu theo nguồn ghi nhận (Donut Chart) kèm tỷ lệ %.
  - Biểu đồ nhóm sự cố phát sinh.
- **Danh sách hồ sơ tức thì**: Chuyển đổi nhanh giữa tab "Hồ sơ mới nhất" và "Hồ sơ tồn lâu nhất".

### 2. Hồ sơ vấn đề (Issue Management)
- Tìm kiếm tức thì theo mã hồ sơ (`HS-2026-xxx`), cơ sở, phòng hoặc nội dung tóm tắt.
- Bộ lọc đa chiều: Khoảng thời gian, 14 Cơ sở, Nguồn ghi nhận, Nhóm vấn đề, Trạng thái, Người phụ trách, và **Tuổi hồ sơ** (<1 tuần, 1–2 tuần, 2–4 tuần, >4 tuần).
- Bảng danh mục đầy đủ thông tin chuẩn vận hành:
  - Mã hồ sơ, Ngày ghi nhận, Cơ sở / phòng, Nội dung tóm tắt, Nhóm vấn đề, Nguồn, Người phụ trách, Trạng thái, Thời gian đang mở.
- **Chi tiết hồ sơ & Dòng thời gian (Timeline)**:
  - Lịch sử cập nhật diễn biến theo thời gian thực (ai cập nhật, lúc nào, nội dung gì).
  - Thêm cập nhật diễn biến mới ngay tại chỗ.
  - Đổi trạng thái tức thì (Chưa xử lý, Đang xử lý, Cần theo dõi, Đã hoàn thành).
- **Tạo và chỉnh sửa hồ sơ**: Có kiểm tra hợp lệ (validation) trực quan ngay cạnh từng ô nhập liệu.

### 3. Nhập dữ liệu vận hành (Data Import)
- **A. Nhập hồ sơ vấn đề từ Excel/CSV**:
  - Hỗ trợ file `.xlsx`, `.xls`, `.csv`.
  - Tải file mẫu chuẩn `mau_nhap_ho_so_duly.xlsx`.
  - Bảng xem trước (Preview) thông minh: Đánh dấu dòng thiếu phòng, cơ sở chưa khớp danh mục hoặc trùng lặp.
  - Hộp kiểm xác nhận đã rà soát trước khi lưu dữ liệu vào hệ thống.
- **B. Nhập Booking theo tuần**:
  - Hỗ trợ chính xác 3 cột tiếng Anh: `facility_id` (hoặc `facility_name`), `booking_date`, `booking_count`.
  - Tự động gom nhóm theo cơ sở và tuần (ISO week number) để tính tổng lượt checkout.
  - **Cảnh báo ngày tương lai** (như mô tả file 1.414 dòng có 49 dòng tương lai): Yêu cầu người dùng xác nhận trước khi lưu.
  - Có nút nạp thử nhanh bộ dữ liệu mẫu 1.414 dòng để kiểm thử ngay lập tức.

### 4. Báo cáo & Phân tích (Reports & Analytics)
- Bộ lọc theo tuần (ví dụ: `2026-W46`, `2026-W45`...), cơ sở, nguồn và nhóm sự cố.
- **Công thức tỷ lệ phản ánh**:
  $$\text{Tỷ lệ} = \frac{\text{Số phản ánh từ khách}}{\text{Số booking checkout thành công}} \times 100$$
  - Nếu thiếu dữ liệu booking tại cơ sở hoặc kỳ nào, hiển thị nhãn chuẩn: **"Chưa đủ dữ liệu booking để tính"**.
- **Bảng chi tiết theo cơ sở**:
  - Cơ sở, Số phản ánh khách, Số vấn đề nội bộ, Nhóm nổi bật nhất, Số booking checkout, Tỷ lệ trên 100 booking, Số hồ sơ còn mở.
  - Bấm vào bất kỳ số liệu hoặc tên nhóm nào đều mở danh sách hồ sơ tương ứng.
- **Bản nháp nhận xét báo cáo tự động**:
  - Tự động tạo văn bản nhận xét tuần/tháng dựa trên số liệu thực tế.
  - Cho phép người dùng chỉnh sửa trực tiếp nội dung trong ô văn bản.
  - Nút **Sao chép nhận xét** (Copy to clipboard) một chạm kèm thông báo.

### 5. Danh mục & Cài đặt hệ thống (Settings)
- Quản lý danh mục 14 cơ sở (Thảo Điền, Bến Vân Đồn, Landmark 81, Pasteur, Vũng Tàu, Đà Lạt...) và danh sách phòng tương ứng.
- Quản lý nhóm vấn đề, người phụ trách.
- Cơ chế bảo vệ dữ liệu: Không xóa cứng mục đang có hồ sơ liên kết mà chuyển sang chế độ **"Ngừng sử dụng"** để bảo toàn lịch sử.
- **Sao lưu & Khôi phục**: Xuất toàn bộ dữ liệu ra file JSON dự phòng và khôi phục khi cần.
- Nút **Đặt lại dữ liệu mẫu gốc (v13)** để đưa hệ thống về trạng thái chuẩn ban đầu.

---

## 🎨 Bảng màu chuẩn nhận diện (Mục 3 Đặc tả)

| Vai trò | Mã Hex | Áp dụng trong giao diện |
|---|---|---|
| Nền trang | `#F8F7F4` | Nền tổng thể ấm áp, dịu mắt |
| Bề mặt thẻ/bảng | `#FFFFFF` | Thẻ chỉ số, modal, bảng dữ liệu |
| Màu thương hiệu chính | `#6B4E3D` | Nâu trầm: Nút bấm chính, nav item kích hoạt, tiêu đề nổi bật |
| Màu thương hiệu phụ | `#E8DED3` | Be ấm: Viền ngăn cách, nền phụ, bộ lọc |
| Chữ chính | `#292725` | Nội dung văn bản và số liệu |
| Chữ phụ | `#77716B` | Chú thích, nhãn phụ, ngày tháng |
| Thành công | `#2F6B4F` | Trạng thái "Đã hoàn thành", nhập file thành công |
| Cần chú ý | `#A86616` | Trạng thái "Đang xử lý", hồ sơ cần rà soát |
| Lỗi / Khẩn cấp | `#A83A32` | Trạng thái "Chưa xử lý", cảnh báo dòng lỗi |
| Thông tin | `#356A83` | Trạng thái "Cần theo dõi", hướng dẫn hệ thống |

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Khởi động môi trường phát triển (Dev Server)
Mở cửa sổ dòng lệnh tại thư mục `d:\ABC` và chạy lệnh:
```bash
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:3000`

### 2. Đóng gói bản Production (Build)
```bash
npm run build
```
Bản build tĩnh tối ưu hóa sẽ được lưu tại thư mục `dist/`.

### 3. Xem trước bản Production (Preview)
```bash
npm run preview
```

