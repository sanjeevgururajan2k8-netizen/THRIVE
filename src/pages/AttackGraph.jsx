import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '../components/common/Badges';
import { Network, User, Globe, Mail, Link, AlertTriangle, Lock, ShieldAlert, X } from 'lucide-react';

const nodeDetails = {
  attacker: { title: 'ATTACKER', subtitle: 'Unknown Threat Actor', risk: 99, info: 'Origin of phishing campaign targeting corporate employees.' },
  domain: { title: 'paypa1-login.com', subtitle: 'Lookalike Domain', risk: 97, info: 'Registered 2026-08-10. Mimics paypal.com using character substitution.', relatedEmails: 98, relatedUsers: 19, campaigns: 2, status: 'BLOCKED' },
  email: { title: 'Phishing Email', subtitle: 'Urgent Payroll Verification Required', risk: 99, info: 'Credential theft email impersonating PayPal Security.' },
  employee: { title: 'John Carter', subtitle: 'Finance Manager', risk: 96, info: 'High-value target. Clicked malicious URL.' },
  url: { title: 'paypa1-login.com/harvest', subtitle: 'Malicious URL', risk: 97, info: 'Credential harvesting page designed to steal PayPal login credentials.' },
  credential_page: { title: 'Credential Page', subtitle: 'Fake Login Portal', risk: 99, info: 'HTML clone of PayPal login page with credential exfiltration script.' },
  theft: { title: 'Credential Theft', subtitle: 'Attack Objective', risk: 99, info: 'Stolen credentials may enable account takeover and financial fraud.' },
  takeover: { title: 'Account Takeover', subtitle: 'Possible Outcome', risk: 95, info: 'If credentials are valid, attacker gains full account access.' }
};

const iconMap = {
  attacker: ShieldAlert,
  domain: Globe,
  email: Mail,
  employee: User,
  url: Link,
  credential_page: Lock,
  theft: AlertTriangle,
  takeover: AlertTriangle
};

const colorMap = {
  attacker: '#ef4444',
  domain: '#f97316',
  email: '#eab308',
  employee: '#3b82f6',
  url: '#f97316',
  credential_page: '#ef4444',
  theft: '#ef4444',
  takeover: '#dc2626'
};

function CustomNode({ data }) {
  const Icon = iconMap[data.nodeType] || AlertTriangle;
  const color = colorMap[data.nodeType] || '#64748b';

  return (
    <div
      onClick={data.onClick}
      className="cursor-pointer px-4 py-3 rounded-xl border-2 bg-[#0f172a] min-w-[160px] text-center transition-all hover:shadow-lg hover:shadow-black/30"
      style={{ borderColor: color + '40' }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex flex-col items-center gap-1">
        <div className="h-8 w-8 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: color + '20' }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <p className="text-xs font-bold text-white">{data.label}</p>
        <p className="text-[10px] text-slate-500">{data.sublabel}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

export default function AttackGraphPage() {
  const [selectedNode, setSelectedNode] = useState(null);

  const initialNodes = useMemo(() => [
    { id: 'attacker', position: { x: 300, y: 0 }, type: 'custom', data: { label: 'ATTACKER', sublabel: 'Threat Actor', nodeType: 'attacker', onClick: () => setSelectedNode('attacker') } },
    { id: 'domain', position: { x: 300, y: 120 }, type: 'custom', data: { label: 'paypa1-login.com', sublabel: 'Lookalike Domain', nodeType: 'domain', onClick: () => setSelectedNode('domain') } },
    { id: 'email', position: { x: 300, y: 240 }, type: 'custom', data: { label: 'Phishing Email', sublabel: 'Credential Theft', nodeType: 'email', onClick: () => setSelectedNode('email') } },
    { id: 'employee', position: { x: 120, y: 360 }, type: 'custom', data: { label: 'John Carter', sublabel: 'Finance Manager', nodeType: 'employee', onClick: () => setSelectedNode('employee') } },
    { id: 'url', position: { x: 480, y: 360 }, type: 'custom', data: { label: 'Malicious URL', sublabel: '/harvest', nodeType: 'url', onClick: () => setSelectedNode('url') } },
    { id: 'credential_page', position: { x: 300, y: 480 }, type: 'custom', data: { label: 'Credential Page', sublabel: 'Fake Login', nodeType: 'credential_page', onClick: () => setSelectedNode('credential_page') } },
    { id: 'theft', position: { x: 300, y: 600 }, type: 'custom', data: { label: 'Credential Theft', sublabel: 'Attack Objective', nodeType: 'theft', onClick: () => setSelectedNode('theft') } },
    { id: 'takeover', position: { x: 300, y: 720 }, type: 'custom', data: { label: 'Account Takeover', sublabel: 'Possible Outcome', nodeType: 'takeover', onClick: () => setSelectedNode('takeover') } }
  ], []);

  const initialEdges = useMemo(() => [
    { id: 'e1', source: 'attacker', target: 'domain', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e2', source: 'domain', target: 'email', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
    { id: 'e3', source: 'email', target: 'employee', animated: true, style: { stroke: '#eab308', strokeWidth: 2 } },
    { id: 'e4', source: 'email', target: 'url', animated: true, style: { stroke: '#eab308', strokeWidth: 2 } },
    { id: 'e5', source: 'employee', target: 'credential_page', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
    { id: 'e6', source: 'url', target: 'credential_page', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
    { id: 'e7', source: 'credential_page', target: 'theft', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    { id: 'e8', source: 'theft', target: 'takeover', animated: true, style: { stroke: '#dc2626', strokeWidth: 2 } }
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const detail = selectedNode ? nodeDetails[selectedNode] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Network className="h-7 w-7 text-blue-400" />
          ATTACK GRAPH
        </h1>
        <p className="text-sm text-slate-400 mt-1">Visual representation of the attack chain and entity relationships.</p>
      </div>

      <div className="relative bg-[#0b1121] border border-slate-800 rounded-xl overflow-hidden" style={{ height: '650px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: '#0b1121' }}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls
            style={{ 
              background: '#0f172a', 
              border: '1px solid #1e293b', 
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column'
            }}
          />
        </ReactFlow>

        {/* Side Panel */}
        {detail && (
          <div className="absolute top-4 right-4 w-80 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-5 z-10">
            <button onClick={() => setSelectedNode(null)} className="absolute top-3 right-3 text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              {(() => { const Icon = iconMap[selectedNode]; return <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colorMap[selectedNode] + '20' }}><Icon className="h-5 w-5" style={{ color: colorMap[selectedNode] }} /></div>; })()}
              <div>
                <p className="text-sm font-bold text-white">{detail.title}</p>
                <p className="text-xs text-slate-500">{detail.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Risk Score</p>
                <p className="text-xl font-bold text-red-400">{detail.risk}<span className="text-xs text-slate-500 font-normal">/100</span></p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Description</p>
                <p className="text-xs text-slate-300">{detail.info}</p>
              </div>
              {detail.relatedEmails && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/50 rounded p-2 text-center">
                    <p className="text-lg font-bold text-blue-400">{detail.relatedEmails}</p>
                    <p className="text-[10px] text-slate-500">Emails</p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-2 text-center">
                    <p className="text-lg font-bold text-cyan-400">{detail.relatedUsers}</p>
                    <p className="text-[10px] text-slate-500">Users</p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-2 text-center">
                    <p className="text-lg font-bold text-purple-400">{detail.campaigns}</p>
                    <p className="text-[10px] text-slate-500">Campaigns</p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-2 text-center">
                    <p className="text-sm font-bold text-emerald-400">{detail.status}</p>
                    <p className="text-[10px] text-slate-500">Status</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
