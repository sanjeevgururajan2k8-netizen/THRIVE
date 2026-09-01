import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { cn } from '../components/common/Badges';
import { Clock, ChevronDown, ChevronUp, Mail, Shield, Zap, AlertTriangle, Target, Eye, Ban } from 'lucide-react';

const iconMap = {
  'EMAIL DELIVERED': Mail,
  'THREAT DETECTED': Shield,
  'CAMPAIGN CORRELATION DETECTED': Target,
  'USER OPENED EMAIL': Eye,
  'USER CLICKED URL': Zap,
  'CREDENTIAL PAGE DETECTED': AlertTriangle,
  'INCIDENT ESCALATED': AlertTriangle,
  'DOMAIN QUARANTINED': Ban
};

const severityColorMap = {
  info: 'border-blue-500 bg-blue-500',
  warning: 'border-amber-500 bg-amber-500',
  high: 'border-orange-500 bg-orange-500',
  critical: 'border-red-500 bg-red-500'
};

const severityBgMap = {
  info: 'border-blue-500/20 bg-blue-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  high: 'border-orange-500/20 bg-orange-500/5',
  critical: 'border-red-500/20 bg-red-500/5'
};

export default function IncidentTimeline() {
  const { timeline } = useAppState();
  const [expandedEvent, setExpandedEvent] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="h-7 w-7 text-blue-400" />
          INCIDENT TIMELINE
        </h1>
        <p className="text-sm text-slate-400 mt-1">Chronological view of incident events and attack progression.</p>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800" />

          <div className="space-y-1">
            {timeline.map((event, index) => {
              const Icon = iconMap[event.type] || Clock;
              const dotColor = severityColorMap[event.severity] || severityColorMap.info;
              const bgColor = severityBgMap[event.severity] || severityBgMap.info;
              const isExpanded = expandedEvent === event.id;

              return (
                <div key={event.id} className="relative pl-16">
                  {/* Dot */}
                  <div className={cn(
                    "absolute left-4 top-5 h-4 w-4 rounded-full border-2 z-10",
                    dotColor
                  )} />
                  
                  {/* Time label */}
                  <div className="absolute left-0 top-4 text-[10px] font-mono text-slate-500 -translate-x-full pr-4 hidden">
                    {event.time}
                  </div>

                  {/* Event Card */}
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all hover:shadow-lg mb-2",
                      bgColor
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0 mt-0.5",
                          event.severity === 'critical' ? 'text-red-400' 
                          : event.severity === 'high' ? 'text-orange-400'
                          : event.severity === 'warning' ? 'text-amber-400' 
                          : 'text-blue-400'
                        )} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-slate-500">{event.time}</span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold",
                              event.severity === 'critical' ? 'bg-red-500/20 text-red-400'
                              : event.severity === 'high' ? 'bg-orange-500/20 text-orange-400'
                              : event.severity === 'warning' ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                            )}>
                              {event.severity}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white">{event.type}</p>
                          <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800/50 grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-[10px] text-slate-500 uppercase">Event ID</p>
                          <p className="text-xs text-slate-300 font-mono">{event.id}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-[10px] text-slate-500 uppercase">Timestamp</p>
                          <p className="text-xs text-slate-300">{event.time}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2 col-span-2">
                          <p className="text-[10px] text-slate-500 uppercase">Full Description</p>
                          <p className="text-xs text-slate-300 mt-0.5">{event.description}</p>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
