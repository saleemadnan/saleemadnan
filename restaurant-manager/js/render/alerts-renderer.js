import { escapeHtml } from '../utils/html.js';

export const renderAlerts = (alerts) =>
  alerts
    .map(({ tone, text }) => `<div class="alert ${escapeHtml(tone)}">${escapeHtml(text)}</div>`)
    .join('');
