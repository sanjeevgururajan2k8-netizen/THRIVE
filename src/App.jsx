import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import EmailInvestigation from './pages/EmailInvestigation';

// Temporary placeholders for missing pages
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <h2 className="text-2xl font-semibold text-muted-foreground">{title} Page - Coming Soon</h2>
  </div>
);

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">PHISH<span className="text-blue-500">SHIELD</span></h1>
        <p className="text-center text-muted-foreground mb-8">Security Operations Center</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full p-2 bg-background border border-border rounded-md" value="analyst@phishshield.com" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" className="w-full p-2 bg-background border border-border rounded-md" value="********" readOnly />
          </div>
          <a href="/dashboard" className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md font-medium transition-colors">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/email-investigation" element={<EmailInvestigation />} />
          <Route path="/soc" element={<Placeholder title="SOC Overview" />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<Placeholder title="Incident Details" />} />
          <Route path="/campaigns" element={<Placeholder title="Campaigns" />} />
          <Route path="/campaigns/:id" element={<Placeholder title="Campaign Details" />} />
          <Route path="/iocs" element={<Placeholder title="IOC Investigation" />} />
          <Route path="/iocs/:id" element={<Placeholder title="IOC Details" />} />
          <Route path="/users" element={<Placeholder title="Users" />} />
          <Route path="/users/:id" element={<Placeholder title="User Details" />} />
          <Route path="/reports" element={<Placeholder title="Reports" />} />
          <Route path="/reports/:id" element={<Placeholder title="Report Details" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
