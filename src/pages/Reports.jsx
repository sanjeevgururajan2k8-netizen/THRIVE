import React, { useState, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { useToast } from '../components/shared/Toast';
import { cn } from '../components/common/Badges';
import { FileText, Download, Printer, CheckCircle, Clock, AlertTriangle, Shield, Users, Target, Activity } from 'lucide-react';

export default function Reports() {
  const { incidents, users, campaigns, timeline, iocs } = useAppState();
  const addToast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const reportRef = useRef(null);

  const incident = incidents[0]; // Primary incident for report

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReport({
        id: `RPT-${Date.now().toString().slice(-6)}`,
        generatedAt: new Date().toLocaleString(),
        incident: {
          id: incident.id,
          date: incident.date,
          severity: incident.severity,
          verdict: incident.verdict,
          riskScore: incident.risk,
          attackType: incident.attackType
        },
        victim: {
          user: users[0].name,
          role: users[0].role,
          privilege: 'High — Financial Systems Access',
          businessImpact: users[0].businessImpact,
          victimRisk: users[0].overallRisk
        },
        threat: {
          sender: 'security@paypa1-login.com',
          domain: 'paypa1-login.com',
          url: 'https://paypa1-login.com/harvest',
          ip: '185.234.72.19',
          attachment: 'None',
          hash: 'N/A'
        },
        campaign: {
          id: campaigns[0].id,
          targets: campaigns[0].targets,
          emails: campaigns[0].emails,
          departments: '6 (Finance, IT, HR, Marketing, Operations, Legal)',
          risk: campaigns[0].risk
        },
        investigation: {
          conversationAnomaly: 'First-time sender with high urgency',
          behavioralAnomaly: 'Credential request via external link',
          emotionalManipulation: 'Urgency: 94%, Fear: 91%, Authority: 87%',
          attackChain: 'Domain Registration → Email Delivery → User Click → Credential Harvest',
          blastRadius: '19 employees across 6 departments',
          userInteraction: 'Clicked URL, visited credential page'
        },
        response: {
          recommended: ['Quarantine Email', 'Block Domain', 'Block URL', 'Notify Users', 'Reset Credentials'],
          containment: ['Email quarantine initiated', 'Domain added to blocklist'],
          monitoring: ['Monitor paypa1-login.com', 'Track user credential activity', 'Watch for lateral movement']
        }
      });
      setIsGenerating(false);
      addToast('Incident report generated successfully.', 'success');
    }, 2000);
  };

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>PhishShield Incident Report - ${report.incident.id}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        h1 { color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 8px; }
        h2 { color: #334155; margin-top: 28px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
        td:first-child { font-weight: 600; width: 40%; background: #f8fafc; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .critical { background: #fef2f2; color: #dc2626; }
        ul { padding-left: 20px; }
        li { margin: 4px 0; font-size: 13px; }
      </style></head><body>
      <div class="header"><h1>🛡️ PHISHSHIELD — Incident Report</h1></div>
      <p><strong>Report ID:</strong> ${report.id} &nbsp; | &nbsp; <strong>Generated:</strong> ${report.generatedAt}</p>
      
      <h2>📋 Incident</h2>
      <table>
        <tr><td>Incident ID</td><td>${report.incident.id}</td></tr>
        <tr><td>Date</td><td>${report.incident.date}</td></tr>
        <tr><td>Severity</td><td><span class="badge critical">${report.incident.severity}</span></td></tr>
        <tr><td>Verdict</td><td>${report.incident.verdict}</td></tr>
        <tr><td>Risk Score</td><td>${report.incident.riskScore}/100</td></tr>
        <tr><td>Attack Type</td><td>${report.incident.attackType}</td></tr>
      </table>

      <h2>👤 Victim</h2>
      <table>
        ${Object.entries(report.victim).map(([k,v]) => `<tr><td>${k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td><td>${v}</td></tr>`).join('')}
      </table>

      <h2>⚠️ Threat</h2>
      <table>
        ${Object.entries(report.threat).map(([k,v]) => `<tr><td>${k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td><td>${v}</td></tr>`).join('')}
      </table>

      <h2>🎯 Campaign</h2>
      <table>
        ${Object.entries(report.campaign).map(([k,v]) => `<tr><td>${k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td><td>${v}</td></tr>`).join('')}
      </table>

      <h2>🔍 Investigation</h2>
      <table>
        ${Object.entries(report.investigation).map(([k,v]) => `<tr><td>${k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td><td>${v}</td></tr>`).join('')}
      </table>

      <h2>🛡️ Response</h2>
      <p><strong>Recommended Actions:</strong></p>
      <ul>${report.response.recommended.map(r => `<li>${r}</li>`).join('')}</ul>
      <p><strong>Containment Actions:</strong></p>
      <ul>${report.response.containment.map(r => `<li>${r}</li>`).join('')}</ul>
      <p><strong>Monitoring Requirements:</strong></p>
      <ul>${report.response.monitoring.map(r => `<li>${r}</li>`).join('')}</ul>

      <hr style="margin-top:40px;border:none;border-top:1px solid #e2e8f0;">
      <p style="text-align:center;color:#94a3b8;font-size:12px;">PhishShield SOC Analysis Report — CONFIDENTIAL</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-7 w-7 text-blue-400" />
          INCIDENT REPORTS
        </h1>
        <p className="text-sm text-slate-400 mt-1">Generate and export professional incident reports.</p>
      </div>

      {!report ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center">
          {isGenerating ? (
            <>
              <div className="h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-lg font-semibold text-white mb-2">Generating Report...</p>
              <p className="text-sm text-slate-500">Compiling incident data, threat intelligence, and response actions</p>
            </>
          ) : (
            <>
              <FileText className="h-16 w-16 text-slate-700 mx-auto mb-6" />
              <p className="text-lg font-semibold text-white mb-2">No reports generated yet</p>
              <p className="text-sm text-slate-500 mb-6">Generate a comprehensive incident report for {incident.id}</p>
              <button
                onClick={generateReport}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                GENERATE INCIDENT REPORT
              </button>
            </>
          )}
        </div>
      ) : (
        <div ref={reportRef} className="space-y-6">
          {/* Report Actions */}
          <div className="flex items-center justify-between bg-[#0f172a] border border-slate-800 rounded-xl p-4">
            <div>
              <p className="text-sm font-semibold text-white">Report {report.id}</p>
              <p className="text-xs text-slate-500">Generated {report.generatedAt}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Download className="h-4 w-4" /> Download Report
              </button>
              <button onClick={generateReport} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors">
                Regenerate
              </button>
            </div>
          </div>

          {/* Report Sections */}
          {[
            { title: 'Incident', icon: AlertTriangle, data: report.incident, color: 'red' },
            { title: 'Victim', icon: Users, data: report.victim, color: 'blue' },
            { title: 'Threat', icon: Shield, data: report.threat, color: 'orange' },
            { title: 'Campaign', icon: Target, data: report.campaign, color: 'purple' },
            { title: 'Investigation', icon: Activity, data: report.investigation, color: 'cyan' }
          ].map(section => (
            <div key={section.title} className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
              <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2", `text-${section.color}-400`)}>
                <section.icon className="h-4 w-4" /> {section.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(section.data).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start py-2 px-3 bg-slate-900/50 rounded-lg">
                    <span className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm text-slate-200 text-right max-w-[60%]">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Response */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" /> Response
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase mb-2">Recommended Actions</p>
                <div className="space-y-1">
                  {report.response.recommended.map(r => (
                    <div key={r} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/50 rounded px-2 py-1.5">
                      <CheckCircle className="h-3 w-3 text-blue-400 flex-shrink-0" /> {r}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase mb-2">Containment Actions</p>
                <div className="space-y-1">
                  {report.response.containment.map(r => (
                    <div key={r} className="flex items-center gap-2 text-xs text-slate-300 bg-emerald-500/5 border border-emerald-500/20 rounded px-2 py-1.5">
                      <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" /> {r}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase mb-2">Monitoring</p>
                <div className="space-y-1">
                  {report.response.monitoring.map(r => (
                    <div key={r} className="flex items-center gap-2 text-xs text-slate-300 bg-amber-500/5 border border-amber-500/20 rounded px-2 py-1.5">
                      <Clock className="h-3 w-3 text-amber-400 flex-shrink-0" /> {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
