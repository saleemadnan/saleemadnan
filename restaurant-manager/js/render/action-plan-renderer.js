import { escapeHtml } from '../utils/html.js';

export const renderActionPlan = (phases) =>
  phases
    .map(
      ({ phase, tasks }) => `
      <article class="phase">
        <h4>${escapeHtml(phase)}</h4>
        <ul>
          ${tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}
        </ul>
      </article>`
    )
    .join('');
