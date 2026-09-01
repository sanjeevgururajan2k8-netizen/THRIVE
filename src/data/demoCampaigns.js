export const demoCampaigns = [
  {
    id: "PAYPAL-CAMP-021",
    targets: 98,
    domains: 2,
    urls: 3,
    severity: "Critical",
    firstSeen: "2026-08-12",
    lastSeen: "2026-09-01",
    emails: 154,
    attachments: 0,
    risk: 98
  },
  {
    id: "MICROSOFT-CAMP-014",
    targets: 43,
    domains: 1,
    urls: 2,
    severity: "High",
    firstSeen: "2026-08-20",
    lastSeen: "2026-09-01",
    emails: 89,
    attachments: 1,
    risk: 94
  },
  {
    id: "INVOICE-CAMP-007",
    targets: 21,
    domains: 3,
    urls: 4,
    severity: "High",
    firstSeen: "2026-08-25",
    lastSeen: "2026-09-01",
    emails: 45,
    attachments: 3,
    risk: 91
  }
];

export const getCampaigns = () => [...demoCampaigns];
export const getCampaignById = (id) => demoCampaigns.find(c => c.id === id);
