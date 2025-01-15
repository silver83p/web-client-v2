function renderWallet() {
  const root = document.getElementById("root");
  const wallet = state.getState().wallet;
  

  root.innerHTML = `
    <header class="header">
      <div class="flex-between">
      <h1>Wallet</h1>
      <button class="menu-button" onclick="toggleMenu()">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
    </header>
    <div class="balance-info">
      <div class="total-balance-label">Total Balance</div>
      <div class="total-balance">${wallet.balance}</div>
    </div>

    <div class="wallet-actions">
      <a class="action-item" onclick="state.navigate('send')">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <span>Send</span>
      </a>
      <a class="action-item" onclick="state.navigate('receive')">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Receive</span>
      </a>
      <a class="action-item" onclick="state.navigate('history')">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span>History</span>
      </a>
    </div>

    <div class="assets-section">
      <h2 class="assets-title">Assets</h2>
      ${wallet.assets.map(asset => `
        <div class="asset-item">
          <div class="asset-icon">${asset.symbol.charAt(0)}</div>
          <div class="asset-details">
            <div class="asset-name">${asset.name}</div>
            <div class="asset-symbol">${asset.symbol}</div>
          </div>
          <div class="asset-balance">${asset.balance}</div>
        </div>
        `).join('')}
    </div>
  `;
}
