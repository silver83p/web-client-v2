function toggleMenu() {
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuContainer = document.querySelector('.menu-container');
  
  if (menuOverlay && menuContainer) {
    menuOverlay.remove();
    menuContainer.remove();
    return;
  }

  const menu = `
    <div class="menu-overlay" onclick="toggleMenu()"></div>
    <div class="menu-container open">
      <div class="menu-header">
        <button class="back-button" onclick="toggleMenu()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1>Menu</h1>
      </div>
      <div class="menu-items">
        <a class="menu-item" onclick="handleMenuNavigation('account')">Account</a>
        <a class="menu-item">Network</a>
        <a class="menu-item">Settings</a>
        <a class="menu-item" onclick="handleMenuNavigation('import')">Import</a>
        <a class="menu-item">Export</a>
        <a class="menu-item danger" onclick="handleSignOut()">Sign Out</a>
      </div>
    </div>
  `;

  document.querySelector('.app-container').insertAdjacentHTML('beforeend', menu);
}

function handleMenuNavigation(page) {
  toggleMenu();
  state.navigate(page);
}