import { bannerText, kpis } from './kpis.js';
import { bleedingScore, smartAlerts } from './alerts.js';
import { demographics, ageGroups, jordanHeatmap, countries, countriesWarning } from './audience.js';
import { campaigns } from './campaigns.js';
import { contentPerformance } from './content.js';
import { actionPlan } from './action-plan.js';

export const dashboardData = {
  bannerText,
  kpis,
  bleedingScore,
  smartAlerts,
  audience: {
    demographics,
    ageGroups,
    jordanHeatmap,
    countries,
    countriesWarning
  },
  campaigns,
  contentPerformance,
  actionPlan
};
