import React, { useState } from 'react';
import { Incident, FieldCrew } from '../types/infrastructure';
import {
  Sparkles,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  CalendarCheck,
  Send,
  Navigation,
} from 'lucide-react';

interface DispatchOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  crews: FieldCrew[];
}

export const DispatchOptimizerModal: React.FC<DispatchOptimizerModalProps> = ({
  isOpen,
  onClose,
  incidents,
  crews,
}) => {
  const [targetSector, setTargetSector] = useState<string>('All Sectors');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const activeIncidents = incidents.filter(i => i.status !== 'resolved');
      const response = await fetch('/api/optimize-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidents: activeIncidents,
          crewCount: crews.length,
          targetSector: targetSector === 'All Sectors' ? undefined : targetSector,
        }),
      });
      const data = await response.json();
      if (data.plan) {
        setPlanResult(data.plan);
      }
    } catch (err) {
      console.error('Optimizer failed:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                AI Dispatch & Route Optimizer
              </h2>
              <div className="text-xs text-slate-500">
                Gemini automated proximity clustering & SLA hazard weighting
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Configure Municipal Dispatch Constraints:
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {incidents.filter(i => i.status !== 'resolved').length} unresolved incidents across {crews.length} active fleet units
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={targetSector}
                onChange={e => setTargetSector(e.target.value)}
                className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="All Sectors">All Sectors</option>
                <option value="Downtown Core">Downtown Core</option>
                <option value="Riverfront District">Riverfront District</option>
                <option value="North Hills">North Hills</option>
                <option value="South Hub">South Hub</option>
                <option value="West Industrial">West Industrial</option>
              </select>

              <button
                onClick={handleRunOptimizer}
                disabled={isOptimizing}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calculating Routes...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Run Optimization</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display */}
          {planResult && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  {planResult.dispatchPlanTitle || 'Strategic Dispatch Rationale'}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {planResult.strategicOverview}
                </p>
              </div>

              {/* Crew Routes */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Recommended Fleet Assignments:
                </div>
                {planResult.recommendedCrewRouting?.map((cr: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-500" />
                        <span>{cr.crewId}</span>
                      </div>
                      <span className="font-mono text-slate-500">Est. Shift: {cr.totalEstHours || 4} hrs</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong>Target Routing: </strong>{cr.routeSummary}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Assigned Work Orders: {(cr.assignedIncidents || []).join(', ') || 'Pending Auto-Lock'}
                    </div>
                  </div>
                ))}
              </div>

              {planResult.urgentSlaAlerts && (
                <div className="text-xs text-rose-600 dark:text-rose-400 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Critical SLA Directives:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {planResult.urgentSlaAlerts.map((alt: string, i: number) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
