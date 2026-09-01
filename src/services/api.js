import axios from 'axios';
import { mockStats, mockIncidents, mockCampaigns, mockIOCs, mockUsers, mockReports } from '../data/mockData';

const MOCK_DELAY = 500;
const USE_MOCK = true; // Toggle to false to use real API

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Stats
  getDashboardStats: async () => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockStats };
    }
    return apiClient.get('/dashboard/stats');
  },

  // Incidents
  getIncidents: async () => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockIncidents };
    }
    return apiClient.get('/incidents');
  },
  getIncident: async (id) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockIncidents.find((inc) => inc.id === id) };
    }
    return apiClient.get(`/incidents/${id}`);
  },

  // Campaigns
  getCampaigns: async () => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockCampaigns };
    }
    return apiClient.get('/campaigns');
  },
  getCampaign: async (id) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockCampaigns.find((camp) => camp.id === id) };
    }
    return apiClient.get(`/campaigns/${id}`);
  },

  // IOCs
  getIOCs: async () => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockIOCs };
    }
    return apiClient.get('/iocs');
  },
  getIOC: async (id) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockIOCs.find((ioc) => ioc.id === id) };
    }
    return apiClient.get(`/iocs/${id}`);
  },

  // Users
  getUsers: async () => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockUsers };
    }
    return apiClient.get('/users');
  },
  getUser: async (id) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockUsers.find((usr) => usr.id === id) };
    }
    return apiClient.get(`/users/${id}`);
  },

  // Reports
  getReports: async () => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockReports };
    }
    return apiClient.get('/reports');
  },
  getReport: async (id) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockReports.find((rep) => rep.id === id) };
    }
    return apiClient.get(`/reports/${id}`);
  },

  // Actions
  threatHunt: async (query) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { data: mockIOCs.filter(ioc => ioc.value.includes(query)) };
    }
    return apiClient.post('/threat-hunt', { query });
  },
  quarantineIncident: async (id) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { success: true };
    }
    return apiClient.post('/actions/quarantine', { id });
  },
  blockURL: async (url) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { success: true };
    }
    return apiClient.post('/actions/block-url', { url });
  },
  blockDomain: async (domain) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { success: true };
    }
    return apiClient.post('/actions/block-domain', { domain });
  },
  escalateIncident: async (id) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { success: true };
    }
    return apiClient.post('/actions/escalate', { id });
  },
};
