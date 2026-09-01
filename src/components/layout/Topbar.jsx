import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';

export function Topbar({ setIsSidebarOpen }) {
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
      <div className="flex items-center flex-1">
        <button 
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="p-2 -ml-2 mr-2 lg:hidden text-muted-foreground hover:text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="max-w-md w-full relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input 
            type="text" 
            placeholder="Search domain, URL, IP, hash, email..."
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm font-medium text-green-500 hidden sm:flex">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          System Optimal
        </div>
        
        <button className="p-2 text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-card"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <User className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Analyst</span>
        </div>
      </div>
    </header>
  );
}
