import React, { useState, useEffect } from 'react';
import { 
  getFacilities, 
  getCategories, 
  getAssignees, 
  getIssues, 
  getBookings, 
  getSettings,
  saveFacilities,
  saveCategories,
  saveAssignees,
  saveIssues,
  saveBookings,
  saveSettings,
  createIssue,
  updateIssue,
  addTimelineEvent
} from './services/storage';
import { 
  Issue, 
  Facility, 
  IssueCategory, 
  BookingRecord, 
  GeneralSettings, 
  IssueFilterState,
  IssueStatus
} from './types';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { SampleDataNotice } from './components/common/SampleDataNotice';
import { OverviewTab } from './components/overview/OverviewTab';
import { IssuesTab } from './components/issues/IssuesTab';
import { DataImportTab } from './components/import/DataImportTab';
import { ReportsTab } from './components/reports/ReportsTab';
import { SettingsTab } from './components/settings/SettingsTab';
import { ZaloTab } from './components/zalo/ZaloTab';
import { IssueDetailModal } from './components/issues/IssueDetailModal';
import { IssueFormModal } from './components/issues/IssueFormModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [settings, setSettings] = useState<GeneralSettings>({
    isSampleDataEnabled: true,
    dataVersion: 'v13',
    appName: 'DuLy’s House | Operations',
    organization: 'DuLy Hospitality Group',
  });

  // Filter state for Issues tab
  const [issueFilterState, setIssueFilterState] = useState<IssueFilterState>({
    searchQuery: '',
    facilityId: 'all',
    source: 'all',
    category: 'all',
    status: 'all',
    assignee: 'all',
    ageFilter: 'all',
    dateFrom: '',
    dateTo: '',
    missingOnly: false,
  });

  // Modals
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isIssueFormOpen, setIsIssueFormOpen] = useState<boolean>(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [selectedDetailIssue, setSelectedDetailIssue] = useState<Issue | null>(null);

  // App-level toast message
  const [appToast, setAppToast] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setAppToast({ text, type });
    setTimeout(() => setAppToast(null), 3500);
  };

  // Load initial data
  const loadAllData = () => {
    setFacilities(getFacilities());
    setCategories(getCategories());
    setAssignees(getAssignees());
    setIssues(getIssues());
    setBookings(getBookings());
    setSettings(getSettings());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update storage & state wrappers
  const handleUpdateFacilities = (newFacs: Facility[]) => {
    setFacilities(newFacs);
    saveFacilities(newFacs);
  };

  const handleUpdateCategories = (newCats: IssueCategory[]) => {
    setCategories(newCats);
    saveCategories(newCats);
  };

  const handleUpdateAssignees = (newAssignees: string[]) => {
    setAssignees(newAssignees);
    saveAssignees(newAssignees);
  };

  const handleUpdateIssues = (newIssues: Issue[]) => {
    setIssues(newIssues);
    saveIssues(newIssues);
  };

  const handleUpdateBookings = (newBookings: BookingRecord[]) => {
    setBookings(newBookings);
    saveBookings(newBookings);
  };

  const handleUpdateSettings = (newSettings: GeneralSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Issue CRUD actions
  const handleSaveIssue = (issueData: any, isEdit: boolean) => {
    if (isEdit && editingIssue) {
      const updated: Issue = {
        ...editingIssue,
        ...issueData,
      };
      updateIssue(updated);
      handleUpdateIssues(issues.map(i => i.id === updated.id ? updated : i));
      setIsIssueFormOpen(false);
      setEditingIssue(null);
      setSelectedDetailIssue(updated);
      showToast(`Đã cập nhật hồ sơ ${updated.id} thành công!`);
    } else {
      const created = createIssue(issueData);
      handleUpdateIssues([created, ...issues]);
      setIsIssueFormOpen(false);
      setSelectedDetailIssue(created);
      showToast(`Đã tạo mới hồ sơ ${created.id} thành công!`);
    }
  };

  const handleQuickStatusChange = (issueId: string, newStatus: IssueStatus) => {
    const updated = issues.map(i => {
      if (i.id === issueId) {
        return {
          ...i,
          status: newStatus,
          resolvedAt: newStatus === 'Đã hoàn thành' ? new Date().toISOString() : undefined,
        };
      }
      return i;
    });
    handleUpdateIssues(updated);
    if (selectedDetailIssue && selectedDetailIssue.id === issueId) {
      setSelectedDetailIssue({
        ...selectedDetailIssue,
        status: newStatus,
      });
    }
  };

  const handleAddTimeline = (issueId: string, author: string, action: string, content: string) => {
    addTimelineEvent(issueId, { author, action, content });
    const freshIssues = getIssues();
    setIssues(freshIssues);
    const updatedTarget = freshIssues.find(i => i.id === issueId);
    if (updatedTarget) {
      setSelectedDetailIssue(updatedTarget);
    }
  };

  // Navigation with filter drilldown (Specification requirement: Bấm chỉ số mở đúng hồ sơ cấu thành)
  const handleNavigateToIssuesWithFilter = (filters: Partial<IssueFilterState>) => {
    setIssueFilterState(prev => ({
      ...prev,
      searchQuery: '',
      facilityId: 'all',
      source: 'all',
      category: 'all',
      status: 'all',
      assignee: 'all',
      ageFilter: 'all',
      missingOnly: false,
      ...filters,
    }));
    setCurrentTab('issues');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open issues count for badges
  const openIssuesCount = issues.filter(i => i.status !== 'Đã hoàn thành').length;
  const unverifiedCount = issues.filter(i => !i.isVerified || i.hasMissingInfo).length;

  return (
    <div className="min-h-screen bg-brand-bg flex text-brand-text">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          openIssuesCount={openIssuesCount}
          unverifiedCount={unverifiedCount}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openIssuesCount={openIssuesCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onPrimaryAction={() => {
            if (currentTab === 'overview' || currentTab === 'issues') {
              setEditingIssue(null);
              setIsIssueFormOpen(true);
            } else if (currentTab === 'import') {
              // Switch to sample download
              window.open('#', '_blank');
            } else if (currentTab === 'reports') {
              showToast('Đã kích hoạt sao chép nhận xét báo cáo');
            } else if (currentTab === 'settings') {
              setCurrentTab('settings');
            }
          }}
          onSecondaryAction={() => {
            if (currentTab === 'overview') {
              setCurrentTab('import');
            } else if (currentTab === 'issues') {
              setCurrentTab('import');
            }
          }}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Sample Data Notification Tag */}
          <SampleDataNotice
            isSampleData={settings.isSampleDataEnabled}
            onNavigateToImport={() => setCurrentTab('import')}
          />

          {/* Active Tab View */}
          {currentTab === 'overview' && (
            <OverviewTab
              issues={issues}
              facilities={facilities}
              categories={categories}
              bookings={bookings}
              onNavigateToIssuesWithFilter={handleNavigateToIssuesWithFilter}
              onNavigateToImport={() => setCurrentTab('import')}
              onSelectIssue={(issue) => setSelectedDetailIssue(issue)}
            />
          )}

          {currentTab === 'issues' && (
            <IssuesTab
              issues={issues}
              facilities={facilities}
              categories={categories}
              assignees={assignees}
              filterState={issueFilterState}
              setFilterState={setIssueFilterState}
              onOpenCreateModal={() => {
                setEditingIssue(null);
                setIsIssueFormOpen(true);
              }}
              onOpenEditModal={(issue) => {
                setEditingIssue(issue);
                setIsIssueFormOpen(true);
              }}
              onSelectIssue={(issue) => setSelectedDetailIssue(issue)}
              onNavigateToImport={() => setCurrentTab('import')}
            />
          )}

          {currentTab === 'zalo' && (
            <ZaloTab
              facilities={facilities}
              onCreateIssueFromZalo={(zaloTask) => {
                const matchedFacility = facilities.find(
                  f => f.id.toLowerCase() === zaloTask.facility.toLowerCase() || 
                       f.code.toLowerCase() === zaloTask.facility.toLowerCase() ||
                       f.name.toLowerCase().includes(zaloTask.facility.toLowerCase())
                ) || facilities[0];
                
                setEditingIssue({
                  id: `HS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  facility_id: matchedFacility ? matchedFacility.id : 'nct',
                  facility_name: matchedFacility ? matchedFacility.name : 'NCT',
                  room: zaloTask.room !== 'Chưa rõ' ? zaloTask.room : '',
                  title: zaloTask.message,
                  description: `Báo cáo tiếp nhận từ nhóm Zalo "${zaloTask.group_name}" bởi ${zaloTask.sender}`,
                  source: 'Nội bộ phát hiện',
                  category: categories[0]?.name || 'Khác',
                  assignee: '',
                  status: 'Chưa xử lý',
                  createdAt: new Date().toISOString(),
                  isVerified: true,
                  hasMissingInfo: false,
                  timeline: [
                    {
                      id: `ev-${Date.now()}`,
                      author: zaloTask.sender || 'Zalo Member',
                      timestamp: new Date().toISOString(),
                      action: 'Tiếp nhận qua Zalo',
                      content: `Phản ánh từ nhóm Zalo "${zaloTask.group_name}": ${zaloTask.message}`
                    }
                  ]
                });
                setIsIssueFormOpen(true);
              }}
            />
          )}

          {currentTab === 'import' && (
            <DataImportTab
              facilities={facilities}
              existingIssues={issues}
              onImportIssues={(newIssues) => {
                const combined = [...newIssues, ...issues];
                handleUpdateIssues(combined);
                showToast(`Đã nhập thành công ${newIssues.length} hồ sơ vào hệ thống`);
              }}
              onImportBookings={(newBookings) => {
                const combined = [...newBookings, ...bookings];
                handleUpdateBookings(combined);
                showToast(`Đã cập nhật dữ liệu booking ${newBookings.length} kỳ vào báo cáo`);
              }}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsTab
              issues={issues}
              facilities={facilities}
              categories={categories}
              bookings={bookings}
              onNavigateToIssuesWithFilter={handleNavigateToIssuesWithFilter}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsTab
              facilities={facilities}
              categories={categories}
              assignees={assignees}
              settings={settings}
              issues={issues}
              onUpdateFacilities={handleUpdateFacilities}
              onUpdateCategories={handleUpdateCategories}
              onUpdateAssignees={handleUpdateAssignees}
              onUpdateSettings={handleUpdateSettings}
              onRefreshData={loadAllData}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {selectedDetailIssue && (
        <IssueDetailModal
          issue={selectedDetailIssue}
          onClose={() => setSelectedDetailIssue(null)}
          onEdit={(issue) => {
            setSelectedDetailIssue(null);
            setEditingIssue(issue);
            setIsIssueFormOpen(true);
          }}
          onStatusChange={handleQuickStatusChange}
          onAddTimelineEvent={handleAddTimeline}
          assignees={assignees}
        />
      )}

      {isIssueFormOpen && (
        <IssueFormModal
          isOpen={isIssueFormOpen}
          onClose={() => {
            setIsIssueFormOpen(false);
            setEditingIssue(null);
          }}
          onSave={handleSaveIssue}
          editingIssue={editingIssue}
          facilities={facilities}
          categories={categories}
          assignees={assignees}
        />
      )}

      {/* Global Toast */}
      {appToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-primary text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span>{appToast.text}</span>
        </div>
      )}
    </div>
  );
};

export default App;

