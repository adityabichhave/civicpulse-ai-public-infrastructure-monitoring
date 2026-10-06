import React from 'react';
import { Incident } from '../types/infrastructure';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Shield,
  Activity,
  Layers,
  BarChart3,
  MapPin,
  Zap,
} from 'lucide-react';

interface AnalyticsViewProps {
  incidents: Incident[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ incidents }) => {
  const total = incidents.length;
  const criticalCount = incidents.filter(i => i.priority === 'critical').length;
  const highCount = incidents.filter(i => i.priority === 'high').length;
  const inProgressCount = incidents.filter(i => i.status === 'in_progress' || i.status === 'dispatched').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  // Category counts
  const categoryStats: Record<string, number> = {
    roadways: 0,
    drainage: 0,
    lighting: 0,
    bridges_structures: 0,
    sidewalks: 0,
    water_mains: 0,
    traffic_signals: 0,
  };

  incidents.forEach(inc => {
    if (categoryStats[inc.category] !== undefined) {
      categoryStats[inc.category]++;
    }
  });

  // Sector breakdown
  const sectorStats: Record<string, { total: number; critical: number; inProgress: number }> = {
    'Downtown Core': { total: 0, critical: 0, inProgress: 0 },
    'Riverfront District': { total: 0, critical: 0, inProgress: 0 },
    'North Hills': { total: 0, critical: 0, inProgress: 0 },
    'South Hub': { total: 0, critical: 0, inProgress: 0 },
    'West Industrial': { total: 0, critical: 0, inProgress: 0 },
  };

  incidents.forEach(inc => {
    if (sectorStats[inc.sector]) {
      sectorStats[inc.sector].total++;
      if (inc.priority === 'critical') sectorStats[inc.sector].critical++;
      if (inc.status === 'in_progress') sectorStats[inc.sector].inProgress++;
    }
  });

  // Mock 7-day trend data
  const weeklyTrends = [
    { day: 'Mon', reported: 14, resolved: 12 },
    { day: 'Tue', reported: 19, resolved: 17 },
    { day: 'Wed', reported: 12, resolved: 15 },
    { day: 'Thu', reported: 22, resolved: 19 },
    { day: 'Fri', reported: 26, resolved: 23 },
    { day: 'Sat', reported: 11, resolved: 14 },
    { day: 'Sun', reported: 8, resolved: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Tracked Incidents</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active in metropolitan district
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>Critical Severity (L5)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
            {criticalCount}
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
            Immediate dispatch required
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Crews Dispatched / In Work</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
            {inProgressCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {resolvedCount} resolved in current shift
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Triage Accuracy</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            97.4%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gemini multi-modal validation
          </div>
        </div>
      </div>

      {/* Middle Grid: Category Breakdown + 7-Day Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Infrastructure Category Distribution
            </h3>
            <span className="text-xs text-slate-500 font-mono">By defect volume</span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryStats).map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const formattedName = cat
                .replace('_', ' ')
                .replace(/\b\w/g, l => l.toUpperCase());

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formattedName}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Inflow vs Resolution Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                7-Day Inflow & Resolution Velocity
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  Reported
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  Repaired
                </span>
              </div>
            </div>

            {/* SVG Bar Chart */}
            <div className="h-44 w-full pt-4">
              <svg viewBox="0 0 420 140" className="w-full h-full">
                {/* Horizontal grid lines */}
                <line x1="20" y1="20" x2="400" y2="20" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
                <line x1="20" y1="60" x2="400" y2="60" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
                <line x1="20" y1="100" x2="400" y2="100" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />

                {weeklyTrends.map((d, i) => {
                  const x = 35 + i * 54;
                  const repHeight = (d.reported / 30) * 80;
                  const resHeight = (d.resolved / 30) * 80;

                  return (
                    <g key={d.day}>
                      {/* Reported bar */}
                      <rect
                        x={x}
                        y={100 - repHeight}
                        width="14"
                        height={repHeight}
                        rx="3"
                        fill="#f59e0b"
                      />
                      {/* Resolved bar */}
                      <rect
                        x={x + 16}
                        y={100 - resHeight}
                        width="14"
                        height={resHeight}
                        rx="3"
                        fill="#10b981"
                      />
                      {/* Day label */}
                      <text
                        x={x + 15}
                        y="120"
                        fill="#94a3b8"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {d.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Net Municipal Deficit: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">-6 incidents</strong> (Resolving faster than intake)</span>
            <span>Avg MTTR: <strong className="text-slate-900 dark:text-white font-mono">3.4 hrs</strong></span>
          </div>
        </div>
      </div>

      {/* Sector Load Matrix Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Municipal Sector Operations Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-2.5 font-semibold">Sector Division</th>
                <th className="pb-2.5 font-semibold">Active Defect Load</th>
                <th className="pb-2.5 font-semibold">Critical L5 Hazards</th>
                <th className="pb-2.5 font-semibold">Crews Engaged</th>
                <th className="pb-2.5 font-semibold">SLA Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {Object.entries(sectorStats).map(([sector, data]) => {
                const slaHealth = data.critical > 1 ? 'Needs Reinforcement' : 'On Schedule';
                return (
                  <tr key={sector} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{sector}</span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300">
                      {data.total} defects
                    </td>
                    <td className="py-2.5">
                      {data.critical > 0 ? (
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {data.critical} critical
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      {data.inProgress > 0 ? `${data.inProgress} active units` : 'Standby'}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-medium ${
                          data.critical > 1
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {slaHealth}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
