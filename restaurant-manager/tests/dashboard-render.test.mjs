import assert from 'node:assert/strict';
import { renderKpiCards } from '../js/render/kpi-renderer.js';
import { renderAlerts } from '../js/render/alerts-renderer.js';
import { renderCampaignRows } from '../js/render/campaigns-renderer.js';
import { renderAudienceInsights } from '../js/render/audience-renderer.js';
import { renderContentPerformance } from '../js/render/content-renderer.js';
import { renderActionPlan } from '../js/render/action-plan-renderer.js';
import { extractPercentNumber } from '../js/utils/html.js';

const kpiHtml = renderKpiCards([
  { title: 'Reach', value: '100', trend: '▼ -10%', trendType: 'down', sparkline: '0,0 100,30' }
]);
assert.match(kpiHtml, /Reach/);
assert.match(kpiHtml, /▼ -10%/);

const alertsHtml = renderAlerts([{ tone: 'red', text: 'Alert text' }]);
assert.match(alertsHtml, /alert red/);
assert.match(alertsHtml, /Alert text/);

const campaignHtml = renderCampaignRows([
  { name: 'Camp', status: 'نشط', statusClass: 'active', result: '10', cpr: '$0.1', spent: '$1.0' }
]);
assert.match(campaignHtml, /Camp/);
assert.match(campaignHtml, /status active/);

const audienceHtml = renderAudienceInsights({
  demographics: [{ label: 'ذكور', value: '56.5%' }],
  ageGroups: [{ label: '25-34', value: '20%' }],
  jordanHeatmap: [{ label: 'عمان', value: '62.8%', className: 'h-amman' }],
  countries: [{ label: 'الأردن', value: '89.3%' }],
  countriesWarning: 'تنبيه'
});
assert.match(audienceHtml, /Heatmap - الأردن/);
assert.match(audienceHtml, /56.5%/);

const contentHtml = renderContentPerformance({
  reels: { title: 'Reels', value: '1452', description: 'desc' },
  textPosts: { title: 'Posts', value: '1', description: 'desc2' }
});
assert.match(contentHtml, /1452/);

const actionHtml = renderActionPlan([{ phase: 'P1', tasks: ['a', 'b'] }]);
assert.match(actionHtml, /P1/);
assert.match(actionHtml, /<li>a<\/li>/);

assert.equal(extractPercentNumber('10.7%'), 10.7);

console.log('dashboard renderer modular tests passed');
