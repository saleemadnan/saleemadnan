import { escapeHtml } from '../utils/html.js';

export const renderCampaignRows = (campaigns) =>
  campaigns
    .map(
      ({ name, status, statusClass, result, cpr, cprClass, spent }) => `
      <tr>
        <td>${escapeHtml(name)}</td>
        <td><span class="status ${escapeHtml(statusClass)}">${escapeHtml(status)}</span></td>
        <td>${escapeHtml(result)}</td>
        <td class="${escapeHtml(cprClass ?? '')}">${escapeHtml(cpr)}</td>
        <td>${escapeHtml(spent)}</td>
      </tr>`
    )
    .join('');
