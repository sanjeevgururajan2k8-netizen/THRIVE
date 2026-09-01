import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { useToast } from '../components/shared/Toast';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';
import { cn, SeverityBadge, StatusBadge } from '../components/common/Badges';
import { 
  ArrowLeft, ShieldOff, Ban, Link2Off, ArrowUpRight, CheckCircle, FileText,
  AlertTriangle, Eye, Fingerprint, Brain, UserX, Mail, Globe, 
  ChevronDown, ChevronUp, Shield, Clock, Lock, Unlock, ExternalLink
} from 'lucide-react';

const evidenceData = [
  {
    id: 'e1',
    title: 'Sender Impersonation',
    icon: UserX,
    severity: 'critical',
    summary: 'Display name resembles PayPal Security but actual sender is different.',
    details: {
      'Display Name': 'PayPal Security',
      'Actual Sender': 'security@paypa1-login.com',
      'Impersonated Entity': 'PayPal, Inc.',
      'Risk Contribution': '+25'
    }
  },
  {
    id: 'e2',
    title: 'Lookalike Domain',
    icon: Globe,
    severity: 'critical',
    summary: 'paypa1-login.com resembles paypal.com.',
    details: {
      'Expected Domain': 'paypal.com',
      'Observed Domain': 'paypa1-login.com',
      'Similarity': '93%',
      'Technique': 'Character substitution (l → 1)',
      'Risk Contribution': '+22'
    }
  },
  {
    id: 'e3',
    title: 'Destination Mismatch',
    icon: Link2Off,
    severity: 'critical',
    summary: 'Visible link differs from actual destination.',
    details: {
      'Displayed URL': 'https://paypal.com/verify',
      'Actual URL': 'https://paypa1-login.com/harvest',
      'Risk Contribution': '+20'
    }
  },
  {
    id: 'e4',
    title: 'Credential Request',
    icon: Lock,
    severity: 'critical',
    summary: 'Email requests password verification.',
    details: {
      'Detected Keywords': 'verify password, confirm identity, update credentials',
      'Credential Fields': 'Email, Password, SSN',
      'Risk Contribution': '+18'
    }
  },
  {
    id: 'e5',
    title: 'Psychological Manipulation',
    icon: Brain,
    severity: 'critical',
    summary: 'High urgency and fear-based language detected.',
    details: {
      'Urgency Score': '94%',
      'Fear Score': '91%',
      'Authority Score': '87%',
      'Risk Contribution': '+10'
    }
  },
  {
    id: 'e6',
    title: 'New Contact',
    icon: UserX,
    severity: 'warning',
    summary: 'No previous interaction with this sender.',
    details: {
      'Previous Emails': '0',
      'First Contact': 'Today',
      'Risk Contribution': '+4'
    }
  }
];

const emailDetails = {
  sender: 'security@paypa1-login.com',
  displayName: 'PayPal Security',
  recipient: 'finance.manager@company.com',
  subject: 'Urgent Payroll Verification Required',
  received: '09:02 AM',
  replyTo: 'verify@paypa1-login.com',
  returnPath: 'mailer@paypa1-login.com',
  spf: 'FAIL',
  dkim: 'FAIL',
  dmarc: 'FAIL'
};

function EvidenceCard({ evidence, isExpanded, onToggle }) {
  const Icon = evidence.icon;
  const severityColor = evidence.severity === 'critical' 
    ? 'border-red-500/30 bg-red-500/5' 
    : 'border-amber-500/30 bg-amber-500/5';
  const dotColor = evidence.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500';

  return (
    <div className={cn("rounded-lg border transition-all", severityColor)}>
      <button onClick={onToggle} className="w-full px-4 py-3 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className={cn("h-2 w-2 rounded-full flex-shrink-0", dotColor)} />
          <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">{evidence.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{evidence.summary}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {Object.entries(evidence.details).map(([key, val]) => (
              <div key={key} className="bg-slate-900/50 rounded px-3 py-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{key}</p>
                <p className={cn(
                  "text-sm font-medium mt-0.5",
                  key === 'Risk Contribution' ? 'text-red-400' : 'text-slate-200'
                )}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IncidentInvestigation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incidents, updateIncidentStatus, blockDomain } = useAppState();
  const addToast = useToast();
  const incident = incidents.find(i => i.id === id);
  
  const [expandedEvidence, setExpandedEvidence] = useState({});
  const [showEmailDetails, setShowEmailDetails] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', desc: '', action: null, confirmText: '' });

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
        <Shield className="h-12 w-12 mb-4 text-slate-600" />
        <p className="text-lg">Incident not found</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const toggleEvidence = (eid) => {
    setExpandedEvidence(prev => ({ ...prev, [eid]: !prev[eid] }));
  };

  const handleQuarantine = () => {
    setModal({
      open: true,
      title: 'Quarantine Email?',
      desc: 'This will isolate the email and prevent it from reaching additional recipients. The email will be moved to quarantine.',
      confirmText: 'Quarantine Email',
      action: () => {
        updateIncidentStatus(incident.id, 'Contained');
        addToast('Email quarantined successfully. Incident status updated to Contained.', 'success');
      }
    });
  };

  const handleBlockDomain = () => {
    setModal({
      open: true,
      title: 'Block domain paypa1-login.com?',
      desc: 'This will prevent future communication with the identified malicious domain across all users in the organization.',
      confirmText: 'Confirm Block',
      action: () => {
        blockDomain('paypa1-login.com');
        addToast('Domain paypa1-login.com blocked successfully.', 'success');
      }
    });
  };

  const handleBlockURL = () => {
    addToast('Malicious URL blocked across all endpoints.', 'success');
  };

  const handleEscalate = () => {
    updateIncidentStatus(incident.id, 'Investigating');
    addToast('Incident escalated to SOC Tier 2.', 'warning');
  };

  const handleResolve = () => {
    setModal({
      open: true,
      title: 'Mark as Resolved?',
      desc: 'This will close the incident and mark all associated threats as contained.',
      confirmText: 'Mark Resolved',
      action: () => {
        updateIncidentStatus(incident.id, 'Resolved');
        addToast('Incident marked as resolved.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={() => { modal.action?.(); setModal({ ...modal, open: false }); }}
        title={modal.title}
        description={modal.desc}
        confirmText={modal.confirmText}
      />

      {/* Back nav */}
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Incident Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <SeverityBadge severity={incident.severity.toUpperCase()} />
              <span className="text-sm font-mono text-slate-500">INCIDENT {incident.id}</span>
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-xl font-bold text-white">{incident.subject}</h1>
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div>
                <span className="text-slate-500">Attack Type:</span>{' '}
                <span className="text-slate-200 font-medium">{incident.attackType}</span>
              </div>
              <div>
                <span className="text-slate-500">Campaign:</span>{' '}
                <span className="text-blue-400 font-mono text-xs">{incident.campaignId}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="h-3.5 w-3.5" /> First Detected: {incident.time}
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#1e293b" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke={incident.risk >= 90 ? '#ef4444' : '#f97316'} strokeWidth="6" 
                    strokeDasharray={`${(incident.risk / 100) * 201} 201`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">{incident.risk}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">RISK SCORE</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">{incident.confidence}%</p>
              <p className="text-[10px] text-slate-500 mt-1">CONFIDENCE</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button onClick={handleQuarantine} className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-red-600/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/20 transition-colors">
            <ShieldOff className="h-3.5 w-3.5" /> Quarantine Email
          </button>
          <button onClick={handleBlockDomain} className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-orange-600/10 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-600/20 transition-colors">
            <Ban className="h-3.5 w-3.5" /> Block Domain
          </button>
          <button onClick={handleBlockURL} className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-amber-600/10 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-600/20 transition-colors">
            <Link2Off className="h-3.5 w-3.5" /> Block URL
          </button>
          <button onClick={handleEscalate} className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-purple-600/10 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-600/20 transition-colors">
            <ArrowUpRight className="h-3.5 w-3.5" /> Escalate
          </button>
          <button onClick={handleResolve} className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/20 transition-colors">
            <CheckCircle className="h-3.5 w-3.5" /> Mark Resolved
          </button>
          <button onClick={() => navigate('/reports')} className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/20 transition-colors">
            <FileText className="h-3.5 w-3.5" /> Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Verdict Summary */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Incident Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Verdict</p>
              <p className="text-lg font-bold text-red-400 mt-1">{incident.verdict}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{incident.confidence}%</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Attack Type</p>
              <p className="text-sm font-bold text-white mt-1">{incident.attackType}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Campaign</p>
              <p className="text-xs font-mono text-blue-400 mt-2">{incident.campaignId}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">First Detected</p>
              <p className="text-sm font-medium text-slate-200 mt-1">{incident.time}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Status</p>
              <div className="mt-1"><StatusBadge status={incident.status} /></div>
            </div>
          </div>
        </div>

        {/* Email Info */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
          <button onClick={() => setShowEmailDetails(!showEmailDetails)} className="w-full flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Information
            </h2>
            {showEmailDetails ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>
          
          <div className="space-y-3">
            {[
              ['Sender', emailDetails.sender, true],
              ['Display Name', emailDetails.displayName],
              ['Recipient', emailDetails.recipient],
              ['Subject', emailDetails.subject],
            ].map(([label, value, danger]) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-800/50">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={cn("text-sm font-mono", danger ? "text-red-400" : "text-slate-200")}>{value}</span>
              </div>
            ))}
          </div>

          {showEmailDetails && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              {[
                ['Received', emailDetails.received],
                ['Reply-To', emailDetails.replyTo],
                ['Return-Path', emailDetails.returnPath],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-800/50">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-sm font-mono text-slate-300">{value}</span>
                </div>
              ))}
              
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Authentication Results</p>
                <div className="flex gap-2">
                  {['SPF', 'DKIM', 'DMARC'].map(check => (
                    <span key={check} className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs font-mono text-red-400">
                      <Unlock className="h-3 w-3" /> {check}: FAIL
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Threat Evidence */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Fingerprint className="h-5 w-5 text-red-400" />
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Threat Evidence</h2>
          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">{evidenceData.length} indicators</span>
        </div>
        <div className="space-y-2">
          {evidenceData.map(ev => (
            <EvidenceCard
              key={ev.id}
              evidence={ev}
              isExpanded={expandedEvidence[ev.id]}
              onToggle={() => toggleEvidence(ev.id)}
            />
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'IOC Investigation', path: '/iocs', icon: Fingerprint, color: 'blue' },
          { label: 'Attack Graph', path: '/attack-graph', icon: Eye, color: 'purple' },
          { label: 'Timeline', path: '/timeline', icon: Clock, color: 'cyan' },
          { label: 'Affected Users', path: '/users', icon: AlertTriangle, color: 'orange' },
        ].map(item => (
          <button 
            key={item.label}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-lg",
              `border-${item.color}-500/20 bg-${item.color}-500/5 hover:bg-${item.color}-500/10`
            )}
          >
            <item.icon className={`h-5 w-5 text-${item.color}-400`} />
            <span className="text-sm font-medium text-slate-200">{item.label}</span>
            <ChevronDown className="h-4 w-4 text-slate-600 ml-auto -rotate-90" />
          </button>
        ))}
      </div>
    </div>
  );
}
