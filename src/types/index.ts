export type IssueStatus = 'Chưa xử lý' | 'Đang xử lý' | 'Cần theo dõi' | 'Đã hoàn thành';

export type IssueSource = 'Khách hàng phản ánh' | 'Nội bộ phát hiện' | 'Hướng dẫn khách';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  content: string;
}

export interface Issue {
  id: string;
  facility_id: string;
  facility_name: string;
  room?: string;
  title: string;
  description: string;
  category: string;
  source: IssueSource;
  assignee: string;
  status: IssueStatus;
  createdAt: string;
  resolvedAt?: string;
  initialNotes?: string;
  isVerified: boolean;
  hasMissingInfo: boolean;
  timeline: TimelineEvent[];
}

export interface Facility {
  id: string;
  code: string;
  name: string;
  address?: string;
  rooms: string[];
  status: 'active' | 'inactive';
}

export interface IssueCategory {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface BookingRecord {
  id: string;
  facility_id: string;
  facility_name: string;
  booking_date: string;
  booking_count: number;
  week_str?: string;
  imported_at: string;
  is_future_date?: boolean;
}

export interface WeeklyBookingSummary {
  facility_id: string;
  facility_name: string;
  week_str: string;
  total_bookings: number;
}

export type AgeFilter = 'all' | '<1w' | '1-2w' | '2-4w' | '>4w';

export interface IssueFilterState {
  searchQuery: string;
  facilityId: string;
  source: string;
  category: string;
  status: string;
  assignee: string;
  ageFilter: AgeFilter;
  dateFrom: string;
  dateTo: string;
  missingOnly?: boolean;
  urgentOnly?: boolean;
}

export interface GeneralSettings {
  isSampleDataEnabled: boolean;
  dataVersion: string;
  appName: string;
  organization: string;
}

