import { escapeHtml, extractPercentNumber } from '../utils/html.js';

const renderBarRows = (rows) =>
  rows
    .map(
      ({ label, value, warning }) => `<div class="bar-row">
        <div class="bar-label"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>
        <div class="bar"><span style="width:${extractPercentNumber(value)}%;${warning ? ' background: linear-gradient(90deg,#f5c042,#ffe495);' : ''}"></span></div>
      </div>`
    )
    .join('');

const renderHeatmap = (items) =>
  items
    .map(({ label, value, className }) => `<div class="heat ${escapeHtml(className)}">${escapeHtml(label)} ${escapeHtml(value)}</div>`)
    .join('');

export const renderAudienceInsights = ({ demographics, ageGroups, jordanHeatmap, countries, countriesWarning }) => `
  <article class="mini-panel">
    <h3>التوزيع الديموغرافي</h3>
    ${renderBarRows(demographics)}
    <h3>الفئات العمرية الأعلى</h3>
    ${renderBarRows(ageGroups)}
  </article>

  <article class="mini-panel">
    <h3>Heatmap - الأردن</h3>
    <div class="heatmap">${renderHeatmap(jordanHeatmap)}</div>
    <h3 style="margin-top:0.9rem;">الدول</h3>
    ${renderBarRows(countries)}
    <div class="alert yellow" style="margin-top:0.55rem;">${escapeHtml(countriesWarning)}</div>
  </article>
`;
