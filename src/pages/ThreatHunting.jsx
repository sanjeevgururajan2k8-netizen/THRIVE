import React, { useState } from 'react';
import { cn } from '../components/common/Badges';
import { Search, Activity, Mail, Users, Target, Link, Paperclip, AlertTriangle, Zap } from 'lucide-react';

const categories = [
  { id: 'emails', label: 'Historical Emails', icon: Mail, checked: true },
  { id: 'users', label: 'Users', icon: Users, checked: true },
  { id: 'campaigns', label: 'Campaigns', icon: Target, checked: true },
  { id: 'urls', label: 'URLs', icon: Link, checked: true },
  { id: 'attachments', label: 'Attachments', icon: Paperclip, checked: true },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle, checked: true },
  { id: 'activity', label: 'Account Activity', icon: Activity, checked: true }
];

const huntResults = {
  emails: { count: 47, label: 'Historical Emails', icon: Mail, color: 'blue', details: 'Found across 3 months of email logs' },
  users: { count: 19, label: 'Affected Users', icon: Users, color: 'cyan', details: 'Across 6 departments' },
  clicks: { count: 3, label: 'Users Clicked', icon: Zap, color: 'orange', details: 'Redirected to credential harvesting page' },
  credentials: { count: 1, label: 'Credential Submission', icon: AlertTriangle, color: 'red', details: 'John Carter (Finance Manager)' },
  incidents: { count: 4, label: 'Related Incidents', icon: AlertTriangle, color: 'amber', details: 'INC-1042, INC-0981, INC-0923, INC-0867' },
  campaigns: { count: 2, label: 'Campaigns', icon: Target, color: 'purple', details: 'PAYPAL-CAMP-021, PAYPAL-CAMP-018' }
};

export default function ThreatHunting() {
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedCategories, setCheckedCategories] = useState(
    Object.fromEntries(categories.map(c => [c.id, c.checked]))
  );
  const [isHunting, setIsHunting] = useState(false);
  const [results, setResults] = useState(null);

  const toggleCategory = (id) => {
    setCheckedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const runHunt = () => {
    if (!searchTerm.trim()) return;
    setIsHunting(true);
    setResults(null);
    setTimeout(() => {
      setIsHunting(false);
      setResults(huntResults);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="h-7 w-7 text-blue-400" />
          THREAT HUNTING
        </h1>
        <p className="text-sm text-slate-400 mt-1">Search for IOCs and threats across your entire environment.</p>
      </div>

      {/* Search Panel */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runHunt()}
              placeholder="Enter IOC or threat indicator..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <label key={cat.id} className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs",
              checkedCategories[cat.id]
                ? "bg-blue-600/10 text-blue-400 border-blue-500/30"
                : "text-slate-500 border-slate-700 hover:border-slate-600"
            )}>
              <input
                type="checkbox"
                checked={checkedCategories[cat.id]}
                onChange={() => toggleCategory(cat.id)}
                className="hidden"
              />
              <div className={cn(
                "h-3.5 w-3.5 rounded border flex items-center justify-center",
                checkedCategories[cat.id] ? "bg-blue-600 border-blue-500" : "border-slate-600"
              )}>
                {checkedCategories[cat.id] && <span className="text-white text-[10px]">✓</span>}
              </div>
              <cat.icon className="h-3 w-3" />
              {cat.label}
            </label>
          ))}
        </div>

        <button
          onClick={runHunt}
          disabled={isHunting || !searchTerm.trim()}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isHunting ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Hunting...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4" />
              RUN HUNT
            </>
          )}
        </button>

        {!results && !isHunting && (
          <button onClick={() => setSearchTerm('paypa1-login.com')} className="text-blue-400 text-sm hover:text-blue-300">
            Try: paypa1-login.com
          </button>
        )}
      </div>

      {/* Loading State */}
      {isHunting && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center">
          <div className="h-12 w-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Hunting for threats...</p>
          <p className="text-xs text-slate-500 mt-1">Searching across historical data, email logs, and threat intelligence</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Hunt complete — threats found for <span className="font-mono font-bold">{searchTerm}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(results).map((item, i) => (
              <div key={i} className={cn(
                "p-5 rounded-xl border transition-all hover:shadow-lg cursor-pointer",
                `border-${item.color}-500/20 bg-${item.color}-500/5 hover:bg-${item.color}-500/10`
              )}>
                <div className="flex items-start justify-between mb-3">
                  <item.icon className={`h-5 w-5 text-${item.color}-400`} />
                  <span className={`text-3xl font-bold text-${item.color}-400`}>{item.count}</span>
                </div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-1">{item.details}</p>
              </div>
            ))}
          </div>

          {/* Blast Radius */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Blast Radius</h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'Malicious Domain', value: '1', color: 'red' },
                { label: 'Matching Emails', value: '47', color: 'orange' },
                { label: 'Employees', value: '19', color: 'amber' },
                { label: 'Departments', value: '6', color: 'yellow' },
                { label: 'Clicked Link', value: '7', color: 'orange' },
                { label: 'Downloaded', value: '3', color: 'red' },
                { label: 'Submitted Credentials', value: '1', color: 'red' }
              ].map((stage, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="text-slate-600 text-lg hidden sm:block">→</div>}
                  <div className={cn(
                    "px-4 py-3 rounded-lg border text-center min-w-[120px]",
                    `border-${stage.color}-500/20 bg-${stage.color}-500/5`
                  )}>
                    <p className={`text-xl font-bold text-${stage.color}-400`}>{stage.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{stage.label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <p className="text-center text-sm text-slate-400 mt-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <strong className="text-white">19 employees</strong> potentially affected across <strong className="text-white">6 departments</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
