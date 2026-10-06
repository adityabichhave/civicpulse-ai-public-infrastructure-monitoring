import { Incident, IncidentStatus, ChecklistItem, WorkNote } from '../types/infrastructure';

export interface PendingAction {
  id: string;
  type: 'create_incident' | 'update_status' | 'toggle_checklist' | 'add_work_note';
  timestamp: string;
  incidentId: string;
  payload: any;
}

const STORAGE_KEY_INCIDENTS = 'civicpulse_incidents';
const STORAGE_KEY_PENDING = 'civicpulse_pending_queue';
const STORAGE_KEY_SIM_OFFLINE = 'civicpulse_simulated_offline';

export class OfflineSyncManager {
  private static listeners: ((isOnline: boolean, pendingCount: number) => void)[] = [];

  static isSimulatedOffline(): boolean {
    return localStorage.getItem(STORAGE_KEY_SIM_OFFLINE) === 'true';
  }

  static setSimulatedOffline(offline: boolean) {
    localStorage.setItem(STORAGE_KEY_SIM_OFFLINE, offline ? 'true' : 'false');
    this.notifyListeners();
  }

  static getEffectiveOnlineStatus(): boolean {
    if (this.isSimulatedOffline()) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  static getPendingQueue(): PendingAction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PENDING);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static queueAction(action: Omit<PendingAction, 'id' | 'timestamp'>): PendingAction {
    const queue = this.getPendingQueue();
    const newAction: PendingAction = {
      ...action,
      id: 'queue-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
    };
    queue.push(newAction);
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(queue));
    this.notifyListeners();
    return newAction;
  }

  static clearQueue() {
    localStorage.removeItem(STORAGE_KEY_PENDING);
    this.notifyListeners();
  }

  static subscribe(listener: (isOnline: boolean, pendingCount: number) => void): () => void {
    this.listeners.push(listener);
    // Initial call
    listener(this.getEffectiveOnlineStatus(), this.getPendingQueue().length);

    const handleNetworkChange = () => {
      this.notifyListeners();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }

  private static notifyListeners() {
    const isOnline = this.getEffectiveOnlineStatus();
    const pendingCount = this.getPendingQueue().length;
    this.listeners.forEach(l => l(isOnline, pendingCount));
  }

  // Load incidents from storage or fallback
  static loadLocalIncidents(initialFallback: Incident[]): Incident[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to parse local incidents:', err);
    }
    return initialFallback;
  }

  static saveLocalIncidents(incidents: Incident[]) {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
    } catch (err) {
      console.warn('Storage quota error:', err);
    }
  }
}
