import React, { useState } from 'react';
import { Incident, IncidentPriority, IncidentCategory, IncidentStatus } from '../types/infrastructure';
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface IncidentListViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedCategoryFilter: string;
  onSelectCategoryFilter: (cat: string) => void;
  selectedPriorityFilter: string;
  onSelectPriorityFilter: (pri: string) => void;
}

export const IncidentListView: React.FC<IncidentListViewProps> = ({
  incidents,
  onSelectIncident,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  selectedPriorityFilter,
  onSelectPriorityFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'reportedAt' | 'severity' | 'riskScore'>('reportedAt');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = incidents
    .filter(inc => {
      if (selectedCategoryFilter !== 'all' && inc.category !== selectedCategoryFilter) return false;
      if (selectedPriorityFilter !== 'all' && inc.priority !== selectedPriorityFilter) return false;
      if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          inc.id.toLowerCase().includes(term) ||
          inc.title.toLowerCase().includes(term) ||
          inc.locationName.toLowerCase().includes(term) ||
          inc.sector.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === 'reportedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search defects by ID, street, or sector..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Lifecycles</option>
            <option value="reported">Reported</option>
            <option value="triaged">Triaged</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            onClick={() => {
              if (sortField === 'riskScore') {
                setSortAsc(!sortAsc);
              } else {
                setSortField('riskScore');
                setSortAsc(false);
              }
            }}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Sort by Risk</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Incident Identifier</th>
                <th className="py-3 px-4 font-semibold">Defect Description</th>
                <th className="py-3 px-4 font-semibold">Sector & Street</th>
                <th className="py-3 px-4 font-semibold">Severity / Risk</th>
                <th className="py-3 px-4 font-semibold">Lifecycle Status</th>
                <th className="py-3 px-4 font-semibold">SLA Target</th>
                <th className="py-3 px-4 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No infrastructure incidents match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(incident => {
                  const isCritical = incident.priority === 'critical';
                  return (
                    <tr
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <span className="text-amber-600 dark:text-amber-400">{incident.id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-1 max-w-xs">
                          {incident.title}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {incident.category.replace('_', ' ')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{incident.locationName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{incident.sector}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span
                            className={
                              isCritical
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : incident.priority === 'high'
                                ? 'text-orange-600 dark:text-orange-400 font-semibold'
                                : 'text-slate-700 dark:text-slate-300'
                            }
                          >
                            Level {incident.severity}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {incident.riskScore}/100 Risk
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`capitalize font-medium ${
                            incident.status === 'resolved'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : incident.status === 'in_progress'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {incident.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {incident.slaHours}h target
                      </td>

                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 inline-block transition-colors" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
