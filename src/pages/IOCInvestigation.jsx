import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { cn } from '../components/common/Badges';
import { 
  Search, Globe, Link, Server, Mail, Hash, Shield, ExternalLink, 
  Clock, AlertTriangle, Users, Target, Activity 
} from 'lucide-react';

const quickFilters = [
  { label: 'Domain', icon: Globe },
  { label: 'URL', icon: Link },
  { label: 'IP', icon: Server },
  { label: 'Email', icon: Mail },
  { label: 'Hash', icon: Hash }
];

const historicalActivity = [
  { date: '2026-09-01', incident: 'INC-1042', user: 'John Carter', type: 'Credential Theft', risk: 99, status: 'Active' },
  { date: '2026-08-28', incident: 'INC-0981', user: 'Sarah Williams', type: 'Credential Theft', risk: 94, status: 'Resolved' },
  { date: '2026-08-22', incident: 'INC-0923', user: 'Mike Johnson', type: 'Phishing Link', risk: 88, status: 'Resolved' },
  { date: '2026-08-15', incident: 'INC-0867', user: 'Lisa Chen', type: 'Credential Theft', risk: 91, status: 'Resolved' }
];

export default function IOCInvestigation() {
  const { iocs } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Domain');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      const found = iocs.find(ioc => ioc.value.toLowerCase().includes(searchTerm.toLowerCase()));
      setSearchResult(found || {
        value: searchTerm,
        type: activeFilter.toUpperCase(),
        risk: 45,
        status: 'UNKNOWN',
        firstSeen: 'N/A',
        lastSeen: 'N/A',
        relatedEmails: 0,
        relatedUsers: 0,
        relatedCampaigns: 0,
        previousIncidents: 0,
        relatedUrls: 0
      });
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="h-7 w-7 text-blue-400" />
          IOC INVESTIGATION
        </h1>
        <p className="text-sm text-slate-400 mt-1">Search and analyze Indicators of Compromise across your environment.</p>
      </div>

      {/* Search */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search domain, URL, IP, email or file hash..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {quickFilters.map(f => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                activeFilter === f.label
                  ? "bg-blue-600/10 text-blue-400 border-blue-500/30"
                  : "text-slate-400 border-slate-700 hover:border-slate-600"
              )}
            >
              <f.icon className="h-3 w-3" /> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prefill suggestion */}
      {!searchResult && !isSearching && (
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-8 text-center">
          <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">Enter an IOC to investigate</p>
          <button onClick={() => { setSearchTerm('paypa1-login.com'); }} className="text-blue-400 text-sm hover:text-blue-300">
            Try: paypa1-login.com
          </button>
        </div>
      )}

      {/* Results */}
      {searchResult && (
        <div className="space-y-6">
          {/* IOC Overview */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">IOC Overview</h2>
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-6 w-6 text-red-400" />
                  <div>
                    <p className="text-lg font-bold text-white font-mono">{searchResult.value}</p>
                    <p className="text-xs text-slate-500">{searchResult.type}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ['Type', searchResult.type, 'text-blue-400'],
                    ['Risk', `${searchResult.risk}/100`, searchResult.risk >= 90 ? 'text-red-400' : 'text-orange-400'],
                    ['Status', searchResult.status, searchResult.status === 'BLOCKED' ? 'text-emerald-400' : 'text-red-400'],
                    ['First Seen', searchResult.firstSeen, 'text-slate-300'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
                      <p className="text-[10px] text-slate-500 uppercase">{label}</p>
                      <p className={cn("text-sm font-bold mt-1", color)}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Activity */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Related Activity</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Related Emails', value: searchResult.relatedEmails, icon: Mail, color: 'blue' },
                { label: 'Related Users', value: searchResult.relatedUsers, icon: Users, color: 'cyan' },
                { label: 'Related Campaigns', value: searchResult.relatedCampaigns, icon: Target, color: 'purple' },
                { label: 'Previous Incidents', value: searchResult.previousIncidents, icon: AlertTriangle, color: 'orange' },
                { label: 'Related URLs', value: searchResult.relatedUrls, icon: Link, color: 'amber' }
              ].map(item => (
                <div key={item.label} className={cn(
                  "p-4 rounded-lg border text-center",
                  `border-${item.color}-500/20 bg-${item.color}-500/5`
                )}>
                  <item.icon className={`h-5 w-5 text-${item.color}-400 mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Activity Table */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4" /> Historical Activity
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Incident</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Risk</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {historicalActivity.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3 text-sm text-slate-400">{row.date}</td>
                      <td className="px-4 py-3 text-sm font-mono text-blue-400">{row.incident}</td>
                      <td className="px-4 py-3 text-sm text-slate-200">{row.user}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{row.type}</span></td>
                      <td className="px-4 py-3 text-sm font-bold text-red-400">{row.risk}</td>
                      <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded-full border", row.status === 'Active' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
