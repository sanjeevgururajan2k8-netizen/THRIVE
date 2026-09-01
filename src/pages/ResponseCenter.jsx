import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { useToast } from '../components/shared/Toast';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';
import { cn } from '../components/common/Badges';
import { 
  ShieldAlert, ShieldOff, Ban, Link2Off, Bell, UserCheck, Search, Eye, 
  ArrowUpRight, CheckCircle, AlertTriangle
} from 'lucide-react';

const responseActions = [
  { id: 'quarantine', label: 'Quarantine Email', icon: ShieldOff, color: 'red', description: 'Isolate the malicious email from all recipient inboxes.', severity: 'critical' },
  { id: 'block-domain', label: 'Block Domain', icon: Ban, color: 'red', description: 'Block the malicious domain across all network endpoints.', severity: 'critical' },
  { id: 'block-url', label: 'Block URL', icon: Link2Off, color: 'orange', description: 'Block the specific malicious URL across web proxies.', severity: 'high' },
  { id: 'alert-soc', label: 'Alert SOC', icon: Bell, color: 'orange', description: 'Send an immediate alert to the SOC team for review.', severity: 'high' },
  { id: 'notify-user', label: 'Notify User', icon: UserCheck, color: 'amber', description: 'Send a security notification to the affected user.', severity: 'medium' },
  { id: 'search-historical', label: 'Search Historical Emails', icon: Search, color: 'blue', description: 'Search for similar emails in the historical email logs.', severity: 'medium' },
  { id: 'monitor-ioc', label: 'Monitor IOC', icon: Eye, color: 'blue', description: 'Add the IOC to continuous monitoring watchlist.', severity: 'low' },
  { id: 'escalate', label: 'Escalate Incident', icon: ArrowUpRight, color: 'purple', description: 'Escalate to SOC Tier 2 or incident response team.', severity: 'high' }
];

export default function ResponseCenter() {
  const { incidents, updateIncidentStatus, blockDomain } = useAppState();
  const addToast = useToast();
  const [modal, setModal] = useState({ open: false, title: '', desc: '', action: null, confirmText: '' });
  const [completedActions, setCompletedActions] = useState({});
  const [loading, setLoading] = useState({});

  const activeIncident = incidents.find(i => i.status === 'Active') || incidents[0];

  const executeAction = (action) => {
    setModal({
      open: true,
      title: `${action.label}?`,
      desc: action.description,
      confirmText: action.label,
      action: () => {
        setLoading(prev => ({ ...prev, [action.id]: true }));
        setTimeout(() => {
          setLoading(prev => ({ ...prev, [action.id]: false }));
          setCompletedActions(prev => ({ ...prev, [action.id]: true }));

          if (action.id === 'quarantine') {
            updateIncidentStatus(activeIncident.id, 'Contained');
          }
          if (action.id === 'block-domain') {
            blockDomain('paypa1-login.com');
          }
          addToast(`${action.label} executed successfully.`, 'success');
        }, 800);
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={() => { modal.action?.(); setModal({ ...modal, open: false }); }}
        title={modal.title}
        description={modal.desc}
        confirmText={modal.confirmText}
      />

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-blue-400" />
          RESPONSE CENTER
        </h1>
        <p className="text-sm text-slate-400 mt-1">Take immediate action to contain and remediate threats.</p>
      </div>

      {/* Active Threat Banner */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse mt-1.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">CRITICAL — Incident {activeIncident.id}</p>
            <p className="text-xs text-slate-400 mt-1">{activeIncident.subject}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>Risk: <span className="text-red-400 font-bold">{activeIncident.risk}/100</span></span>
              <span>Status: <span className="text-white">{activeIncident.status}</span></span>
              <span>Type: <span className="text-white">{activeIncident.attackType}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recommended Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {responseActions.map(action => {
            const isCompleted = completedActions[action.id];
            const isLoading = loading[action.id];
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={() => !isCompleted && executeAction(action)}
                disabled={isCompleted || isLoading}
                className={cn(
                  "relative p-5 rounded-xl border text-left transition-all group",
                  isCompleted 
                    ? "border-emerald-500/30 bg-emerald-500/5 cursor-default"
                    : `border-${action.color}-500/20 bg-${action.color}-500/5 hover:bg-${action.color}-500/10 hover:shadow-lg cursor-pointer`
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    isCompleted ? "bg-emerald-500/10" : `bg-${action.color}-500/10`
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : isLoading ? (
                      <div className="h-5 w-5 border-2 border-slate-500/30 border-t-slate-300 rounded-full animate-spin" />
                    ) : (
                      <Icon className={`h-5 w-5 text-${action.color}-400`} />
                    )}
                  </div>
                  {!isCompleted && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold",
                      action.severity === 'critical' ? 'bg-red-500/20 text-red-400'
                      : action.severity === 'high' ? 'bg-orange-500/20 text-orange-400'
                      : action.severity === 'medium' ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                    )}>{action.severity}</span>
                  )}
                </div>
                <p className={cn("text-sm font-semibold mb-1", isCompleted ? "text-emerald-400" : "text-white")}>{action.label}</p>
                <p className="text-xs text-slate-500">{isCompleted ? 'Action completed successfully' : action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Log */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Action Log</h3>
        {Object.keys(completedActions).length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No actions taken yet. Select an action above to begin response.</p>
        ) : (
          <div className="space-y-2">
            {Object.keys(completedActions).map(actionId => {
              const action = responseActions.find(a => a.id === actionId);
              return (
                <div key={actionId} className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-200">{action?.label}</span>
                  <span className="text-xs text-slate-500 ml-auto">{new Date().toLocaleTimeString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
