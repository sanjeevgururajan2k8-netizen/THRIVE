export const demoTimeline = [
  {
    id: "T-01",
    time: "09:02 AM",
    type: "EMAIL DELIVERED",
    description: "Email 'Urgent Payroll Verification Required' delivered to finance.manager@company.com",
    severity: "info"
  },
  {
    id: "T-02",
    time: "09:03 AM",
    type: "THREAT DETECTED",
    description: "PhishShield AI detected lookalike domain and sender impersonation.",
    severity: "warning"
  },
  {
    id: "T-03",
    time: "09:04 AM",
    type: "CAMPAIGN CORRELATION DETECTED",
    description: "Email correlated with active campaign PAYPAL-CAMP-021.",
    severity: "warning"
  },
  {
    id: "T-04",
    time: "09:06 AM",
    type: "USER OPENED EMAIL",
    description: "User John Carter opened the email.",
    severity: "warning"
  },
  {
    id: "T-05",
    time: "09:07 AM",
    type: "USER CLICKED URL",
    description: "User clicked on link pointing to paypa1-login.com",
    severity: "critical"
  },
  {
    id: "T-06",
    time: "09:08 AM",
    type: "CREDENTIAL PAGE DETECTED",
    description: "Destination URL identified as a credential harvesting page.",
    severity: "critical"
  },
  {
    id: "T-07",
    time: "09:09 AM",
    type: "INCIDENT ESCALATED",
    description: "Automated escalation to SOC Tier 1 queue.",
    severity: "high"
  }
];

export const getTimelineForIncident = (incidentId) => [...demoTimeline];
