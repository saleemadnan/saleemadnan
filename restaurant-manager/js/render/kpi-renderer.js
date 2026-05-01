import { escapeHtml } from '../utils/html.js';

const sparklineColor = (trendType) => {
  if (trendType === 'up') return '#52d98e';
  if (trendType === 'neutral') return '#93b2ff';
  return '#ff7177';
};

export const renderKpiCards = (kpis) =>
  kpis
    .map(
      ({ title, value, trend, trendType, sparkline }) => `
      <article class="kpi-card">
        <div class="kpi-title">${escapeHtml(title)}</div>
        <div class="kpi-value">${escapeHtml(value)}</div>
        <span class="trend ${escapeHtml(trendType)}">${escapeHtml(trend)}</span>
        <svg class="sparkline" viewBox="0 0 100 30">
          <polyline fill="none" stroke="${sparklineColor(trendType)}" stroke-width="2" points="${escapeHtml(sparkline)}"></polyline>
        </svg>
      </article>`
    )
    .join('');
