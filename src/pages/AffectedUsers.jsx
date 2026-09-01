import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { cn, SeverityBadge } from '../components/common/Badges';
import { Users, Shield, AlertTriangle, X } from 'lucide-react';

function VictimRiskPanel({ user, onClose }) {
  const riskFactors = [
    { label: 'Threat Severity', value: 90, color: 'red' },
    { label: 'Target Exposure', value: 95, color: 'orange' },
    { label: 'Business Impact', value: user.businessImpact === 'Critical' ? 100 : user.businessImpact === 'High' ? 75 : 40, color: 'amber' },
    { label: 'Overall Risk', value: user.overallRisk, color: user.overallRisk >= 90 ? 'red' : 'orange' }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">VICTIM RISK ASSESSMENT</h3>
        <p className="text-sm text-slate-400 mb-4">{user.name} — {user.role}, {user.department}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {riskFactors.map(factor => (
            <div key={factor.label} className={cn("p-4 rounded-lg border text-center", `border-${factor.color}-500/20 bg-${factor.color}-500/5`)}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{factor.label}</p>
              <p className={`text-3xl font-bold mt-1 text-${factor.color}-400`}>{factor.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            The same phishing email can have different risk depending on the employee's <strong className="text-white">role</strong>, <strong className="text-white">privileges</strong>, <strong className="text-white">system access</strong>, and <strong className="text-white">business impact</strong>.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="text-red-400 font-semibold">Threat</span>×
            <span className="text-orange-400 font-semibold">Exposure</span>×
            <span className="text-amber-400 font-semibold">Business Impact</span>=
            <span className="text-white font-bold text-sm">{user.overallRisk}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AffectedUsers() {
  const { users } = useAppState();
  const [selectedUser, setSelectedUser] = useState(null);

  const riskColor = (level) => {
    const map = { Critical: 'text-red-400', High: 'text-orange-400', Medium: 'text-amber-400', Low: 'text-emerald-400' };
    return map[level] || 'text-slate-400';
  };

  const statusColor = (status) => {
    return status === 'At Risk' 
      ? 'bg-red-500/10 text-red-400 border-red-500/30' 
      : 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="space-y-6">
      {selectedUser && <VictimRiskPanel user={selectedUser} onClose={() => setSelectedUser(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="h-7 w-7 text-blue-400" />
          AFFECTED USERS
        </h1>
        <p className="text-sm text-slate-400 mt-1">Users impacted by the current phishing threats.</p>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Role</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Exposure</th>
                <th className="px-4 py-3 text-left">Interaction</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Credential Risk</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Business Impact</th>
                <th className="px-4 py-3 text-left">Overall Risk</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <span className="text-xs font-bold text-slate-400">{user.name.split(' ').map(n=>n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300">{user.department}</td>
                  <td className="px-4 py-4 text-sm text-slate-400 hidden md:table-cell">{user.role}</td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className={cn("text-xs font-medium", riskColor(user.exposure))}>{user.exposure}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{user.interaction}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={cn("text-xs font-medium", riskColor(user.credentialRisk))}>{user.credentialRisk}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className={cn("text-xs font-medium", riskColor(user.businessImpact))}>{user.businessImpact}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "text-sm font-bold",
                      user.overallRisk >= 90 ? "text-red-400" : user.overallRisk >= 70 ? "text-orange-400" : "text-amber-400"
                    )}>{user.overallRisk}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", statusColor(user.status))}>{user.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View Risk
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
