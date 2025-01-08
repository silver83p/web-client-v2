function renderSendView() {
  const root = document.getElementById("root");
  const wallet = state.getState().wallet;

  root.innerHTML = `
    <header class="send-header">
      <button class="back-button-x" onclick="showWalletView()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h1>Send</h1>
    </header>

    <div class="send-form">
      <div class="input-group">
        <label>Asset</label>
        <div class="input-wrapper">
          <input type="text" class="input" id="asset-input" value="${wallet.assets[0]?.symbol}" readonly>
          <button class="input-icon" onclick="toggleAssetDropdown()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="input-group">
        <label>From Address</label>
        <div class="input-wrapper">
          <input type="text" class="input" id="address-input" value="${wallet.assets?.[0]?.addresses?.[0]?.address || ""}" readonly>
          <button class="input-icon" onclick="toggleAddressDropdown()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="input-group">
        <label>To Address</label>
        <div class="input-wrapper">
          <input type="text" class="input" placeholder="Enter recipient address">
          <button class="input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="input-group">
        <label>Amount</label>
        <div class="input-wrapper">
          <input type="number" class="input" placeholder="0.00">
        </div>
        <div style="color: hsl(var(--gray-500)); font-size: 0.875rem; margin-top: 0.5rem;">
          Available: <span id="available-balance">${wallet.assets[0]?.balance}</span> <span id="asset-symbol">${wallet.assets[0]?.symbol}</span>
        </div>
      </div>

      <div class="input-group">
        <label>Memo (Optional)</label>
        <div class="input-wrapper">
          <input type="text" class="input" placeholder="Add a note">
        </div>
      </div>

      <button class="action-button primary" onclick="handleSend()" style="width: 100%; margin-top: 2rem;">
        Send
      </button>
    </div>
  `;
}

const toggleAssetDropdown = () => {
  const wallet = state.getState().wallet;
  console.log(wallet);
  const assets = wallet.assets.map((asset) => ({
    label: asset.symbol,
    value: asset.symbol,
    balance: asset.balance,
  }));
  console.log(assets);
  const input = document.getElementById("asset-input");
  createDropdown(input, assets, (selected) => {
    document.getElementById("available-balance").textContent = selected.balance;
    document.getElementById("asset-symbol").textContent = selected.value;
    document.getElementById("address-input").value = wallet.assets.find((asset) => asset.symbol === selected.value).addresses[0].address;
  });
};

const toggleAddressDropdown = () => {
  const wallet = state.getState().wallet;
  const asset = wallet.assets.find((asset) => asset.symbol === document.getElementById("asset-input").value);
  console.log(asset);
  const addresses = asset.addresses.map((address) => ({
    label: address.address,
    value: address.balance,
  }));
  console.log(addresses);
  const input = document.getElementById("address-input");
  createDropdown(input, addresses, () => {
    // Handle address selection
    console.log("Selected address:", input.value);
  });
};

const showWalletView = () => {
  state.navigate("wallet");
};   
