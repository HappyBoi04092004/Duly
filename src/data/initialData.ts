import { Facility, IssueCategory, Issue, BookingRecord } from '../types';

export const INITIAL_FACILITIES: Facility[] = [
  { id: 'FAC-01', code: 'DULY-TD', name: 'DuLy Thảo Điền', address: 'Quận 2, TP.HCM', rooms: ['P.101', 'P.102', 'P.201', 'P.202', 'Studio VIP', 'Penthouse A'], status: 'active' },
  { id: 'FAC-02', code: 'DULY-BVD', name: 'DuLy Bến Vân Đồn', address: 'Quận 4, TP.HCM', rooms: ['P.301', 'P.302', 'P.401', 'P.502', 'Studio River'], status: 'active' },
  { id: 'FAC-03', code: 'DULY-3T2', name: 'DuLy Ba Tháng Hai', address: 'Quận 10, TP.HCM', rooms: ['P.101', 'P.102', 'P.203', 'P.204'], status: 'active' },
  { id: 'FAC-04', code: 'DULY-LM81', name: 'DuLy Landmark 81', address: 'Bình Thạnh, TP.HCM', rooms: ['L81-1204', 'L81-1808', 'L81-2501', 'L81-3205'], status: 'active' },
  { id: 'FAC-05', code: 'DULY-PXL', name: 'DuLy Phan Xích Long', address: 'Phú Nhuận, TP.HCM', rooms: ['P.201', 'P.202', 'P.301', 'P.302'], status: 'active' },
  { id: 'FAC-06', code: 'DULY-PAS', name: 'DuLy Pasteur Quận 1', address: 'Quận 1, TP.HCM', rooms: ['P.11', 'P.12', 'P.21', 'P.22', 'Suite Pasteur'], status: 'active' },
  { id: 'FAC-07', code: 'DULY-SALA', name: 'DuLy Sala Đại Quang Minh', address: 'TP. Thủ Đức, TP.HCM', rooms: ['S-401', 'S-402', 'S-601'], status: 'active' },
  { id: 'FAC-08', code: 'DULY-TDR', name: 'DuLy Thủ Đức Riverside', address: 'TP. Thủ Đức, TP.HCM', rooms: ['R-101', 'R-102', 'R-201'], status: 'active' },
  { id: 'FAC-09', code: 'DULY-TB', name: 'DuLy Tân Bình Airport', address: 'Tân Bình, TP.HCM', rooms: ['A-101', 'A-102', 'A-201', 'A-301'], status: 'active' },
  { id: 'FAC-10', code: 'DULY-VTS', name: 'DuLy Võ Thị Sáu', address: 'Quận 3, TP.HCM', rooms: ['V-101', 'V-102', 'V-201'], status: 'active' },
  { id: 'FAC-11', code: 'DULY-HD', name: 'DuLy Hoàng Diệu', address: 'Quận 4, TP.HCM', rooms: ['H-201', 'H-202', 'H-301'], status: 'active' },
  { id: 'FAC-12', code: 'DULY-VT', name: 'DuLy Vũng Tàu Bãi Sau', address: 'TP. Vũng Tàu', rooms: ['Sea-101', 'Sea-102', 'Sea-201', 'Sea-301'], status: 'active' },
  { id: 'FAC-13', code: 'DULY-DLM', name: 'DuLy Đà Lạt Mimosa', address: 'TP. Đà Lạt, Lâm Đồng', rooms: ['Pine-01', 'Pine-02', 'Pine-03'], status: 'active' },
  { id: 'FAC-14', code: 'DULY-DLTL', name: 'DuLy Đà Lạt Tuyền Lâm', address: 'TP. Đà Lạt, Lâm Đồng', rooms: ['Lake-01', 'Lake-02', 'Lake-03', 'Villa 01'], status: 'active' },
];

export const INITIAL_CATEGORIES: IssueCategory[] = [
  { id: 'CAT-01', name: 'Cơ sở vật chất & Thiết bị phòng', description: 'Hỏng khóa cửa, rèm rách, vòi hoa sen yếu, hỏng tủ lạnh, bếp...', status: 'active' },
  { id: 'CAT-02', name: 'Vệ sinh & Tiện ích phòng', description: 'Ga trải giường có vết bẩn, phòng có mùi, thiếu khăn tắm hoặc đồ amenities...', status: 'active' },
  { id: 'CAT-03', name: 'Điện, Nước & Internet', description: 'Máy lạnh không lạnh, mất wifi, chập điện, cúp nước đột ngột...', status: 'active' },
  { id: 'CAT-04', name: 'Dịch vụ & Thái độ', description: 'Nhân viên check-in trễ, hỗ trợ chưa nhiệt tình, bảo vệ phản ứng chậm...', status: 'active' },
  { id: 'CAT-05', name: 'Quy chế & An ninh', description: 'Khách hàng ồn ào sau 22h, hút thuốc trong phòng cấm, tụ tập quá số người...', status: 'active' },
  { id: 'CAT-06', name: 'Khác', description: 'Các tình huống phát sinh khác chưa phân nhóm cụ thể', status: 'active' },
];

export const INITIAL_ASSIGNEES = [
  'Nguyễn Văn An (Kỹ thuật)',
  'Trần Thị Bích (Trưởng ca)',
  'Lê Hoàng Long (Giám sát buồng phòng)',
  'Phạm Minh Đức (CSKH)',
  'Võ Thị Mai (Quản lý Vùng)',
];

export const INITIAL_SOURCES = [
  'Khách hàng phản ánh',
  'Nội bộ phát hiện',
  'Hướng dẫn khách',
] as const;

export const INITIAL_STATUSES = [
  'Chưa xử lý',
  'Đang xử lý',
  'Cần theo dõi',
  'Đã hoàn thành',
] as const;

// Helper to generate past ISO string
const daysAgo = (days: number, hours: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'HS-2026-001',
    facility_id: 'FAC-01',
    facility_name: 'DuLy Thảo Điền',
    room: 'P.102',
    title: 'Máy lạnh chảy nước nhỏ giọt xuống sàn gỗ',
    description: 'Khách báo máy lạnh trong phòng ngủ chảy nước nhiều lúc nửa đêm làm ướt thảm và sàn gỗ.',
    category: 'Điện, Nước & Internet',
    source: 'Khách hàng phản ánh',
    assignee: 'Nguyễn Văn An (Kỹ thuật)',
    status: 'Đang xử lý',
    createdAt: daysAgo(2, 4),
    isVerified: true,
    hasMissingInfo: false,
    initialNotes: 'Đã hẹn thợ điện lạnh qua bảo dưỡng lúc 10h sáng.',
    timeline: [
      {
        id: 'TL-1',
        timestamp: daysAgo(2, 4),
        author: 'Phạm Minh Đức (CSKH)',
        action: 'Tạo hồ sơ',
        content: 'Tiếp nhận phản ánh từ tin nhắn Zalo của khách hàng.',
      },
      {
        id: 'TL-2',
        timestamp: daysAgo(1, 2),
        author: 'Nguyễn Văn An (Kỹ thuật)',
        action: 'Cập nhật diễn biến',
        content: 'Đã kiểm tra sơ bộ, bị nghẹt ống thoát nước ngưng. Đang chờ kỹ thuật viên mang đồ nghề xử lý triệt để.',
      }
    ]
  },
  {
    id: 'HS-2026-002',
    facility_id: 'FAC-02',
    facility_name: 'DuLy Bến Vân Đồn',
    room: 'Studio River',
    title: 'Khóa cửa thông minh chập chờn mã PIN',
    description: 'Khách nhập đúng mật khẩu mở cửa nhưng chuông báo lỗi 3 lần mới vào được phòng.',
    category: 'Cơ sở vật chất & Thiết bị phòng',
    source: 'Khách hàng phản ánh',
    assignee: 'Nguyễn Văn An (Kỹ thuật)',
    status: 'Chưa xử lý',
    createdAt: daysAgo(0, 5),
    isVerified: true,
    hasMissingInfo: false,
    initialNotes: 'Cần thay pin khóa hoặc reset bảng mạch.',
    timeline: [
      {
        id: 'TL-3',
        timestamp: daysAgo(0, 5),
        author: 'Trần Thị Bích (Trưởng ca)',
        action: 'Tạo hồ sơ',
        content: 'Khách gọi hotline phản ánh lúc vừa check-in.',
      }
    ]
  },
  {
    id: 'HS-2026-003',
    facility_id: 'FAC-04',
    facility_name: 'DuLy Landmark 81',
    room: 'L81-1808',
    title: 'Ga trải giường có vệt ố cà phê chưa xử lý sạch',
    description: 'Khách check-in phát hiện ga giường có vết ố mờ ở góc, yêu cầu đổi ga mới.',
    category: 'Vệ sinh & Tiện ích phòng',
    source: 'Khách hàng phản ánh',
    assignee: 'Lê Hoàng Long (Giám sát buồng phòng)',
    status: 'Đã hoàn thành',
    createdAt: daysAgo(5, 3),
    resolvedAt: daysAgo(4, 22),
    isVerified: true,
    hasMissingInfo: false,
    initialNotes: 'Buồng phòng đã thay mới ngay sau 20 phút.',
    timeline: [
      {
        id: 'TL-4',
        timestamp: daysAgo(5, 3),
        author: 'Phạm Minh Đức (CSKH)',
        action: 'Tạo hồ sơ',
        content: 'Nhận ảnh chụp ga giường từ khách qua WhatsApp.',
      },
      {
        id: 'TL-5',
        timestamp: daysAgo(4, 22),
        author: 'Lê Hoàng Long (Giám sát buồng phòng)',
        action: 'Hoàn thành',
        content: 'Đã thay mới bộ ga chăn gối lụa cao cấp, gửi bánh ngọt xin lỗi khách.',
      }
    ]
  },
  {
    id: 'HS-2026-004',
    facility_id: 'FAC-03',
    facility_name: 'DuLy Ba Tháng Hai',
    room: 'P.203',
    title: 'Hướng dẫn khách sử dụng bếp từ và máy giặt sấy',
    description: 'Khách người nước ngoài không đọc được tiếng Việt trên bảng điều khiển bếp từ.',
    category: 'Cơ sở vật chất & Thiết bị phòng',
    source: 'Hướng dẫn khách',
    assignee: 'Phạm Minh Đức (CSKH)',
    status: 'Đã hoàn thành',
    createdAt: daysAgo(3, 8),
    resolvedAt: daysAgo(3, 7),
    isVerified: true,
    hasMissingInfo: false,
    timeline: [
      {
        id: 'TL-6',
        timestamp: daysAgo(3, 8),
        author: 'Phạm Minh Đức (CSKH)',
        action: 'Tạo hồ sơ',
        content: 'Đã gửi file PDF hướng dẫn tiếng Anh kèm video thao tác qua WhatsApp.',
      }
    ]
  },
  {
    id: 'HS-2026-005',
    facility_id: 'FAC-05',
    facility_name: 'DuLy Phan Xích Long',
    room: 'P.301',
    title: 'Tường phòng khách bị ngấm ẩm từ nhà tắm cạnh bên',
    description: 'Chân tường góc sofa có hiện tượng ố vàng và tróc sơn mảng nhỏ.',
    category: 'Cơ sở vật chất & Thiết bị phòng',
    source: 'Nội bộ phát hiện',
    assignee: 'Võ Thị Mai (Quản lý Vùng)',
    status: 'Cần theo dõi',
    createdAt: daysAgo(12, 1),
    isVerified: true,
    hasMissingInfo: false,
    initialNotes: 'Đang chờ trống phòng 3 ngày liên tục để xử lý chống thấm tường.',
    timeline: [
      {
        id: 'TL-7',
        timestamp: daysAgo(12, 1),
        author: 'Lê Hoàng Long (Giám sát buồng phòng)',
        action: 'Tạo hồ sơ',
        content: 'Phát hiện khi dọn phòng checkout.',
      },
      {
        id: 'TL-8',
        timestamp: daysAgo(7, 3),
        author: 'Võ Thị Mai (Quản lý Vùng)',
        action: 'Cập nhật diễn biến',
        content: 'Đã kiểm tra keo silicon phòng tắm, lên lịch block phòng tuần tới để thợ sơn bả.',
      }
    ]
  },
  {
    id: 'HS-2026-006',
    facility_id: 'FAC-06',
    facility_name: 'DuLy Pasteur Quận 1',
    room: '',
    title: 'Chưa xác định phòng - Khách phàn nàn lễ tân to tiếng ca đêm',
    description: 'Đánh giá ẩn danh trên OTA ghi nhận tiếng ồn tại khu vực hành lang chung lúc 1h sáng.',
    category: 'Dịch vụ & Thái độ',
    source: 'Khách hàng phản ánh',
    assignee: 'Trần Thị Bích (Trưởng ca)',
    status: 'Đang xử lý',
    createdAt: daysAgo(16, 2),
    isVerified: false,
    hasMissingInfo: true,
    initialNotes: 'Chưa có số phòng cụ thể, đang trích xuất camera ca trực ngày 01/11.',
    timeline: [
      {
        id: 'TL-9',
        timestamp: daysAgo(16, 2),
        author: 'Phạm Minh Đức (CSKH)',
        action: 'Tạo hồ sơ',
        content: 'Ghi nhận từ review Agoda điểm 6/10.',
      }
    ]
  },
  {
    id: 'HS-2026-007',
    facility_id: 'FAC-01',
    facility_name: 'DuLy Thảo Điền',
    room: 'P.201',
    title: 'Wifi tầng 2 bị rớt mạng định kỳ vào 20h - 22h',
    description: 'Bộ phát Mesh AP tầng 2 bị treo khi nhiều phòng cùng xem Netflix.',
    category: 'Điện, Nước & Internet',
    source: 'Nội bộ phát hiện',
    assignee: 'Nguyễn Văn An (Kỹ thuật)',
    status: 'Cần theo dõi',
    createdAt: daysAgo(25, 6),
    isVerified: true,
    hasMissingInfo: false,
    timeline: [
      {
        id: 'TL-10',
        timestamp: daysAgo(25, 6),
        author: 'Nguyễn Văn An (Kỹ thuật)',
        action: 'Tạo hồ sơ',
        content: 'Đã khởi động lại modem chính và giới hạn băng thông download.',
      }
    ]
  },
  {
    id: 'HS-2026-008',
    facility_id: 'FAC-12',
    facility_name: 'DuLy Vũng Tàu Bãi Sau',
    room: 'Sea-201',
    title: 'Tay nắm cửa ban công bị rỉ sét do gió biển',
    description: 'Cửa ban công nhìn ra biển khó kéo mở, khóa ngậm bị kẹt chặt.',
    category: 'Cơ sở vật chất & Thiết bị phòng',
    source: 'Nội bộ phát hiện',
    assignee: 'Nguyễn Văn An (Kỹ thuật)',
    status: 'Chưa xử lý',
    createdAt: daysAgo(36, 4),
    isVerified: true,
    hasMissingInfo: false,
    initialNotes: 'Hồ sơ mở trên 4 tuần chưa mua được phụ kiện thay thế từ hãng.',
    timeline: [
      {
        id: 'TL-11',
        timestamp: daysAgo(36, 4),
        author: 'Trần Thị Bích (Trưởng ca)',
        action: 'Tạo hồ sơ',
        content: 'Ghi nhận sau đợt bảo trì định kỳ tháng trước.',
      }
    ]
  },
  {
    id: 'HS-2026-009',
    facility_id: 'FAC-02',
    facility_name: 'DuLy Bến Vân Đồn',
    room: 'P.401',
    title: 'Khách mang thú cưng không báo trước, lông chó dính sofa',
    description: 'Quy chế cơ sở không nhận thú cưng nhưng khách check-in chui mang cún nhỏ.',
    category: 'Quy chế & An ninh',
    source: 'Nội bộ phát hiện',
    assignee: 'Lê Hoàng Long (Giám sát buồng phòng)',
    status: 'Đã hoàn thành',
    createdAt: daysAgo(6, 12),
    resolvedAt: daysAgo(5, 14),
    isVerified: true,
    hasMissingInfo: false,
    timeline: [
      {
        id: 'TL-12',
        timestamp: daysAgo(6, 12),
        author: 'Lê Hoàng Long (Giám sát buồng phòng)',
        action: 'Tạo hồ sơ',
        content: 'Đã lập biên bản thu phụ phí vệ sinh sâu 500k theo quy định.',
      }
    ]
  },
  {
    id: 'HS-2026-010',
    facility_id: 'FAC-13',
    facility_name: 'DuLy Đà Lạt Mimosa',
    room: 'Pine-02',
    title: 'Bình nước nóng không đủ độ ấm ban đêm',
    description: 'Nhiệt độ ngoài trời Đà Lạt xuống 14 độ, bình nước nóng 20L hết nước ấm nhanh.',
    category: 'Điện, Nước & Internet',
    source: 'Khách hàng phản ánh',
    assignee: 'Nguyễn Văn An (Kỹ thuật)',
    status: 'Đang xử lý',
    createdAt: daysAgo(4, 9),
    isVerified: true,
    hasMissingInfo: false,
    timeline: [
      {
        id: 'TL-13',
        timestamp: daysAgo(4, 9),
        author: 'Phạm Minh Đức (CSKH)',
        action: 'Tạo hồ sơ',
        content: 'Đang điều chỉnh thanh đốt rơ-le nhiệt lên mức tối đa.',
      }
    ]
  },
  {
    id: 'HS-2026-011',
    facility_id: 'FAC-07',
    facility_name: 'DuLy Sala Đại Quang Minh',
    room: 'S-402',
    title: 'Chưa xác minh nguồn tin - Khách phản ánh có mùi khói thuốc',
    description: 'Khách báo phòng trước có thể đã hút thuốc ngầm, còn ám mùi rèm cửa.',
    category: 'Vệ sinh & Tiện ích phòng',
    source: 'Khách hàng phản ánh',
    assignee: 'Lê Hoàng Long (Giám sát buồng phòng)',
    status: 'Đang xử lý',
    createdAt: daysAgo(1, 15),
    isVerified: false,
    hasMissingInfo: false,
    timeline: [
      {
        id: 'TL-14',
        timestamp: daysAgo(1, 15),
        author: 'Lê Hoàng Long (Giám sát buồng phòng)',
        action: 'Tạo hồ sơ',
        content: 'Đang đặt máy khử mùi ozone trong phòng 45 phút.',
      }
    ]
  },
  {
    id: 'HS-2026-012',
    facility_id: 'FAC-08',
    facility_name: 'DuLy Thủ Đức Riverside',
    room: '',
    title: 'Thiếu thông tin phòng - Tiếng ồn karaoke nhà hàng xóm',
    description: 'Khách gọi phản ánh nhà dân đối diện hát karaoke loa kéo âm thanh lớn.',
    category: 'Quy chế & An ninh',
    source: 'Khách hàng phản ánh',
    assignee: 'Võ Thị Mai (Quản lý Vùng)',
    status: 'Chưa xử lý',
    createdAt: daysAgo(8, 2),
    isVerified: true,
    hasMissingInfo: true,
    timeline: [
      {
        id: 'TL-15',
        timestamp: daysAgo(8, 2),
        author: 'Trần Thị Bích (Trưởng ca)',
        action: 'Tạo hồ sơ',
        content: 'Chưa rõ khách ở phòng nào gọi hotline, cần gọi lại hỏi thông tin.',
      }
    ]
  }
];

export const INITIAL_BOOKINGS: BookingRecord[] = [
  // DuLy Thảo Điền (FAC-01)
  { id: 'BK-001', facility_id: 'FAC-01', facility_name: 'DuLy Thảo Điền', booking_date: '2026-11-02', booking_count: 14, week_str: '2026-W45', imported_at: '2026-11-10' },
  { id: 'BK-002', facility_id: 'FAC-01', facility_name: 'DuLy Thảo Điền', booking_date: '2026-11-09', booking_count: 18, week_str: '2026-W46', imported_at: '2026-11-16' },
  { id: 'BK-003', facility_id: 'FAC-01', facility_name: 'DuLy Thảo Điền', booking_date: '2026-11-16', booking_count: 16, week_str: '2026-W47', imported_at: '2026-11-17' },

  // DuLy Bến Vân Đồn (FAC-02)
  { id: 'BK-004', facility_id: 'FAC-02', facility_name: 'DuLy Bến Vân Đồn', booking_date: '2026-11-02', booking_count: 22, week_str: '2026-W45', imported_at: '2026-11-10' },
  { id: 'BK-005', facility_id: 'FAC-02', facility_name: 'DuLy Bến Vân Đồn', booking_date: '2026-11-09', booking_count: 25, week_str: '2026-W46', imported_at: '2026-11-16' },
  { id: 'BK-006', facility_id: 'FAC-02', facility_name: 'DuLy Bến Vân Đồn', booking_date: '2026-11-16', booking_count: 20, week_str: '2026-W47', imported_at: '2026-11-17' },

  // DuLy Landmark 81 (FAC-04)
  { id: 'BK-007', facility_id: 'FAC-04', facility_name: 'DuLy Landmark 81', booking_date: '2026-11-02', booking_count: 30, week_str: '2026-W45', imported_at: '2026-11-10' },
  { id: 'BK-008', facility_id: 'FAC-04', facility_name: 'DuLy Landmark 81', booking_date: '2026-11-09', booking_count: 28, week_str: '2026-W46', imported_at: '2026-11-16' },
  { id: 'BK-009', facility_id: 'FAC-04', facility_name: 'DuLy Landmark 81', booking_date: '2026-11-16', booking_count: 32, week_str: '2026-W47', imported_at: '2026-11-17' },

  // DuLy Ba Tháng Hai (FAC-03)
  { id: 'BK-010', facility_id: 'FAC-03', facility_name: 'DuLy Ba Tháng Hai', booking_date: '2026-11-02', booking_count: 12, week_str: '2026-W45', imported_at: '2026-11-10' },
  { id: 'BK-011', facility_id: 'FAC-03', facility_name: 'DuLy Ba Tháng Hai', booking_date: '2026-11-09', booking_count: 15, week_str: '2026-W46', imported_at: '2026-11-16' },

  // DuLy Phan Xích Long (FAC-05)
  { id: 'BK-012', facility_id: 'FAC-05', facility_name: 'DuLy Phan Xích Long', booking_date: '2026-11-02', booking_count: 19, week_str: '2026-W45', imported_at: '2026-11-10' },
  { id: 'BK-013', facility_id: 'FAC-05', facility_name: 'DuLy Phan Xích Long', booking_date: '2026-11-09', booking_count: 21, week_str: '2026-W46', imported_at: '2026-11-16' },

  // DuLy Pasteur Quận 1 (FAC-06)
  { id: 'BK-014', facility_id: 'FAC-06', facility_name: 'DuLy Pasteur Quận 1', booking_date: '2026-11-02', booking_count: 24, week_str: '2026-W45', imported_at: '2026-11-10' },
  { id: 'BK-015', facility_id: 'FAC-06', facility_name: 'DuLy Pasteur Quận 1', booking_date: '2026-11-09', booking_count: 26, week_str: '2026-W46', imported_at: '2026-11-16' },

  // DuLy Vũng Tàu Bãi Sau (FAC-12)
  { id: 'BK-016', facility_id: 'FAC-12', facility_name: 'DuLy Vũng Tàu Bãi Sau', booking_date: '2026-11-02', booking_count: 16, week_str: '2026-W45', imported_at: '2026-11-10' },
  { id: 'BK-017', facility_id: 'FAC-12', facility_name: 'DuLy Vũng Tàu Bãi Sau', booking_date: '2026-11-09', booking_count: 20, week_str: '2026-W46', imported_at: '2026-11-16' },

  // DuLy Đà Lạt Mimosa (FAC-13)
  { id: 'BK-018', facility_id: 'FAC-13', facility_name: 'DuLy Đà Lạt Mimosa', booking_date: '2026-11-02', booking_count: 10, week_str: '2026-W45', imported_at: '2026-11-10' },
  { id: 'BK-019', facility_id: 'FAC-13', facility_name: 'DuLy Đà Lạt Mimosa', booking_date: '2026-11-09', booking_count: 14, week_str: '2026-W46', imported_at: '2026-11-16' },

  // Note: DuLy Sala Đại Quang Minh, DuLy Thủ Đức Riverside, DuLy Tân Bình... intentionally lack some booking data to test "Chưa đủ dữ liệu booking để tính" behavior as requested in spec!
];

