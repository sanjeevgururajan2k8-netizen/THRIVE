export const initialIncidents = [
  {
    id: "INC-1042",
    severity: "Critical",
    subject: "Urgent Payroll Verification Required",
    sender: "payroll-security@company-verify.com",
    target: "Finance Manager",
    attackType: "Credential Theft",
    risk: 99,
    status: "Active",
    time: "09:02 AM",
    date: "2026-09-01",
    verdict: "PHISHING",
    confidence: 97,
    campaignId: "PAYPAL-CAMP-021"
  },
  {
    id: "INC-1038",
    severity: "Critical",
    subject: "CEO — Immediate Payment Required",
    sender: "ceo-office@company-payments.com",
    target: "Accounts Manager",
    attackType: "BEC",
    risk: 97,
    status: "Investigating",
    time: "08:45 AM",
    date: "2026-09-01",
    verdict: "PHISHING",
    confidence: 92,
    campaignId: "CEO-FRAUD-004"
  },
  {
    id: "INC-1035",
    severity: "High",
    subject: "Microsoft 365 Password Expiration",
    sender: "security@m1crosoft-login.com",
    target: "IT Administrator",
    attackType: "Credential Theft",
    risk: 94,
    status: "Active",
    time: "08:15 AM",
    date: "2026-09-01",
    verdict: "PHISHING",
    confidence: 95,
    campaignId: "MICROSOFT-CAMP-014"
  },
  {
    id: "INC-1029",
    severity: "High",
    subject: "Invoice Payment Update",
    sender: "billing@vendor-secure.com",
    target: "Finance Executive",
    attackType: "Invoice Fraud",
    risk: 91,
    status: "Investigating",
    time: "07:30 AM",
    date: "2026-09-01",
    verdict: "PHISHING",
    confidence: 88,
    campaignId: "INVOICE-CAMP-007"
  }
];

let incidentsStore = [...initialIncidents];

export const getIncidents = () => [...incidentsStore];

export const getIncidentById = (id) => incidentsStore.find(inc => inc.id === id);

export const updateIncidentStatus = (id, newStatus) => {
  incidentsStore = incidentsStore.map(inc => 
    inc.id === id ? { ...inc, status: newStatus } : inc
  );
  return getIncidentById(id);
};
