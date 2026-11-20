import * as XLSX from 'xlsx';
import { Facility, Issue, BookingRecord } from '../types';
import { getIsoWeek, isFutureDate } from './dateUtils';

export interface IssueRowValidation {
  rowIndex: number;
  data: Partial<Issue>;
  rawRow: Record<string, any>;
  isValid: boolean;
  isDuplicate: boolean;
  warnings: string[];
  errors: string[];
}

export interface IssueImportPreview {
  fileName: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  facilitiesIdentified: string[];
  rows: IssueRowValidation[];
}

export interface BookingRowValidation {
  rowIndex: number;
  facility_id: string;
  facility_name: string;
  booking_date: string;
  booking_count: number;
  week_str: string;
  is_future_date: boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BookingImportPreview {
  fileName: string;
  totalRows: number;
  validRows: number;
  futureDateRows: number;
  facilitiesIdentified: string[];
  groupedByWeek: {
    week_str: string;
    facility_name: string;
    facility_id: string;
    total_bookings: number;
    rowsCount: number;
  }[];
  rows: BookingRowValidation[];
}

export const parseIssueFile = async (
  file: File, 
  facilities: Facility[], 
  existingIssues: Issue[]
): Promise<IssueImportPreview> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  const facilitiesIdentifiedSet = new Set<string>();
  const validatedRows: IssueRowValidation[] = [];
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  jsonRows.forEach((row, index) => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Keys mapping (support Vietnamese and English headers)
    const facilityRaw = String(row['Cơ sở'] || row['facility_name'] || row['facility_id'] || row['Co so'] || '').trim();
    const room = String(row['Phòng'] || row['room'] || row['Phong'] || '').trim();
    const title = String(row['Tiêu đề'] || row['Nội dung tóm tắt'] || row['title'] || row['Tieu de'] || '').trim();
    const description = String(row['Mô tả chi tiết'] || row['Nội dung vấn đề'] || row['description'] || row['Mo ta'] || title).trim();
    const category = String(row['Nhóm vấn đề'] || row['category'] || row['Nhom van de'] || 'Cơ sở vật chất & Thiết bị phòng').trim();
    const sourceRaw = String(row['Nguồn'] || row['source'] || row['Nguon ghi nhan'] || 'Khách hàng phản ánh').trim();
    const assignee = String(row['Người phụ trách'] || row['assignee'] || row['Nguoi phu trach'] || 'Chưa phân công').trim();
    const statusRaw = String(row['Trạng thái'] || row['status'] || row['Trang thai'] || 'Chưa xử lý').trim();
    const dateRaw = String(row['Ngày ghi nhận'] || row['createdAt'] || row['Ngay'] || '').trim();

    // Facility match
    const matchedFacility = facilities.find(f => 
      f.name.toLowerCase() === facilityRaw.toLowerCase() || 
      f.code.toLowerCase() === facilityRaw.toLowerCase() ||
      f.id.toLowerCase() === facilityRaw.toLowerCase()
    );

    let facilityId = '';
    let facilityName = facilityRaw;

    if (matchedFacility) {
      facilityId = matchedFacility.id;
      facilityName = matchedFacility.name;
      facilitiesIdentifiedSet.add(matchedFacility.name);
    } else if (facilityRaw) {
      warnings.push(`Cơ sở "${facilityRaw}" chưa có trong danh mục hệ thống.`);
    } else {
      errors.push('Thiếu thông tin cơ sở (bắt buộc).');
    }

    if (!title) {
      errors.push('Thiếu tiêu đề / tóm tắt vấn đề (bắt buộc).');
    }

    if (!room) {
      warnings.push('Chưa ghi rõ số phòng / khu vực cụ thể.');
    }

    // Check duplicate with existing issues
    const isDup = existingIssues.some(existing => 
      existing.facility_name.toLowerCase() === facilityName.toLowerCase() &&
      existing.title.toLowerCase() === title.toLowerCase()
    );
    if (isDup) {
      warnings.push('Có thể trùng lặp với hồ sơ đã có trên hệ thống.');
    }

    const isValid = errors.length === 0;
    if (isValid) validCount++;
    else errorCount++;

    if (warnings.length > 0) warningCount++;

    let createdIso = new Date().toISOString();
    if (dateRaw) {
      const parsed = new Date(dateRaw);
      if (!isNaN(parsed.getTime())) createdIso = parsed.toISOString();
    }

    let sourceFormatted: any = 'Khách hàng phản ánh';
    if (sourceRaw.toLowerCase().includes('nội bộ')) sourceFormatted = 'Nội bộ phát hiện';
    else if (sourceRaw.toLowerCase().includes('hướng dẫn')) sourceFormatted = 'Hướng dẫn khách';

    let statusFormatted: any = 'Chưa xử lý';
    if (statusRaw.toLowerCase().includes('đang')) statusFormatted = 'Đang xử lý';
    else if (statusRaw.toLowerCase().includes('hoàn thành') || statusRaw.toLowerCase().includes('xong')) statusFormatted = 'Đã hoàn thành';
    else if (statusRaw.toLowerCase().includes('theo dõi')) statusFormatted = 'Cần theo dõi';

    validatedRows.push({
      rowIndex: index + 1,
      data: {
        facility_id: facilityId || 'FAC-UNKNOWN',
        facility_name: facilityName || 'Chưa xác định',
        room,
        title,
        description,
        category,
        source: sourceFormatted,
        assignee,
        status: statusFormatted,
        createdAt: createdIso,
        isVerified: warnings.length === 0,
        hasMissingInfo: !room || !facilityId,
      },
      rawRow: row,
      isValid,
      isDuplicate: isDup,
      warnings,
      errors
    });
  });

  return {
    fileName: file.name,
    totalRows: jsonRows.length,
    validRows: validCount,
    warningRows: warningCount,
    errorRows: errorCount,
    facilitiesIdentified: Array.from(facilitiesIdentifiedSet),
    rows: validatedRows,
  };
};

export const parseBookingFile = async (
  file: File,
  facilities: Facility[]
): Promise<BookingImportPreview> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  const facilitiesIdentifiedSet = new Set<string>();
  const validatedRows: BookingRowValidation[] = [];
  let futureCount = 0;
  let validCount = 0;

  const weekGroupsMap = new Map<string, {
    week_str: string;
    facility_name: string;
    facility_id: string;
    total_bookings: number;
    rowsCount: number;
  }>();

  jsonRows.forEach((row, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Support standard columns facility_id, facility_name, booking_date, booking_count
    const facIdentifier = String(row['facility_id'] || row['facility_name'] || row['Cơ sở'] || row['Ma co so'] || '').trim();
    const dateRaw = String(row['booking_date'] || row['Ngày'] || row['Ngay booking'] || '').trim();
    const countRaw = row['booking_count'] ?? row['Số booking'] ?? row['booking_checkout_count'];

    const countNum = parseInt(String(countRaw), 10);

    const matchedFac = facilities.find(f => 
      f.id.toLowerCase() === facIdentifier.toLowerCase() ||
      f.code.toLowerCase() === facIdentifier.toLowerCase() ||
      f.name.toLowerCase() === facIdentifier.toLowerCase()
    );

    let facId = '';
    let facName = facIdentifier;

    if (matchedFac) {
      facId = matchedFac.id;
      facName = matchedFac.name;
      facilitiesIdentifiedSet.add(matchedFac.name);
    } else if (facIdentifier) {
      warnings.push(`Cơ sở "${facIdentifier}" không khớp danh mục chuẩn.`);
    } else {
      errors.push('Thiếu mã hoặc tên cơ sở.');
    }

    if (!dateRaw) {
      errors.push('Thiếu booking_date.');
    }

    if (isNaN(countNum) || countNum < 0) {
      errors.push('booking_count không hợp lệ (phải là số nguyên không âm).');
    }

    let parsedDateStr = dateRaw;
    let isFuture = false;
    let weekStr = 'Không xác định';

    if (dateRaw) {
      // Handle Excel numeric dates if any
      let dateObj: Date;
      if (typeof dateRaw === 'number' || !isNaN(Number(dateRaw))) {
        // excel date serial
        dateObj = new Date(Math.round((Number(dateRaw) - 25569) * 86400 * 1000));
      } else {
        dateObj = new Date(dateRaw);
      }

      if (!isNaN(dateObj.getTime())) {
        parsedDateStr = dateObj.toISOString().split('T')[0];
        isFuture = isFutureDate(parsedDateStr);
        if (isFuture) {
          futureCount++;
          warnings.push('Ngày booking nằm ở tương lai (cần kiểm tra xem có phải ngày check-in thực tế).');
        }
        weekStr = getIsoWeek(dateObj).weekStr;
      } else {
        errors.push('Định dạng booking_date không hợp lệ.');
      }
    }

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
      const groupKey = `${facId || facName}_${weekStr}`;
      const existingGroup = weekGroupsMap.get(groupKey);
      if (existingGroup) {
        existingGroup.total_bookings += countNum;
        existingGroup.rowsCount += 1;
      } else {
        weekGroupsMap.set(groupKey, {
          week_str: weekStr,
          facility_id: facId,
          facility_name: facName,
          total_bookings: countNum,
          rowsCount: 1,
        });
      }
    }

    validatedRows.push({
      rowIndex: index + 1,
      facility_id: facId,
      facility_name: facName,
      booking_date: parsedDateStr,
      booking_count: isNaN(countNum) ? 0 : countNum,
      week_str: weekStr,
      is_future_date: isFuture,
      isValid,
      errors,
      warnings,
    });
  });

  return {
    fileName: file.name,
    totalRows: jsonRows.length,
    validRows: validCount,
    futureDateRows: futureCount,
    facilitiesIdentified: Array.from(facilitiesIdentifiedSet),
    groupedByWeek: Array.from(weekGroupsMap.values()).sort((a, b) => b.week_str.localeCompare(a.week_str)),
    rows: validatedRows,
  };
};

export const downloadSampleIssueTemplate = () => {
  const templateData = [
    {
      'Cơ sở': 'DuLy Thảo Điền',
      'Phòng': 'P.102',
      'Tiêu đề': 'Máy lạnh kêu to và rò nước ở ống dẫn',
      'Mô tả chi tiết': 'Khách phản ánh máy lạnh kêu rè rè suốt đêm làm mất ngủ, nước ngưng chảy xuống thảm.',
      'Nhóm vấn đề': 'Điện, Nước & Internet',
      'Nguồn': 'Khách hàng phản ánh',
      'Người phụ trách': 'Nguyễn Văn An (Kỹ thuật)',
      'Trạng thái': 'Chưa xử lý',
      'Ngày ghi nhận': '2026-11-15 14:00'
    },
    {
      'Cơ sở': 'DuLy Bến Vân Đồn',
      'Phòng': 'Studio River',
      'Tiêu đề': 'Rèm cửa ban công bị tuột móc treo',
      'Mô tả chi tiết': 'Dọn buồng kiểm tra phát hiện móc treo bên trái bị tuột 3 khoen.',
      'Nhóm vấn đề': 'Cơ sở vật chất & Thiết bị phòng',
      'Nguồn': 'Nội bộ phát hiện',
      'Người phụ trách': 'Lê Hoàng Long (Giám sát buồng phòng)',
      'Trạng thái': 'Đang xử lý',
      'Ngày ghi nhận': '2026-11-16 09:30'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Ho_So');
  XLSX.writeFile(wb, 'mau_nhap_ho_so_duly.xlsx');
};

export const downloadSampleBookingTemplate = () => {
  const templateData = [
    {
      'facility_id': 'FAC-01',
      'facility_name': 'DuLy Thảo Điền',
      'booking_date': '2026-11-10',
      'booking_count': 18
    },
    {
      'facility_id': 'FAC-01',
      'facility_name': 'DuLy Thảo Điền',
      'booking_date': '2026-11-17',
      'booking_count': 15
    },
    {
      'facility_id': 'FAC-02',
      'facility_name': 'DuLy Bến Vân Đồn',
      'booking_date': '2026-11-10',
      'booking_count': 24
    },
    {
      'facility_id': 'FAC-04',
      'facility_name': 'DuLy Landmark 81',
      'booking_date': '2026-11-10',
      'booking_count': 32
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Booking');
  XLSX.writeFile(wb, 'mau_nhap_booking_tuan_duly.xlsx');
};

