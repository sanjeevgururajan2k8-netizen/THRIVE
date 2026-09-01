import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { cn, SeverityBadge, StatusBadge, RiskScore } from '../components/common/Badges';
import { 
  AlertTriangle, TrendingUp, Target, Users, KeyRound, Fingerprint,
  RefreshCw, ChevronRight, Clock, ArrowUpRight, ShieldAlert, Activity
} from 'lucide-react';

const timeFilters = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'];

function StatCard({ label, value, icon: Icon, color, subtext }) {
  const colorMap = {
    red: 'border-red-500/30 bg-red-500/5 text-red-400',
    orange: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400'
  };
  const iconColorMap = {
    red: 'text-red-400 bg-red-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    cyan: 'text-cyan-400 bg-cyan-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    amber: 'text-amber-400 bg-amber-500/10'
  };

  return (
    <div className={cn(
      "relative rounded-xl border p-5 transition-all hover:shadow-lg hover:shadow-black/20",
      colorMap[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", iconColorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { incidents, getStats } = useAppState();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Last 24 Hours');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const stats = getStats();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-blue-400" />
            SOC OVERVIEW
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor, investigate and respond to phishing threats across your organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800/50 rounded-lg border border-slate-700 p-0.5">
            {timeFilters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  activeFilter === f 
                    ? "bg-blue-600 text-white shadow" 
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Critical Incidents" value={stats.criticalIncidents} icon={AlertTriangle} color="red" subtext="+3 today" />
        <StatCard label="High-Risk Incidents" value={stats.highRiskIncidents} icon={TrendingUp} color="orange" subtext="+12 today" />
        <StatCard label="Active Campaigns" value={stats.activeCampaigns} icon={Target} color="purple" subtext="2 new" />
        <StatCard label="Affected Users" value={stats.affectedUsers} icon={Users} color="blue" subtext="6 departments" />
        <StatCard label="Compromised Accounts" value={stats.compromisedAccounts} icon={KeyRound} color="amber" subtext="Requires action" />
        <StatCard label="New IOCs" value={stats.newIOCs} icon={Fingerprint} color="cyan" subtext="Last 24h" />
      </div>

      {/* Threat Level Banner */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <div>
            <p className="text-sm font-semibold text-red-400">ELEVATED THREAT LEVEL</p>
            <p className="text-xs text-slate-500">Active credential theft campaigns targeting Finance and IT departments</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/response')}
          className="text-xs font-medium text-red-400 border border-red-500/30 rounded-lg px-3 py-1.5 hover:bg-red-500/10 transition-colors flex items-center gap-1"
        >
          Response Center <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      {/* Priority Incidents Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">PRIORITY INCIDENTS</h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{incidents.length} active</span>
          </div>
          <button 
            onClick={() => navigate('/incidents')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Severity</th>
                <th className="px-4 py-3 text-left">Incident ID</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Sender</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Target</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Attack Type</th>
                <th className="px-4 py-3 text-left">Risk</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Time</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {incidents.map(inc => (
                <tr 
                  key={inc.id} 
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                  className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <SeverityBadge severity={inc.severity.toUpperCase()} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-mono text-blue-400">{inc.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-200 max-w-[200px] truncate block">{inc.subject}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-xs text-slate-400 font-mono">{inc.sender}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-300">{inc.target}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{inc.attackType}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "text-sm font-bold",
                      inc.risk >= 90 ? "text-red-400" : inc.risk >= 70 ? "text-orange-400" : "text-yellow-400"
                    )}>{inc.risk}</span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {inc.time}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/incidents/${inc.id}`); }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Investigate <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
