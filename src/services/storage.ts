import { 
  Facility, 
  IssueCategory, 
  Issue, 
  BookingRecord, 
  GeneralSettings, 
  TimelineEvent 
} from '../types';
import { 
  INITIAL_FACILITIES, 
  INITIAL_CATEGORIES, 
  INITIAL_ASSIGNEES, 
  INITIAL_ISSUES, 
  INITIAL_BOOKINGS 
} from '../data/initialData';

const STORAGE_KEYS = {
  FACILITIES: 'duly_facilities_v13',
  CATEGORIES: 'duly_categories_v13',
  ASSIGNEES: 'duly_assignees_v13',
  ISSUES: 'duly_issues_v13',
  BOOKINGS: 'duly_bookings_v13',
  SETTINGS: 'duly_settings_v13',
};

export const getSettings = (): GeneralSettings => {
  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing settings', e);
    }
  }
  return {
    isSampleDataEnabled: true,
    dataVersion: 'v13',
    appName: 'DuLy’s House | Operations',
    organization: 'DuLy Hospitality Group',
  };
};

export const saveSettings = (settings: GeneralSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getFacilities = (): Facility[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.FACILITIES);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing facilities', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_FACILITIES));
  return INITIAL_FACILITIES;
};

export const saveFacilities = (facilities: Facility[]): void => {
  localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
};

export const getCategories = (): IssueCategory[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing categories', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  return INITIAL_CATEGORIES;
};

export const saveCategories = (categories: IssueCategory[]): void => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const getAssignees = (): string[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNEES);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing assignees', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.ASSIGNEES, JSON.stringify(INITIAL_ASSIGNEES));
  return INITIAL_ASSIGNEES;
};

export const saveAssignees = (assignees: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.ASSIGNEES, JSON.stringify(assignees));
};

export const getIssues = (): Issue[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.ISSUES);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing issues', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES));
  return INITIAL_ISSUES;
};

export const saveIssues = (issues: Issue[]): void => {
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
};

export const getBookings = (): BookingRecord[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing bookings', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  return INITIAL_BOOKINGS;
};

export const saveBookings = (bookings: BookingRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
};

export const createIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'timeline'>): Issue => {
  const issues = getIssues();
  const nextNum = issues.length + 1;
  const id = `HS-2026-${String(nextNum).padStart(3, '0')}`;
  const now = new Date().toISOString();
  
  const newIssue: Issue = {
    ...issueData,
    id,
    createdAt: now,
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp: now,
        author: issueData.assignee || 'Hệ thống vận hành',
        action: 'Tạo hồ sơ',
        content: issueData.initialNotes || 'Khởi tạo hồ sơ vấn đề mới trên hệ thống.',
      }
    ]
  };

  issues.unshift(newIssue);
  saveIssues(issues);
  return newIssue;
};

export const updateIssue = (updatedIssue: Issue): void => {
  const issues = getIssues();
  const idx = issues.findIndex(i => i.id === updatedIssue.id);
  if (idx !== -1) {
    issues[idx] = updatedIssue;
    saveIssues(issues);
  }
};

export const addTimelineEvent = (issueId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>): void => {
  const issues = getIssues();
  const issue = issues.find(i => i.id === issueId);
  if (issue) {
    const newEvent: TimelineEvent = {
      ...event,
      id: `TL-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    if (!issue.timeline) issue.timeline = [];
    issue.timeline.unshift(newEvent);
    saveIssues(issues);
  }
};

export const resetToDemoData = (): void => {
  localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_FACILITIES));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.ASSIGNEES, JSON.stringify(INITIAL_ASSIGNEES));
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  const settings = getSettings();
  settings.isSampleDataEnabled = true;
  saveSettings(settings);
};

export const clearAllData = (): void => {
  localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  const settings = getSettings();
  settings.isSampleDataEnabled = false;
  saveSettings(settings);
};

export const exportAllDataJSON = (): string => {
  const data = {
    settings: getSettings(),
    facilities: getFacilities(),
    categories: getCategories(),
    assignees: getAssignees(),
    issues: getIssues(),
    bookings: getBookings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importAllDataJSON = (jsonStr: string): boolean => {
  try {
    const data = JSON.parse(jsonStr);
    if (data.facilities) saveFacilities(data.facilities);
    if (data.categories) saveCategories(data.categories);
    if (data.assignees) saveAssignees(data.assignees);
    if (data.issues) saveIssues(data.issues);
    if (data.bookings) saveBookings(data.bookings);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
};

