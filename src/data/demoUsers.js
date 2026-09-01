export const demoUsers = [
  {
    id: "U-001",
    name: "John Carter",
    department: "Finance",
    role: "Finance Manager",
    exposure: "High",
    interaction: "Clicked URL",
    credentialRisk: "High",
    businessImpact: "Critical",
    overallRisk: 96,
    status: "At Risk",
    email: "finance.manager@company.com"
  },
  {
    id: "U-002",
    name: "Sarah Williams",
    department: "IT",
    role: "IT Administrator",
    exposure: "High",
    interaction: "Downloaded attachment",
    credentialRisk: "Critical",
    businessImpact: "Critical",
    overallRisk: 99,
    status: "At Risk",
    email: "it.admin@company.com"
  },
  {
    id: "U-003",
    name: "David Lee",
    department: "Marketing",
    role: "Marketing Intern",
    exposure: "Low",
    interaction: "Opened email",
    credentialRisk: "Low",
    businessImpact: "Low",
    overallRisk: 58,
    status: "Monitored",
    email: "marketing.intern@company.com"
  }
];

export const getUsers = () => [...demoUsers];
export const getUserById = (id) => demoUsers.find(u => u.id === id);
