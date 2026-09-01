export const demoIOCs = [
  {
    id: "IOC-001",
    value: "paypa1-login.com",
    type: "DOMAIN",
    risk: 97,
    status: "BLOCKED",
    firstSeen: "2026-08-12",
    lastSeen: "2026-09-01",
    relatedEmails: 98,
    relatedUsers: 19,
    relatedCampaigns: 2,
    previousIncidents: 4,
    relatedUrls: 3
  },
  {
    id: "IOC-002",
    value: "m1crosoft-login.com",
    type: "DOMAIN",
    risk: 94,
    status: "ACTIVE",
    firstSeen: "2026-08-20",
    lastSeen: "2026-09-01",
    relatedEmails: 43,
    relatedUsers: 12,
    relatedCampaigns: 1,
    previousIncidents: 2,
    relatedUrls: 2
  }
];

export const getIOCs = () => [...demoIOCs];
export const getIOCByValue = (value) => demoIOCs.find(ioc => ioc.value === value);
