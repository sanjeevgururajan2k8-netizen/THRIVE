import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext';
import { cn, SeverityBadge } from '../components/common/Badges';
import { Target, Globe, Link, Mail, Paperclip, Clock, ChevronRight, X } from 'lucide-react';

const campaignDNA = {
  'PAYPAL-CAMP-021': [
    { category: 'Sender', value: 'security@paypa1-login.com', match: 98 },
    { category: 'Domain', value: 'paypa1-login.com', match: 100 },
    { category: 'URL', value: '/harvest, /verify, /login', match: 95 },
    { category: 'Subject', value: 'Verification / Security Alert', match: 88 },
    { category: 'Content Similarity', value: 'Credential request template', match: 92 },
    { category: 'HTML Structure', value: 'PayPal clone template', match: 96 },
    { category: 'Attachment', value: 'None', match: 0 },
    { category: 'Infrastructure', value: 'Shared hosting, Cloudflare', match: 90 },
    { category: 'Timing', value: 'Weekday mornings (8-10 AM)', match: 85 }
  ]
};

function CampaignDetail({ campaign, onClose }) {
  const dna = campaignDNA[campaign.id] || campaignDNA['PAYPAL-CAMP-021'];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono">{campaign.id}</h3>
            <SeverityBadge severity={campaign.severity.toUpperCase()} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Targets', value: campaign.targets, icon: '🎯' },
            { label: 'Emails', value: campaign.emails, icon: '📧' },
            { label: 'Domains', value: campaign.domains, icon: '🌐' },
            { label: 'URLs', value: campaign.urls, icon: '🔗' },
            { label: 'Attachments', value: campaign.attachments, icon: '📎' },
            { label: 'Campaign Risk', value: campaign.risk, icon: '⚠️' },
            { label: 'First Seen', value: campaign.firstSeen, icon: '📅' },
            { label: 'Last Seen', value: campaign.lastSeen, icon: '📅' }
          ].map(item => (
            <div key={item.label} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">{item.label}</p>
              <p className="text-sm font-bold text-white mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Campaign DNA */}
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Campaign DNA</h4>
        <div className="space-y-2">
          {dna.map(item => (
            <div key={item.category} className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 w-36 flex-shrink-0">{item.category}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-200">{item.value}</span>
                  {item.match > 0 && <span className="text-xs font-bold text-emerald-400">{item.match}%</span>}
                </div>
                {item.match > 0 && (
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${item.match}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const { campaigns } = useAppState();
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  return (
    <div className="space-y-6">
      {selectedCampaign && <CampaignDetail campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="h-7 w-7 text-blue-400" />
          ACTIVE CAMPAIGNS
        </h1>
        <p className="text-sm text-slate-400 mt-1">Tracked phishing campaigns targeting your organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {campaigns.map(campaign => (
          <div
            key={campaign.id}
            onClick={() => setSelectedCampaign(campaign)}
            className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-slate-600 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white font-mono">{campaign.id}</p>
                <SeverityBadge severity={campaign.severity.toUpperCase()} className="mt-1" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="h-3 w-3" /> {campaign.targets} targets
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Globe className="h-3 w-3" /> {campaign.domains} domains
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link className="h-3 w-3" /> {campaign.urls} URLs
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-3 w-3" /> Risk: <span className="text-red-400 font-bold">{campaign.risk}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
