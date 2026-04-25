import { dashboardData } from './data/dashboard-data.js';
import { initTabs } from './controllers/tabs-controller.js';
import { mountDashboard } from './render/dashboard-mount.js';

const initDashboard = () => {
  mountDashboard(dashboardData);
  initTabs();
};

document.addEventListener('DOMContentLoaded', initDashboard);
