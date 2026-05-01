import { escapeHtml } from '../utils/html.js';

const renderCard = ({ title, value, description }) => `
  <article class="compare-card">
    <div class="subnote">${escapeHtml(title)}</div>
    <p class="big-number">${escapeHtml(value)}</p>
    <p style="margin:0">${escapeHtml(description)}</p>
  </article>
`;

export const renderContentPerformance = ({ reels, textPosts }) => `${renderCard(reels)}${renderCard(textPosts)}`;
