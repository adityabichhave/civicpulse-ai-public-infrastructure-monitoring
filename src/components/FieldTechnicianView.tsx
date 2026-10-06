import React, { useState } from 'react';
import { Incident, FieldCrew, IncidentStatus } from '../types/infrastructure';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Camera,
  Wrench,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Navigation,
} from 'lucide-react';

interface FieldTechnicianViewProps {
  incidents: Incident[];
  crews: FieldCrew[];
  activeCrewId: string;
  onChangeActiveCrew: (crewId: string) => void;
  isOnline: boolean;
  pendingCount: number;
  onToggleSimulateOffline: () => void;
  onSyncPendingQueue: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  onToggleChecklist: (incidentId: string, checklistId: string) => void;
  onSelectIncident: (incident: Incident) => void;
}

export const FieldTechnicianView: React.FC<FieldTechnicianViewProps> = ({
  incidents,
  crews,
  activeCrewId,
  onChangeActiveCrew,
  isOnline,
  pendingCount,
  onToggleSimulateOffline,
  onSyncPendingQueue,
  onUpdateStatus,
  onToggleChecklist,
  onSelectIncident,
}) => {
  const [filterType, setFilterType] = useState<'assigned' | 'all_active'>('assigned');
  const [isSyncing, setIsSyncing] = useState(false);

  const currentCrew = crews.find(c => c.id === activeCrewId) || crews[0];

  // Filter incidents for this crew
  const crewIncidents = incidents.filter(inc => {
    if (filterType === 'assigned') {
      return (
        inc.id === currentCrew.assignedIncidentId ||
        inc.recommendedDepartment.toLowerCase().includes(currentCrew.specialty.split(' ')[0].toLowerCase()) ||
        inc.priority === 'critical'
      );
    }
    return inc.status !== 'resolved';
  });

  const handleManualSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 700));
    onSyncPendingQueue();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Field Tech Telemetry & Connectivity Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Active Crew Selector & Vehicle Telemetry */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <select
                  value={activeCrewId}
                  onChange={e => onChangeActiveCrew(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white font-bold text-sm rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {crews.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Unit
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Lead: <span className="text-slate-200">{currentCrew.lead}</span> · Vehicle: <span className="text-slate-200">{currentCrew.vehicle}</span>
              </div>
            </div>
          </div>

          {/* Offline Sync Status Hub */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>Online Cellular Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span>Field Offline Mode Active</span>
                </>
              )}
            </div>

            {/* Offline simulator toggle button */}
            <button
              onClick={onToggleSimulateOffline}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            >
              {isOnline ? 'Simulate Tunnel Disconnect' : 'Reconnect Online Signal'}
            </button>

            {/* Sync Queue Button */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing || (!isOnline && pendingCount > 0)}
              className="px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {pendingCount > 0 ? `Sync Queue (${pendingCount} Pending)` : 'Database Synced'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setFilterType('assigned')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'assigned'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Unit Work Orders ({crewIncidents.length})
          </button>
          <button
            onClick={() => setFilterType('all_active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all_active'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Active City Incidents
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Offline changes automatically persist to local device storage.
        </div>
      </div>

      {/* Work Order Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {crewIncidents.map(incident => {
          const isCritical = incident.priority === 'critical';
          const isAssignedToThisUnit = incident.id === currentCrew.assignedIncidentId;
          const completedChecks = incident.checklist.filter(c => c.completed).length;
          const totalChecks = incident.checklist.length;
          const progressPct = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

          return (
            <div
              key={incident.id}
              className={`p-5 rounded-2xl border transition-all bg-white dark:bg-slate-900 ${
                isCritical
                  ? 'border-rose-300 dark:border-rose-900/60 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              {/* Card Top Banner */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{incident.id}</span>
                    <span>·</span>
                    <span>{incident.sector}</span>
                    {isAssignedToThisUnit && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Primary Assignment</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {incident.title}
                  </h3>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    Level {incident.severity} / {incident.priority}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                    SLA: {incident.slaHours}h target
                  </span>
                </div>
              </div>

              {/* Location Reference */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{incident.locationName}</span>
                <span className="ml-auto font-mono text-[11px] text-slate-400">
                  {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                </span>
              </div>

              {/* Hazard note */}
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                {incident.hazardSummary}
              </p>

              {/* Interactive checklist directly on the card for quick mobile/tablet field ticking */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span>Field Remediation Steps:</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {completedChecks}/{totalChecks} ({progressPct}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  {incident.checklist.slice(0, 3).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onToggleChecklist(incident.id, item.id)}
                      className={`w-full flex items-center gap-2 text-left text-xs p-1.5 rounded-lg transition-colors ${
                        item.completed
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.completed ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className={`truncate ${item.completed ? 'line-through opacity-80' : ''}`}>
                        {item.text}
                      </span>
                    </button>
                  ))}
                  {incident.checklist.length > 3 && (
                    <div
                      onClick={() => onSelectIncident(incident)}
                      className="text-[11px] text-amber-600 dark:text-amber-400 cursor-pointer pl-6 hover:underline"
                    >
                      + {incident.checklist.length - 3} more procedural steps...
                    </div>
                  )}
                </div>
              </div>

              {/* Status Advancement Button Row */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectIncident(incident)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                >
                  View Dossier
                </button>

                <div className="flex items-center gap-2">
                  {incident.status === 'reported' && (
                    <button
                      onClick={() => onUpdateStatus(incident.id, 'triaged')}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Acknowledge Triage
                    </button>
                  )}
                  {incident.status === 'triaged' && (
                    <button
                      onClick={() => onUpdateStatus(incident.id, 'dispatched')}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                    >
                      Dispatch En Route
                    </button>
                  )}
                  {incident.status === 'dispatched' && (
                    <button
                      onClick={() => onUpdateStatus(incident.id, 'in_progress')}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Arrived On Site</span>
                    </button>
                  )}
                  {incident.status === 'in_progress' && (
                    <button
                      onClick={() => onUpdateStatus(incident.id, 'resolved')}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Mark Fully Repaired</span>
                    </button>
                  )}
                  {incident.status === 'resolved' && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Work Order Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
