import React, { useEffect } from 'react';
import { PushNotification } from '../types/infrastructure';
import { AlertTriangle, CheckCircle, Info, X, ExternalLink } from 'lucide-react';

interface NotificationToastProps {
  notification: PushNotification | null;
  onDismiss: () => void;
  onSelectIncident: (incidentId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onSelectIncident,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isCritical = notification.severity === 'critical';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-slideUp">
      <div
        className={`p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all ${
          isCritical
            ? 'bg-rose-950/95 border-rose-700 text-rose-100 ring-2 ring-rose-500/50'
            : notification.severity === 'success'
            ? 'bg-emerald-950/95 border-emerald-700 text-emerald-100'
            : 'bg-slate-900/95 border-slate-700 text-slate-100'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            {isCritical ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            ) : notification.severity === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {notification.title}
              </div>
              <div className="text-xs mt-1 text-slate-200 line-clamp-2">
                {notification.message}
              </div>
              {notification.incidentId && (
                <button
                  onClick={() => {
                    onSelectIncident(notification.incidentId!);
                    onDismiss();
                  }}
                  className="mt-2 text-[11px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 hover:underline"
                >
                  <span>Open Work Order Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
