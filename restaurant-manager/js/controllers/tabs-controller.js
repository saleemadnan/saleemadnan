export const initTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      panes.forEach((pane) => pane.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.tab)?.classList.add('active');
    });
  });
};
