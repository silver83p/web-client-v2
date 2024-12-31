const state = new State();
const utils = new Utils();

// Initialize navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    state.navigate(item.getAttribute('data-page'));
  });
});

// Initial render
state.render();