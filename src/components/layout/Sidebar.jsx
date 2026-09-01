import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  AlertOctagon, 
  Target, 
  Activity, 
  Users, 
  FileText, 
  Search,
  Network,
  Clock,
  ShieldAlert,
  Settings, 
  LogOut 
} from 'lucide-react';
import { cn } from '../common/Badges';

const navGroups = [
  {
    title: "Overview",
    items: [
      { name: 'SOC Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: "Investigate",
    items: [
      { name: 'Incidents', path: '/incidents', icon: AlertOctagon },
      { name: 'IOC Investigation', path: '/iocs', icon: Search },
      { name: 'Threat Hunting', path: '/threat-hunting', icon: Activity },
      { name: 'Campaigns', path: '/campaigns', icon: Target }
    ]
  },
  {
    title: "Analyze",
    items: [
      { name: 'Attack Graph', path: '/attack-graph', icon: Network },
      { name: 'Incident Timeline', path: '/timeline', icon: Clock },
      { name: 'Affected Users', path: '/users', icon: Users }
    ]
  },
  {
    title: "Response",
    items: [
      { name: 'Response Center', path: '/response', icon: ShieldAlert }
    ]
  },
  {
    title: "Reports",
    items: [
      { name: 'Incident Reports', path: '/reports', icon: FileText }
    ]
  }
];

export function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#0f172a] border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static text-slate-300",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-center h-16 border-b border-slate-800 bg-[#0b1121]">
        <Shield className="w-8 h-8 text-blue-500 mr-2" />
        <span className="text-xl font-bold tracking-wider text-white">PHISH<span className="text-blue-500">SHIELD</span></span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <nav className="space-y-6 px-3">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) => cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive 
                          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-[#0b1121]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="text-sm font-bold text-slate-300">AM</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Alex Morgan</p>
            <p className="text-xs text-slate-500">SOC Analyst • Tier 1</p>
          </div>
        </div>
        
        <div className="flex items-center text-xs font-medium text-emerald-500 mb-2 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          SOC STATUS: Operational
        </div>
      </div>
    </aside>
  );
}
