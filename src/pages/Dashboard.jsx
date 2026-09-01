import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { RiskScore, SeverityBadge, StatusBadge } from '../components/common/Badges';
import { ShieldAlert, Target, Users, AlertTriangle, Activity, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

const activityData = [
  { time: '00:00', incidents: 4, risk: 40 },
  { time: '04:00', incidents: 7, risk: 45 },
  { time: '08:00', incidents: 25, risk: 85 },
  { time: '12:00', incidents: 31, risk: 94 },
  { time: '16:00', incidents: 18, risk: 70 },
  { time: '20:00', incidents: 9, risk: 50 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [{ data: statsData }, { data: incData }] = await Promise.all([
        api.getDashboardStats(),
        api.getIncidents()
      ]);
      setStats(statsData);
      setIncidents(incData);
    }
    loadData();
  }, []);

  if (!stats) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Overview</h1>
        <p className="text-muted-foreground">Real-time phishing threat intelligence and incident monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Critical Incidents" value={stats.criticalIncidents} icon={ShieldAlert} colorClass="bg-red-500/20 text-red-500" />
        <StatCard title="High-Risk Incidents" value={stats.highRisk} icon={AlertTriangle} colorClass="bg-orange-500/20 text-orange-500" />
        <StatCard title="Active Campaigns" value={stats.activeCampaigns} icon={Target} colorClass="bg-yellow-500/20 text-yellow-500" />
        <StatCard title="Affected Users" value={stats.affectedUsers} icon={Users} colorClass="bg-blue-500/20 text-blue-500" />
        <StatCard title="Compromised Accounts" value={stats.compromisedAccounts} icon={Activity} colorClass="bg-red-500/20 text-red-500" />
        <StatCard title="New IOCs" value={stats.newIOCs} icon={Database} colorClass="bg-purple-500/20 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Threat Activity (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="incidents" stroke="#ef4444" fillOpacity={1} fill="url(#colorIncidents)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.slice(0, 4).map(inc => (
                <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="font-medium text-sm">{inc.target}</p>
                    <p className="text-xs text-muted-foreground">{inc.attackType}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <SeverityBadge severity={inc.severity} />
                    <span className="text-xs font-bold text-red-400">Risk: {inc.riskScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
