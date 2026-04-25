import { renderKpiCards } from './kpi-renderer.js';
import { renderAlerts } from './alerts-renderer.js';
import { renderAudienceInsights } from './audience-renderer.js';
import { renderCampaignRows } from './campaigns-renderer.js';
import { renderContentPerformance } from './content-renderer.js';
import { renderActionPlan } from './action-plan-renderer.js';

export const mountDashboard = (data) => {
  document.getElementById('critical-banner').textContent = data.bannerText;
  document.getElementById('kpi-topbar').innerHTML = renderKpiCards(data.kpis);
  document.getElementById('bleeding-score').textContent = data.bleedingScore;
  document.getElementById('smart-alerts').innerHTML = renderAlerts(data.smartAlerts);
  document.getElementById('audience-insights-grid').innerHTML = renderAudienceInsights(data.audience);
  document.getElementById('campaign-table-body').innerHTML = renderCampaignRows(data.campaigns);
  document.getElementById('content-compare').innerHTML = renderContentPerformance(data.contentPerformance);
  document.getElementById('action-phases').innerHTML = renderActionPlan(data.actionPlan);
};
