import React, { useState, useEffect, useCallback } from 'react';
import { Incident, FieldCrew, PushNotification, IncidentStatus } from './types/infrastructure';
import { INITIAL_INCIDENTS, INITIAL_CREWS, INITIAL_NOTIFICATIONS } from './data/mockIncidents';
import { OfflineSyncManager } from './utils/offlineSync';
import { playNotificationChime } from './utils/audioChime';
import { Header, ActiveTab } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import { IncidentListView } from './components/IncidentListView';
import { FieldTechnicianView } from './components/FieldTechnicianView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportIssueModal } from './components/ReportIssueModal';
import { IncidentDetailDrawer } from './components/IncidentDetailDrawer';
import { DispatchOptimizerModal } from './components/DispatchOptimizerModal';
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationToast } from './components/NotificationToast';
import {
  Layers,
  MapPin,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Wifi,
  WifiOff,
  Crosshair,
} from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('civicpulse_theme') === 'dark' ||
      (!('civicpulse_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  // App core state
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    return OfflineSyncManager.loadLocalIncidents(INITIAL_INCIDENTS);
  });
  const [crews] = useState<FieldCrew[]>(INITIAL_CREWS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeCrewId, setActiveCrewId] = useState<string>('CREW-01');

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Offline status & synchronization queue
  const [isOnline, setIsOnline] = useState<boolean>(OfflineSyncManager.getEffectiveOnlineStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Modals & Panels
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Notifications & Sound
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Map pinpoint state for reporting
  const [isPinpointMode, setIsPinpointMode] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState<{
    lat: number;
    lng: number;
    locationName: string;
  } | null>(null);

  // Sync dark mode class on HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('civicpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('civicpulse_theme', 'light');
    }
  }, [isDarkMode]);

  // Save incidents to local storage whenever updated
  useEffect(() => {
    OfflineSyncManager.saveLocalIncidents(incidents);
  }, [incidents]);

  // Subscribe to offline state & queue updates
  useEffect(() => {
    const unsubscribe = OfflineSyncManager.subscribe((onlineStatus, pendingCount) => {
      setIsOnline(onlineStatus);
      setPendingSyncCount(pendingCount);
    });
    return unsubscribe;
  }, []);

  // Push notification dispatcher helper
  const triggerPushNotification = useCallback(
    (
      title: string,
      message: string,
      severity: 'critical' | 'high' | 'info' | 'success' = 'info',
      incidentId?: string
    ) => {
      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        timestamp: 'Just now',
        severity,
        incidentId,
        read: false,
      };

      setNotifications(prev => [newNotif, ...prev]);
      setActiveToast(newNotif);

      if (soundEnabled) {
        if (severity === 'critical') playNotificationChime('critical');
        else if (severity === 'success') playNotificationChime('success');
        else playNotificationChime('alert');
      }

      // Check browser native Notification API if allowed
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico',
          });
        } catch {
          // ignore
        }
      }
    },
    [soundEnabled]
  );

  // Handle new incident submission
  const handleCreateIncident = (newIncidentData: Partial<Incident>) => {
    const id = `CIVIC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const fullIncident: Incident = {
      id,
      title: newIncidentData.title || 'Reported Infrastructure Defect',
      defectName: newIncidentData.defectName || 'Civil Defect',
      category: newIncidentData.category || 'roadways',
      severity: newIncidentData.severity || 3,
      priority: newIncidentData.priority || 'medium',
      status: 'reported',
      riskScore: newIncidentData.riskScore || 50,
      hazardSummary: newIncidentData.hazardSummary || 'Reported for municipal prioritization.',
      locationName: newIncidentData.locationName || 'Metropolitan Grid',
      sector: newIncidentData.sector || 'Downtown Core',
      latitude: newIncidentData.latitude || 37.778,
      longitude: newIncidentData.longitude || -122.418,
      imageUrl: newIncidentData.imageUrl,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reporterType: newIncidentData.reporterType || 'citizen',
      reporterName: newIncidentData.reporterName || 'Citizen Report',
      recommendedDepartment: newIncidentData.recommendedDepartment || 'Public Works',
      slaHours: newIncidentData.slaHours || 24,
      slaDeadline: newIncidentData.slaDeadline || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      requiredEquipment: newIncidentData.requiredEquipment || ['Standard Utility Unit'],
      checklist: newIncidentData.checklist || [],
      workNotes: newIncidentData.workNotes || [],
      syncStatus: isOnline ? 'synced' : 'pending_sync',
      environmentalImpact: newIncidentData.environmentalImpact,
      confidence: newIncidentData.confidence || 0.95,
    };

    setIncidents(prev => [fullIncident, ...prev]);

    if (!isOnline) {
      OfflineSyncManager.queueAction({
        type: 'create_incident',
        incidentId: fullIncident.id,
        payload: fullIncident,
      });
      triggerPushNotification(
        'QUEUED OFFLINE: Defect Recorded',
        `${fullIncident.title} stored to local technician memory. Will sync when cell connectivity resumes.`,
        'info',
        fullIncident.id
      );
    } else {
      triggerPushNotification(
        fullIncident.priority === 'critical' ? 'CRITICAL HAZARD DISPATCHED' : 'NEW INCIDENT LOGGED',
        `${fullIncident.title} on ${fullIncident.locationName}. Assigned to ${fullIncident.recommendedDepartment}.`,
        fullIncident.priority === 'critical' ? 'critical' : 'high',
        fullIncident.id
      );
    }

    // Reset pinpoint state
    setPinnedLocation(null);
  };

  // Handle advancing lifecycle status
  const handleUpdateStatus = (incidentId: string, newStatus: IncidentStatus) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          const updated: Incident = {
            ...inc,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            syncStatus: isOnline ? 'synced' : 'pending_sync',
          };

          if (!isOnline) {
            OfflineSyncManager.queueAction({
              type: 'update_status',
              incidentId,
              payload: { status: newStatus },
            });
          }

          return updated;
        }
        return inc;
      })
    );

    // Keep drawer selected incident fresh
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(prev => (prev ? { ...prev, status: newStatus } : null));
    }

    triggerPushNotification(
      `Status Advanced: ${newStatus.replace('_', ' ').toUpperCase()}`,
      `Work order ${incidentId} progressed to ${newStatus.replace('_', ' ')}.`,
      newStatus === 'resolved' ? 'success' : 'info',
      incidentId
    );
  };

  // Handle technician checklist item toggle
  const handleToggleChecklist = (incidentId: string, checklistId: string) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          const updatedChecklist = inc.checklist.map(item =>
            item.id === checklistId
              ? { ...item, completed: !item.completed, completedAt: !item.completed ? 'Just now' : undefined }
              : item
          );

          if (!isOnline) {
            OfflineSyncManager.queueAction({
              type: 'toggle_checklist',
              incidentId,
              payload: { checklistId },
            });
          }

          return { ...inc, checklist: updatedChecklist };
        }
        return inc;
      })
    );

    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(prev =>
        prev
          ? {
              ...prev,
              checklist: prev.checklist.map(i =>
                i.id === checklistId ? { ...i, completed: !i.completed } : i
              ),
            }
          : null
      );
    }
  };

  // Handle adding work order note
  const handleAddWorkNote = (incidentId: string, noteText: string) => {
    const newNote = {
      id: `wn-${Date.now()}`,
      author: 'Field Technician',
      role: 'technician' as const,
      timestamp: 'Just now',
      text: noteText,
    };

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          if (!isOnline) {
            OfflineSyncManager.queueAction({
              type: 'add_work_note',
              incidentId,
              payload: newNote,
            });
          }
          return {
            ...inc,
            workNotes: [newNote, ...inc.workNotes],
          };
        }
        return inc;
      })
    );

    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(prev =>
        prev ? { ...prev, workNotes: [newNote, ...prev.workNotes] } : null
      );
    }
  };

  // Sync pending offline queue
  const handleSyncPendingQueue = () => {
    const queue = OfflineSyncManager.getPendingQueue();
    if (queue.length === 0) return;

    // Mark all incidents as synced
    setIncidents(prev =>
      prev.map(inc => ({
        ...inc,
        syncStatus: 'synced',
      }))
    );

    OfflineSyncManager.clearQueue();

    if (soundEnabled) playNotificationChime('sync');

    triggerPushNotification(
      'DATABASE SYNCHRONIZATION COMPLETE',
      `Synchronized ${queue.length} pending field changes to central municipal infrastructure hub.`,
      'success'
    );
  };

  // Toggle simulated offline mode for field testing
  const handleToggleSimulateOffline = () => {
    const nextState = !OfflineSyncManager.isSimulatedOffline();
    OfflineSyncManager.setSimulatedOffline(nextState);
    triggerPushNotification(
      nextState ? 'SIMULATED TUNNEL DISCONNECT ACTIVE' : 'RECONNECTED TO CIVIC CLOUD',
      nextState
        ? 'Field technician queue mode enabled. Changes will store in offline local cache.'
        : 'Network online restored. Synchronizing queued work orders.',
      nextState ? 'info' : 'success'
    );
  };

  // Trigger test push alert
  const handleSendTestNotification = () => {
    triggerPushNotification(
      'ALERT TEST // ARTERIAL TRAFFIC DISPATCH',
      'Instant push notification transmission confirmed across all connected field tablets.',
      'info'
    );
  };

  // Handle map pinpoint select
  const handlePinpointSelect = (lat: number, lng: number, locationName: string) => {
    setPinnedLocation({ lat, lng, locationName });
    setIsPinpointMode(false);
    setIsReportModalOpen(true);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenOptimizerModal={() => setIsOptimizerModalOpen(true)}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
        unreadNotificationCount={unreadCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        totalIncidentsCount={incidents.length}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Sub-header Filter & Quick Status Ribbon (shown on Map & Registry views) */}
        {(activeTab === 'map' || activeTab === 'list') && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Filter by Category */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium mr-1 hidden sm:inline">Category:</span>
              {(['all', 'roadways', 'drainage', 'lighting', 'bridges_structures', 'water_mains', 'sidewalks'] as const).map(
                cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat === 'all' ? 'All Domains' : cat.replace('_', ' ')}
                  </button>
                )
              )}
            </div>

            {/* Filter by Priority */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium mr-1 hidden md:inline">Priority:</span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map(pri => (
                <button
                  key={pri}
                  onClick={() => setPriorityFilter(pri)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    priorityFilter === pri
                      ? pri === 'critical'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: Interactive Geospatial Vector Map */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <InteractiveMap
              incidents={incidents}
              crews={crews}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              isPinpointMode={isPinpointMode}
              onPinpointSelect={handlePinpointSelect}
              selectedCategoryFilter={categoryFilter}
              selectedPriorityFilter={priorityFilter}
            />

            {/* Quick Live Telemetry Strip below map */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-500">Critical L5 Directives</div>
                  <div className="font-bold font-mono text-base text-rose-600 dark:text-rose-400">
                    {incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved').length}
                  </div>
                </div>
                <AlertTriangle className="w-5 h-5 text-rose-500 opacity-80" />
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-500">Active Field Crews</div>
                  <div className="font-bold font-mono text-base text-emerald-600 dark:text-emerald-400">
                    {crews.filter(c => c.status === 'on_mission').length}/{crews.length} Units
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-500">Offline Queue Cache</div>
                  <div className="font-bold font-mono text-base text-slate-800 dark:text-slate-200">
                    {pendingSyncCount} Actions
                  </div>
                </div>
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-emerald-500 opacity-80" />
                ) : (
                  <WifiOff className="w-5 h-5 text-amber-500 opacity-80" />
                )}
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-500">Gemini AI Model</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    gemini-3.8-flash
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-amber-500 opacity-80" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Defect Registry Table */}
        {activeTab === 'list' && (
          <IncidentListView
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            selectedCategoryFilter={categoryFilter}
            onSelectCategoryFilter={setCategoryFilter}
            selectedPriorityFilter={priorityFilter}
            onSelectPriorityFilter={setPriorityFilter}
          />
        )}

        {/* Tab 3: Field Technician Console (Touch-friendly & Offline-synced) */}
        {activeTab === 'field' && (
          <FieldTechnicianView
            incidents={incidents}
            crews={crews}
            activeCrewId={activeCrewId}
            onChangeActiveCrew={setActiveCrewId}
            isOnline={isOnline}
            pendingCount={pendingSyncCount}
            onToggleSimulateOffline={handleToggleSimulateOffline}
            onSyncPendingQueue={handleSyncPendingQueue}
            onUpdateStatus={handleUpdateStatus}
            onToggleChecklist={handleToggleChecklist}
            onSelectIncident={setSelectedIncident}
          />
        )}

        {/* Tab 4: Analytics & Visualizations */}
        {activeTab === 'analytics' && <AnalyticsView incidents={incidents} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">CivicPulse</span>
            <span>·</span>
            <span>Municipal Infrastructure Telemetry & Remediation</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleSimulateOffline}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isOnline ? 'Test Offline Mode' : 'Restore Online Mode'}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleSendTestNotification}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Push Notification Test
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-out Drawers */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateIncident}
        onRequestPinpointOnMap={() => {
          setIsPinpointMode(true);
          setActiveTab('map');
        }}
        pinnedLocation={pinnedLocation}
        isOnline={isOnline}
      />

      <IncidentDetailDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateStatus}
        onToggleChecklist={handleToggleChecklist}
        onAddWorkNote={handleAddWorkNote}
        isOnline={isOnline}
      />

      <DispatchOptimizerModal
        isOpen={isOptimizerModalOpen}
        onClose={() => setIsOptimizerModalOpen(false)}
        incidents={incidents}
        crews={crews}
      />

      <NotificationCenter
        notifications={notifications}
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onMarkAllAsRead={() =>
          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        }
        onSelectNotificationIncident={incidentId => {
          const inc = incidents.find(i => i.id === incidentId);
          if (inc) {
            setSelectedIncident(inc);
            setIsNotificationCenterOpen(false);
          }
        }}
        onSendTestNotification={handleSendTestNotification}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      <NotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onSelectIncident={incidentId => {
          const inc = incidents.find(i => i.id === incidentId);
          if (inc) setSelectedIncident(inc);
        }}
      />
    </div>
  );
}
