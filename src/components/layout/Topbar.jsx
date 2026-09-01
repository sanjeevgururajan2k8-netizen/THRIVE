import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

export function Topbar({ setIsSidebarOpen }) {
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#0b1121] border-b border-slate-800">
      <div className="flex items-center flex-1">
        <button 
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="p-2 -ml-2 mr-2 lg:hidden text-slate-400 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="max-w-2xl w-full relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Global Search (domain, URL, IP, hash, email, incident ID)..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-[#0f172a] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-400 hover:text-white relative bg-slate-800/50 rounded-full border border-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0b1121]"></span>
        </button>
      </div>
    </header>
  );
}
