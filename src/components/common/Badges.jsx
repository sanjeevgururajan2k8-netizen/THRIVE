import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function SeverityBadge({ severity, className }) {
  const colors = {
    CRITICAL: 'bg-red-500/20 text-red-500 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    LOW: 'bg-green-500/20 text-green-500 border-green-500/30',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', colors[severity] || colors.LOW, className)}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const colors = {
    New: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    Investigating: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    Contained: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    Resolved: 'bg-green-500/20 text-green-500 border-green-500/30',
    Active: 'bg-red-500/20 text-red-500 border-red-500/30',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30', className)}>
      {status}
    </span>
  );
}

export function RiskScore({ score, className }) {
  let colorClass = 'text-green-500';
  if (score >= 90) colorClass = 'text-red-500';
  else if (score >= 70) colorClass = 'text-orange-500';
  else if (score >= 40) colorClass = 'text-yellow-500';

  return (
    <div className={cn('flex items-center gap-2 font-bold', colorClass, className)}>
      <span className="text-2xl">{score}</span>
      <span className="text-xs text-muted-foreground font-normal">/100</span>
    </div>
  );
}
