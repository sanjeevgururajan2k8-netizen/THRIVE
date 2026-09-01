import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, AlertOctagon, Target, Activity, Users, FileText, Mail, Settings, LogOut } from 'lucide-react';
import { cn } from '../common/Badges';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Email Investigation', path: '/email-investigation', icon: Mail },
  { name: 'SOC Overview', path: '/soc', icon: Activity },
  { name: 'Incidents', path: '/incidents', icon: AlertOctagon },
  { name: 'Campaigns', path: '/campaigns', icon: Target },
  { name: 'IOC Investigation', path: '/iocs', icon: Shield },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Reports', path: '/reports', icon: FileText },
];

export function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-center h-16 border-b border-border bg-background">
        <Shield className="w-8 h-8 text-blue-500 mr-2" />
        <span className="text-xl font-bold tracking-wider text-foreground">PHISH<span className="text-blue-500">SHIELD</span></span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-blue-500/10 text-blue-500" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </NavLink>
        <button className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
