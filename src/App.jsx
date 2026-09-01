import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/shared/Toast';
import Dashboard from './pages/Dashboard';
import IncidentInvestigation from './pages/IncidentInvestigation';
import IOCInvestigation from './pages/IOCInvestigation';
import ThreatHunting from './pages/ThreatHunting';
import IncidentTimeline from './pages/IncidentTimeline';
import AttackGraph from './pages/AttackGraph';
import AffectedUsers from './pages/AffectedUsers';
import Campaigns from './pages/CampaignsPage';
import ResponseCenter from './pages/ResponseCenter';
import Reports from './pages/Reports';

// Keep existing pages that other members built
import EmailInvestigation from './pages/EmailInvestigation';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/incidents" element={<Dashboard />} />
              <Route path="/incidents/:id" element={<IncidentInvestigation />} />
              <Route path="/iocs" element={<IOCInvestigation />} />
              <Route path="/threat-hunting" element={<ThreatHunting />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/attack-graph" element={<AttackGraph />} />
              <Route path="/timeline" element={<IncidentTimeline />} />
              <Route path="/users" element={<AffectedUsers />} />
              <Route path="/response" element={<ResponseCenter />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/email-investigation" element={<EmailInvestigation />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
