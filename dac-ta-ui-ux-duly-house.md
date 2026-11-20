# Đặc tả UI/UX website DuLy’s House | Operations

## 1. Mục tiêu

Website giúp đội ngũ vận hành DuLy’s House nhập dữ liệu, theo dõi vấn đề tại các cơ sở và chuẩn bị báo cáo tuần/tháng. Giao diện dành cho người dùng không rành kỹ thuật, dùng tiếng Việt, hiển thị tốt trên máy tính và điện thoại.

Tài liệu này mô tả cấu trúc, nội dung, hành vi và tiêu chí hoàn thành để đội ngũ khác có thể dựng lại giao diện. Phiên bản site được ghi nhận gần nhất là v13. Luồng nhập file booking đã được cập nhật; các phần khác cần đối chiếu giao diện thực tế trước khi nghiệm thu là đã triển khai.

## 2. Khung giao diện chung

### Bố cục

- Máy tính: thanh điều hướng bên trái; nội dung chính bên phải.
- Điện thoại: điều hướng thu gọn; bảng chuyển thành thẻ hoặc cho cuộn ngang có chủ đích.
- Đầu mỗi trang gồm tên trang, mô tả ngắn và hành động chính.
- Bộ lọc đặt gần đầu nội dung và áp dụng nhất quán cho các số liệu, bảng liên quan.
- Nội dung nằm trong thẻ hoặc bảng có tiêu đề và nhãn rõ ràng.

### Điều hướng chính

1. Tổng quan
2. Hồ sơ vấn đề
3. Nhập dữ liệu
4. Báo cáo
5. Danh mục / Cài đặt

### Nguyên tắc trải nghiệm

- Dùng tiếng Việt cho nhãn, hướng dẫn, lỗi và xác nhận.
- Ghi rõ đơn vị và kỳ thời gian cho mỗi số liệu.
- Các số liệu có thể bấm phải mở đúng danh sách hồ sơ cấu thành số liệu đó.
- Tránh xóa âm thầm dữ liệu thiếu hoặc chưa xác minh; đưa ra cảnh báo và hướng xử lý.
- Mỗi trang phải có trạng thái đang tải, không có dữ liệu, lỗi và thao tác thành công.
- Nếu dữ liệu mẫu được dùng, phải ghi rõ là dữ liệu mẫu.

## 3. Bảng màu và quy tắc sử dụng

Bảng màu dưới đây là đề xuất cho dashboard, chưa được xác minh là mã màu chính xác của bộ nhận diện thương hiệu chính thức.

| Vai trò | Màu | Cách dùng |
|---|---|---|
| Nền trang | `#F8F7F4` | Nền tổng thể sáng, ấm |
| Bề mặt thẻ/bảng | `#FFFFFF` | Thẻ chỉ số, bảng, biểu mẫu |
| Màu thương hiệu chính | `#6B4E3D` | Nút chính, mục điều hướng đang chọn, điểm nhấn |
| Màu thương hiệu phụ | `#E8DED3` | Nền phụ, viền nhẹ, bộ lọc |
| Chữ chính | `#292725` | Nội dung và số liệu |
| Chữ phụ | `#77716B` | Mô tả, chú thích |
| Thành công | `#2F6B4F` | Hoàn thành, nhập thành công |
| Cần chú ý | `#A86616` | Hồ sơ tồn, dữ liệu cần rà soát |
| Lỗi / khẩn cấp | `#A83A32` | File lỗi, vấn đề cần xử lý |
| Thông tin | `#356A83` | Hướng dẫn, thông tin hệ thống |

### Quy tắc màu

- Dùng nâu làm màu nhận diện và điều hướng, không dùng thay cho mọi màu biểu đồ hoặc trạng thái.
- Màu trạng thái luôn đi kèm nhãn chữ, ví dụ “Đang xử lý”.
- Nền cảnh báo dùng sắc nhạt và chữ dùng sắc đậm; tránh mảng màu bão hòa lớn.
- Giữ màu của cùng một nhóm dữ liệu nhất quán giữa các biểu đồ và kỳ báo cáo.
- Nút chính dùng nền nâu trầm, chữ trắng; nút phụ dùng nền trắng và viền be.
- Đảm bảo độ tương phản chữ/nền để nội dung dễ đọc.

## 4. Trang Tổng quan

### Mục đích

Giúp người dùng nắm nhanh số lượng vấn đề, cơ cấu nguồn ghi nhận và việc cần ưu tiên trong tuần hoặc tháng.

### Thành phần

1. Tiêu đề “Tổng quan vận hành”.
2. Bộ lọc: tuần/tháng, khoảng ngày, cơ sở, nguồn, nhóm vấn đề, trạng thái.
3. Thẻ chỉ số:
   - Tổng số vấn đề trong kỳ.
   - Phản ánh từ khách hàng.
   - Vấn đề do nội bộ phát hiện.
   - Trường hợp hướng dẫn khách.
   - Hồ sơ đã hoàn thành.
   - Hồ sơ còn mở.
4. Khu vực cảnh báo:
   - Hồ sơ thiếu thông tin hoặc chưa xác minh.
   - Hồ sơ còn mở từ 1 tuần, 2 tuần và 4 tuần.
   - Cơ sở hoặc nhóm vấn đề cần chú ý.
5. Biểu đồ theo thời gian, nguồn và nhóm vấn đề.
6. Danh sách hồ sơ mới nhất hoặc tồn lâu nhất.

### Hành vi

- Bấm thẻ chỉ số để mở Hồ sơ vấn đề với bộ lọc tương ứng.
- Bấm cảnh báo để mở đúng hồ sơ cần xử lý.
- Đổi bộ lọc để cập nhật toàn bộ số liệu và danh sách.
- Nếu thiếu số booking, ghi rõ tỷ lệ chưa thể tính; không trình bày như kết quả đầy đủ.
- Khi chưa có dữ liệu, giải thích trạng thái và dẫn tới trang Nhập dữ liệu.

## 5. Trang Hồ sơ vấn đề

### Danh sách hồ sơ

Đầu trang gồm tiêu đề “Hồ sơ vấn đề”, nút “Tạo hồ sơ” và ô tìm kiếm theo mã hồ sơ, cơ sở, phòng hoặc nội dung.

Bộ lọc gồm thời gian, cơ sở, nguồn, nhóm vấn đề, trạng thái, người phụ trách và tuổi hồ sơ (dưới 1 tuần, 1–2 tuần, 2–4 tuần, trên 4 tuần).

Bảng gồm các cột:

- Mã hồ sơ
- Ngày ghi nhận
- Cơ sở / phòng
- Nội dung tóm tắt
- Nhóm vấn đề
- Nguồn
- Người phụ trách
- Trạng thái
- Thời gian đang mở
- Thao tác xem/sửa

Bấm vào dòng để mở chi tiết. Danh sách dài cần có phân trang hoặc tải thêm.

### Tạo và chỉnh sửa hồ sơ

Trường dữ liệu:

- Cơ sở
- Phòng (nếu có)
- Nội dung vấn đề
- Nhóm vấn đề
- Nguồn ghi nhận
- Người phụ trách
- Trạng thái
- Ngày giờ ghi nhận
- Ghi chú ban đầu

Đánh dấu trường bắt buộc và báo lỗi ngay cạnh trường chưa hợp lệ. Sau khi lưu, báo thành công và mở hồ sơ vừa tạo.

### Chi tiết hồ sơ

Hiển thị mã hồ sơ, trạng thái, cơ sở/phòng, nguồn, nhóm vấn đề, người phụ trách, nội dung ban đầu và dòng thời gian cập nhật. Mỗi mục lịch sử có người cập nhật, thời điểm và nội dung.

Thao tác gồm “Cập nhật diễn biến”, “Sửa hồ sơ” và đổi trạng thái: Chưa xử lý, Đang xử lý, Đã hoàn thành, Cần theo dõi.

Nội dung mới liên quan cùng vấn đề có thể gắn vào hồ sơ hiện tại để giữ một dòng thời gian. Vấn đề khác phải tạo hồ sơ riêng, kể cả khi cùng nhóm lớn.

## 6. Trang Nhập dữ liệu

### A. Nhập hồ sơ vấn đề từ Excel

1. Hiển thị hướng dẫn ngắn và yêu cầu mẫu file.
2. Cho chọn hoặc kéo thả file `.xlsx`, `.xls`, `.csv`.
3. Đọc file và hiển thị tên file, số dòng đọc được, số dòng hợp lệ, cảnh báo/lỗi và cơ sở nhận diện được.
4. Hiển thị bảng xem trước; đánh dấu dòng thiếu thông tin, chưa xác minh, không nhận diện cơ sở/phòng/nguồn/nhóm hoặc có thể trùng.
5. Cho mở cảnh báo để bổ sung thông tin, ghi giải trình hoặc đánh dấu theo dõi.
6. Chỉ bật nút xác nhận nhập sau khi người dùng rà soát.
7. Sau khi nhập, báo số dòng đã thêm và số dòng cần xử lý tiếp.

Không tự động loại bỏ dòng chưa rõ; giữ lại để người dùng xử lý.

### B. Nhập booking theo tuần

Các cột được hỗ trợ trong file hiện tại:

- `facility_id` hoặc `facility_name`
- `booking_date`
- `booking_count`

Ghép mã/tên cơ sở trong file với danh mục cơ sở của website. Gom các dòng theo cơ sở và tuần, cộng `booking_count`, sau đó hiển thị bảng xem trước trước khi lưu. Quy ước ngày bắt đầu/kết thúc tuần phải thống nhất với báo cáo.

Bản cập nhật hiện tại nhận diện các cột tiếng Anh này. File đã xem trước có 1.414 dòng, 14 cơ sở và không có dòng sai định dạng; trong đó có 49 dòng ngày tương lai. Trang cảnh báo rằng cần xác nhận `booking_date` là ngày check-in thực tế và các dòng tương lai có phù hợp hay không. Bản xem trước không đồng nghĩa dữ liệu đã được nhập.

### Trạng thái nhập file

- Chưa chọn file: hướng dẫn định dạng và nút chọn file.
- Đang đọc: hiển thị tiến trình.
- Không đọc được: nêu nguyên nhân và cách xử lý.
- Có cảnh báo: giữ kết quả xem trước và yêu cầu xác nhận trước khi nhập.
- Thành công: tóm tắt số dòng, kỳ và cơ sở đã nhập.
- Có dòng lỗi: nêu rõ số dòng lỗi; không thông báo thành công toàn bộ nếu chỉ nhập một phần.

## 7. Trang Báo cáo

### Bộ lọc

Chọn tuần/tháng, kỳ, cơ sở hoặc tất cả cơ sở, nguồn và nhóm vấn đề.

### Tổng hợp

- Tổng vấn đề trong kỳ.
- Cơ cấu theo nguồn.
- Nhóm vấn đề có nhiều phản ánh.
- Hồ sơ còn mở và tồn lâu.
- Booking checkout thành công.
- Tỷ lệ phản ánh trên 100 booking nếu dữ liệu đầy đủ.

Công thức:

> Số vấn đề khách hàng phản ánh ÷ số booking checkout thành công × 100

Nếu thiếu booking ở một cơ sở/kỳ, hiển thị “Chưa đủ dữ liệu booking để tính”.

### Bảng theo cơ sở

Mỗi dòng gồm cơ sở, số phản ánh khách hàng, số vấn đề nội bộ, nhóm nổi bật, số booking checkout thành công, tỷ lệ trên 100 booking và số hồ sơ còn mở.

Bấm một chỉ số để mở danh sách hồ sơ cấu thành số liệu. Nếu nhiều nhóm đồng hạng cao nhất, hiển thị tất cả; bấm một nhóm chỉ mở hồ sơ thuộc nhóm đó.

### Nhận xét báo cáo

Tạo bản nháp dựa trên bộ lọc hiện tại: cơ sở có nhiều phản ánh, nhóm nổi bật, cơ cấu nguồn, tình trạng booking và hồ sơ còn mở.

- Mỗi nhận xét cần dựa trên số liệu hiển thị.
- Không suy đoán nguyên nhân khi dữ liệu không chứng minh.
- Cho phép chỉnh sửa bản nháp.
- Có nút sao chép để đưa vào báo cáo nhanh/tháng.

## 8. Trang Danh mục / Cài đặt

### Danh mục

Quản lý cơ sở và mã cơ sở, phòng, nhóm vấn đề, nguồn ghi nhận, người phụ trách và trạng thái hồ sơ.

### Hành vi

- Tìm kiếm, thêm và chỉnh sửa mục danh mục.
- Không xóa mục đang được hồ sơ sử dụng nếu làm mất lịch sử; cho phép ngừng sử dụng.
- Báo xác nhận khi thay đổi ảnh hưởng tới dữ liệu.
- Phần tài khoản/phân quyền có thể đặt trong khu vực cài đặt riêng khi triển khai xác thực.

## 9. Tiêu chí hoàn thành

1. Có đủ năm mục điều hướng: Tổng quan, Hồ sơ vấn đề, Nhập dữ liệu, Báo cáo, Danh mục/Cài đặt.
2. Giao diện hoạt động trên máy tính và điện thoại.
3. Mỗi trang có trạng thái tải, rỗng, lỗi và thành công.
4. Bộ lọc cập nhật nhất quán số liệu và danh sách.
5. Bấm chỉ số mở đúng hồ sơ cấu thành chỉ số đó.
6. Nhập Excel có xem trước, cảnh báo/lỗi và xác nhận trước khi lưu.
7. Booking được tổng hợp theo cơ sở/tuần; không tính tỷ lệ khi thiếu dữ liệu.
8. Hồ sơ có trạng thái và lịch sử cập nhật.
9. Nhận xét báo cáo có căn cứ, chỉnh sửa được và sao chép được.
10. Toàn bộ giao diện bằng tiếng Việt; dữ liệu mẫu phải được ghi nhãn.
11. Phân biệt rõ phần đã triển khai với phần mới là đặc tả; đối chiếu site trước nghiệm thu.

## 10. Trạng thái triển khai đã xác nhận

- Site: **DuLy’s House | Operations**, phiên bản được ghi nhận là v13.
- Quyền hiện ghi nhận: chế độ tùy chỉnh, chỉ chủ sở hữu được cấp quyền.
- Luồng nhập booking đã được cập nhật để nhận diện cột tiếng Anh `facility_name`, `facility_id`, `booking_date`, `booking_count`.
- File booking đã được đọc thử và hiển thị xem trước; chưa xác nhận là dữ liệu đã nhập vào báo cáo.
- Chưa xác minh trực tiếp trạng thái triển khai của toàn bộ các trang được mô tả trong tài liệu này.
