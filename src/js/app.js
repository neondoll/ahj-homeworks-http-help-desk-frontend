import HelpDesk from './help-desk';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#app');

  const helpDesk = new HelpDesk();
  helpDesk.bindToDOM(container);
  helpDesk.drawUI();
});
