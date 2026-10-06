import React, { useState } from 'react';
import { Incident, IncidentStatus, ChecklistItem, WorkNote } from '../types/infrastructure';
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Truck,
  Shield,
  Wrench,
  FileText,
  User,
  Send,
  Sparkles,
  ArrowRight,
  Phone,
  Flame,
  Check,
} from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  onToggleChecklist: (incidentId: string, checklistId: string) => void;
  onAddWorkNote: (incidentId: string, noteText: string) => void;
  isOnline: boolean;
}

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incident,
  onClose,
  onUpdateStatus,
  onToggleChecklist,
  onAddWorkNote,
  isOnline,
}) => {
  const [newNote, setNewNote] = useState('');

  if (!incident) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddWorkNote(incident.id, newNote.trim());
    setNewNote('');
  };

  const getNextStatus = (current: IncidentStatus): IncidentStatus | null => {
    switch (current) {
      case 'reported':
        return 'triaged';
      case 'triaged':
        return 'dispatched';
      case 'dispatched':
        return 'in_progress';
      case 'in_progress':
        return 'resolved';
      case 'resolved':
        return null;
    }
  };

  const nextStatus = getNextStatus(incident.status);

  // SLA Calculation
  const isSlaBreached = new Date(incident.slaDeadline).getTime() < Date.now() && incident.status !== 'resolved';
  const hoursLeft = Math.max(0, Math.round((new Date(incident.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60)));

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-amber-600 dark:text-amber-400">{incident.id}</span>
            <span>·</span>
            <span>{incident.sector}</span>
            <span>·</span>
            <span className="capitalize">{incident.category.replace('_', ' ')}</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {incident.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-4 shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Lifecycle Progression */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2.5">
            Operational Lifecycle:
          </div>
          <div className="flex items-center justify-between text-xs">
            {(['reported', 'triaged', 'dispatched', 'in_progress', 'resolved'] as IncidentStatus[]).map(
              (st, idx) => {
                const isCurrent = incident.status === st;
                const isPast =
                  ['reported', 'triaged', 'dispatched', 'in_progress', 'resolved'].indexOf(incident.status) >= idx;

                return (
                  <div key={st} className="flex flex-col items-center flex-1 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-colors ${
                        isCurrent
                          ? 'bg-amber-600 text-white ring-4 ring-amber-100 dark:ring-amber-950'
                          : isPast
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`mt-1.5 text-[11px] capitalize text-center ${
                        isCurrent
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </span>
                  </div>
                );
              }
            )}
          </div>

          {nextStatus && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Ready to advance work order:
              </span>
              <button
                onClick={() => onUpdateStatus(incident.id, nextStatus)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Advance to {nextStatus.replace('_', ' ')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Hazard Summary & Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Severity Rating</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Level {incident.severity}<span className="text-xs font-normal text-slate-400">/5</span>
            </div>
            <div className="text-[10px] text-slate-500 capitalize">{incident.priority} priority</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Public Risk Index</div>
            <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              {incident.riskScore}<span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[10px] text-slate-500">Civil safety hazard</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Target SLA</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {incident.slaHours}h
            </div>
            <div
              className={`text-[10px] ${
                isSlaBreached ? 'text-rose-500 font-semibold' : 'text-slate-500'
              }`}
            >
              {isSlaBreached ? 'SLA EXCEEDED' : `${hoursLeft}h remaining`}
            </div>
          </div>
        </div>

        {/* Hazard assessment text */}
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
            Hazard Analysis & Impact:
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
            {incident.hazardSummary}
          </p>
        </div>

        {/* Visual Evidence Photo */}
        {incident.imageUrl && (
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
              Visual Telemetry & Field Photo:
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-56">
              <img
                src={incident.imageUrl}
                alt="Defect visual"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        {/* Location & Department */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">{incident.locationName}</div>
              <div className="text-[11px] font-mono text-slate-500">
                GPS: {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)} ({incident.sector})
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-slate-900 dark:text-white">Responsible Agency: </span>
              {incident.recommendedDepartment}
            </div>
          </div>
        </div>

        {/* Required Materials & Machinery */}
        {incident.requiredEquipment && incident.requiredEquipment.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-400" />
              <span>Required Crew Machinery & Materials:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {incident.requiredEquipment.map((eq, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                  <span>{eq}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactive Field Technician Checklist */}
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Field Technician Action Checklist:</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {incident.checklist.filter(c => c.completed).length}/{incident.checklist.length} Completed
            </span>
          </div>
          <div className="space-y-2">
            {incident.checklist.map(item => (
              <label
                key={item.id}
                onClick={() => onToggleChecklist(incident.id, item.id)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  item.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 line-through opacity-80'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex-1">{item.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Work Order Notes & Dispatch Log */}
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Work Order Activity Log:</span>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto mb-3">
            {incident.workNotes.map(note => (
              <div
                key={note.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-medium text-slate-900 dark:text-slate-200">{note.author}</span>
                  <span>{note.timestamp}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{note.text}</p>
              </div>
            ))}
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Record field telemetry or technician progress note..."
              className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Post Note
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
