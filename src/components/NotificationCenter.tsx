import React, { useState } from 'react';
import { PushNotification } from '../types/infrastructure';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  Volume2,
  VolumeX,
  Send,
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: PushNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onSelectNotificationIncident: (incidentId: string) => void;
  onSendTestNotification: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onSelectNotificationIncident,
  onSendTestNotification,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Instant Push Alert Center
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
            title={soundEnabled ? 'Mute Chime Alerts' : 'Enable Chime Alerts'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={onSendTestNotification}
          className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
        >
          <Send className="w-3 h-3" />
          <span>Trigger Test Alert</span>
        </button>

        <button
          onClick={onMarkAllAsRead}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          Mark all read
        </button>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No push notifications recorded yet.
          </div>
        ) : (
          notifications.map(notif => {
            const isCritical = notif.severity === 'critical';
            return (
              <div
                key={notif.id}
                onClick={() => notif.incidentId && onSelectNotificationIncident(notif.incidentId)}
                className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  !notif.read
                    ? isCritical
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 shadow-xs'
                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCritical ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : notif.severity === 'success' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span
                      className={
                        isCritical
                          ? 'text-rose-700 dark:text-rose-300'
                          : notif.severity === 'success'
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-900 dark:text-white'
                      }
                    >
                      {notif.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {notif.message}
                </p>
                {notif.incidentId && (
                  <div className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    Jump to {notif.incidentId} →
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
