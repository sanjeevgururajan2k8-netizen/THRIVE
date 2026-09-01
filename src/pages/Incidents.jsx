import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Card, CardContent } from '../components/common/Card';
import { SeverityBadge, StatusBadge, RiskScore } from '../components/common/Badges';
import { Search, Filter, ShieldAlert } from 'lucide-react';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data } = await api.getIncidents();
      setIncidents(data);
    }
    load();
  }, []);

  const filtered = incidents.filter(inc => 
    inc.id.toLowerCase().includes(search.toLowerCase()) || 
    inc.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">Manage and investigate security incidents</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search incidents..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-secondary text-sm font-medium">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Incident ID</th>
                  <th className="px-6 py-3 font-medium">Target</th>
                  <th className="px-6 py-3 font-medium">Attack Type</th>
                  <th className="px-6 py-3 font-medium">Severity</th>
                  <th className="px-6 py-3 font-medium">Risk Score</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(inc => (
                  <tr key={inc.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{inc.id}</td>
                    <td className="px-6 py-4">{inc.target}</td>
                    <td className="px-6 py-4">{inc.attackType}</td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="px-6 py-4 font-bold text-red-500">{inc.riskScore}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="text-blue-500 hover:text-blue-400 font-medium"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
