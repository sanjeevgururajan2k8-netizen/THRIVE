export const mockStats = {
  criticalIncidents: 31,
  highRisk: 84,
  activeCampaigns: 7,
  affectedUsers: 86,
  compromisedAccounts: 4,
  newIOCs: 143,
};

export const mockIncidents = [
  {
    id: 'INC-1024',
    date: '2023-10-24T09:02:00Z',
    sender: 'security@paypa1-login.com',
    target: 'Finance Manager',
    attackType: 'Credential Theft',
    riskScore: 94,
    severity: 'CRITICAL',
    status: 'Investigating',
  },
  {
    id: 'INC-1025',
    date: '2023-10-24T09:45:00Z',
    sender: 'it-support@micro-soft-update.com',
    target: 'IT Administrator',
    attackType: 'Business Email Compromise',
    riskScore: 99,
    severity: 'CRITICAL',
    status: 'New',
  },
  {
    id: 'INC-1026',
    date: '2023-10-24T10:15:00Z',
    sender: 'hr@company-benefits-portal.com',
    target: 'HR Manager',
    attackType: 'Credential Theft',
    riskScore: 82,
    severity: 'HIGH',
    status: 'Contained',
  },
  {
    id: 'INC-1027',
    date: '2023-10-24T11:30:00Z',
    sender: 'newsletter@marketing-updates.com',
    target: 'Marketing Intern',
    attackType: 'Spam',
    riskScore: 30,
    severity: 'LOW',
    status: 'Resolved',
  },
];

export const mockCampaigns = [
  {
    id: 'PAYPAL-CAMP-021',
    name: 'PayPal Credential Harvest',
    targets: 98,
    emails: 120,
    risk: 'HIGH',
    status: 'Active',
    firstSeen: '2023-10-23T08:00:00Z',
    lastSeen: '2023-10-24T09:02:00Z',
  },
  {
    id: 'MICROSOFT-CAMP-014',
    name: 'O365 Login Spoofing',
    targets: 43,
    emails: 50,
    risk: 'HIGH',
    status: 'Active',
    firstSeen: '2023-10-20T10:00:00Z',
    lastSeen: '2023-10-24T09:45:00Z',
  },
  {
    id: 'INVOICE-CAMP-007',
    name: 'Fake Invoice Malware',
    targets: 21,
    emails: 21,
    risk: 'MEDIUM',
    status: 'Contained',
    firstSeen: '2023-10-15T14:00:00Z',
    lastSeen: '2023-10-22T11:00:00Z',
  },
];

export const mockIOCs = [
  { id: 'IOC-001', value: 'paypa1-login.com', type: 'Domain', risk: 97, relatedEmails: 98, relatedUsers: 19, relatedCampaigns: 2, previousIncidents: 4, relatedURLs: 3 },
  { id: 'IOC-002', value: '192.168.1.100', type: 'IP', risk: 85, relatedEmails: 50, relatedUsers: 10, relatedCampaigns: 1, previousIncidents: 2, relatedURLs: 1 },
  { id: 'IOC-003', value: 'micro-soft-update.com', type: 'Domain', risk: 95, relatedEmails: 43, relatedUsers: 15, relatedCampaigns: 1, previousIncidents: 3, relatedURLs: 2 },
];

export const mockUsers = [
  { id: 'USR-001', name: 'Arun Kumar', role: 'Finance Manager', department: 'Finance', privilege: 'High', risk: 96, incidents: 3, status: 'Active' },
  { id: 'USR-002', name: 'Priya', role: 'Marketing Intern', department: 'Marketing', privilege: 'Low', risk: 58, incidents: 1, status: 'Active' },
  { id: 'USR-003', name: 'John Doe', role: 'IT Administrator', department: 'IT', privilege: 'Critical', risk: 99, incidents: 5, status: 'Compromised' },
  { id: 'USR-004', name: 'Jane Smith', role: 'CEO', department: 'Executive', privilege: 'Critical', risk: 95, incidents: 2, status: 'Active' },
];

export const mockReports = [
  { id: 'REP-001', incidentId: 'INC-1024', generatedDate: '2023-10-24T10:00:00Z', severity: 'CRITICAL', status: 'Generated' },
  { id: 'REP-002', incidentId: 'INC-1026', generatedDate: '2023-10-24T12:00:00Z', severity: 'HIGH', status: 'Generated' },
];

export const mockTimelineEvents = [
  { time: '09:02', description: 'Email received' },
  { time: '09:03', description: 'Threat detected' },
  { time: '09:04', description: 'Campaign identified' },
  { time: '09:06', description: 'User opened email' },
  { time: '09:07', description: 'URL clicked' },
  { time: '09:08', description: 'Credential page detected' },
  { time: '09:09', description: 'Incident escalated' },
];
