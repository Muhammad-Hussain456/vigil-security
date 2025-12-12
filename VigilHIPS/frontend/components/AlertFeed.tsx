import React from 'react';
import { Alert, Severity } from '../types.ts';
import { AlertTriangle, Terminal, Cpu, ShieldAlert } from 'lucide-react';

interface AlertFeedProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  selectedAlertId?: string;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onSelectAlert, selectedAlertId }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <ActivityIcon className="w-4 h-4 mr-2 text-primary-500" />
          Live Threat Stream
        </h3>
        <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full border border-primary-200 dark:border-primary-500/20 animate-pulse">
          Live
        </span>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
        {alerts.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">Waiting for telemetry...</div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectAlert(alert)}
            className={`p-3 rounded-xl cursor-pointer transition-all border ${
              selectedAlertId === alert.id
                ? 'bg-primary-50 dark:bg-primary-600/20 border-primary-500 dark:border-primary-500/50'
                : 'bg-white dark:bg-gray-800/50 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center space-x-2">
                 {getSeverityIcon(alert.severity)}
                 <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getSeverityColor(alert.severity)}`}>
                   {alert.severity}
                 </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                {alert.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 truncate">{alert.title}</h4>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
              <span className="flex items-center"><Cpu className="w-3 h-3 mr-1" /> {alert.hostname}</span>
              <span className="flex items-center truncate max-w-[150px]"><Terminal className="w-3 h-3 mr-1" /> {alert.processName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityIcon = ({className}: {className: string}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const getSeverityColor = (sev: Severity) => {
  switch (sev) {
    case Severity.CRITICAL: return 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400';
    case Severity.HIGH: return 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400';
    case Severity.MEDIUM: return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
    default: return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
  }
};

const getSeverityIcon = (sev: Severity) => {
  switch (sev) {
    case Severity.CRITICAL: return <ShieldAlert className="w-4 h-4 text-red-500" />;
    case Severity.HIGH: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    default: return <ActivityIcon className="w-4 h-4 text-blue-500" />;
  }
};