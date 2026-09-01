import React, { createContext, useContext, useState, useCallback } from 'react';
import { initialIncidents } from '../data/demoIncidents';
import { demoIOCs } from '../data/demoIOCs';
import { demoUsers } from '../data/demoUsers';
import { demoCampaigns } from '../data/demoCampaigns';
import { demoTimeline } from '../data/demoTimeline';

const AppContext = createContext(null);

export function useAppState() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [iocs, setIOCs] = useState(demoIOCs);
  const [users] = useState(demoUsers);
  const [campaigns] = useState(demoCampaigns);
  const [timeline] = useState(demoTimeline);
  const [actionLog, setActionLog] = useState([]);

  const updateIncidentStatus = useCallback((id, newStatus) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status: newStatus } : inc
    ));
    setActionLog(prev => [...prev, { 
      action: `Incident ${id} status changed to ${newStatus}`, 
      time: new Date().toLocaleTimeString(), 
      type: 'incident' 
    }]);
  }, []);

  const blockDomain = useCallback((domain) => {
    setIOCs(prev => prev.map(ioc => 
      ioc.value === domain ? { ...ioc, status: 'BLOCKED' } : ioc
    ));
    setActionLog(prev => [...prev, { 
      action: `Domain ${domain} blocked`, 
      time: new Date().toLocaleTimeString(), 
      type: 'domain' 
    }]);
  }, []);

  const getStats = useCallback(() => {
    const critical = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
    const high = incidents.filter(i => i.severity === 'High' && i.status !== 'Resolved').length;
    return {
      criticalIncidents: 31,
      highRiskIncidents: 84,
      activeCampaigns: 7,
      affectedUsers: 86,
      compromisedAccounts: 4,
      newIOCs: 143,
      // Live counts for demo
      activeCritical: critical,
      activeHigh: high
    };
  }, [incidents]);

  return (
    <AppContext.Provider value={{
      incidents,
      iocs,
      users,
      campaigns,
      timeline,
      actionLog,
      updateIncidentStatus,
      blockDomain,
      getStats
    }}>
      {children}
    </AppContext.Provider>
  );
}
