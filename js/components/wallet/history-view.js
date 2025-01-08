function renderHistory() {
  const root = document.getElementById("root");
  const wallet = state.getState().wallet;

  root.innerHTML = `
    <header class="send-header">
      <button class="back-button" onclick="state.navigate('wallet')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1>Transaction History</h1>
    </header>

    <div class="history-filters">
      <div class="input-group">
        <label>Asset</label>
        <div class="input-wrapper">
          <input type="text" class="input" id="history-asset" value="${
            wallet.assets[0]?.symbol
          }" readonly>
          <button class="input-icon" onclick="toggleHistoryAsset()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="input-group">
        <label>Address</label>
        <div class="input-wrapper">
          <input type="text" class="input" id="history-address" value="${
            wallet.assets?.[0]?.addresses?.[0]?.address || ""
          }" readonly>
          <button class="input-icon" onclick="toggleHistoryAddress()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="transaction-list">
      ${showTransactionHistory(wallet.assets?.[0]?.addresses?.[0]?.history || [], wallet.assets?.[0]?.symbol)}
    </div>
  `;
}

const toggleHistoryAsset = () => {
  const wallet = state.getState().wallet;
  const input = document.getElementById("history-asset");
  const assets = wallet.assets.map((asset) => ({
    label: asset.symbol,
    value: asset.symbol,
    balance: asset.balance,
  }));
  console.log(assets);
  createDropdown(input, assets, (selected) => {
    // Refresh transaction history when asset changes
    const addressWallet = wallet.assets.find((asset) => asset.symbol === selected.value).addresses[0];
    document.getElementById("history-address").value = addressWallet.address;
    document.querySelector(".transaction-list").innerHTML =
      showTransactionHistory(addressWallet.history, selected.value);
  });
};

const toggleHistoryAddress = () => {
  const wallet = state.getState().wallet;
  const asset = wallet.assets.find((asset) => asset.symbol === document.getElementById("history-asset").value);
  console.log(asset);
  const addresses = asset.addresses.map((address) => ({
    label: address.address,
    value: address.address,
  }));
  console.log(addresses);
  const input = document.getElementById("history-address");
  createDropdown(input, addresses, (selected) => {
    // Refresh transaction history when address changes
    const addressWallet = asset.addresses.find((address) => address.address === selected.value);
    console.log(asset.addresses);
    console.log(addressWallet);
    document.getElementById("history-address").value = addressWallet.address;
    document.querySelector(".transaction-list").innerHTML = showTransactionHistory(addressWallet.history, asset.symbol);
  });
};

const showTransactionHistory = (transactions, symbol) => {
  return transactions.map(tx => `
    <div class="transaction-item ${tx.sign === 1 ? 'coin-sent' : 'coin-received'}">
      <div class="transaction-icon">
        ${tx.sign === 1 ? '↑' : '↓'}
      </div>
      <div class="transaction-details">
        <div class="transaction-type">
          ${tx.sign === 1 ? 'Sent' : 'Received'}
        </div>
        <div class="transaction-address">${tx.address}</div>
        ${tx.memo ? `<div class="transaction-memo">${tx.memo}</div>` : ''}
      </div>
      <div class="transaction-amount">
        <div class="amount">${tx.sign === 1 ? '-' : '+'}${tx.amount} ${symbol}</div>
        <div class="date">${new Date(tx.timestamp).toLocaleDateString()}</div>
      </div>
    </div>
  `).join('');
}
