// Initialize state management
const state = new State();
const utils = new Utils();

// Wait for DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", () => {
  // Initialize navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      state.navigate(item.getAttribute("data-page"));
    });
  });

  // Initial render
  state.render();
});