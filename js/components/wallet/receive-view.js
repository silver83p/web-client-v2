function renderReceive() {
  const root = document.getElementById("root");

  const wallet = state.getState().wallet;

  // const assets = [
  //   { label: 'Liberdus (LIB)', value: 'LIB', address: '0x482740e51aad88F6F4ce6aB8827279cfFb9ae2f' },
  //   { label: 'Bitcoin (BTC)', value: 'BTC', address: '0xe663cE5FCF7655eCDBcFD7a9dC30577' },
  //   { label: 'Ethereum (ETH)', value: 'ETH', address: '0x3f2D1B85af155229AcD7B52360114858' }
  // ];

  root.innerHTML = `
    <header class="send-header">
      <button class="back-button" onclick="state.navigate('wallet')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1>Receive</h1>
    </header>

    <div class="send-form">
      <div class="input-group">
        <label>Asset</label>
        <div class="input-wrapper">
          <input type="text" class="input" id="asset-input" value="${
            wallet.assets[0]?.symbol
          }" readonly>
          <button class="input-icon" onclick="toggleReceiveAsset()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="input-group">
        <label>Your Address</label>
        <div class="input-wrapper">
          <input type="text" class="input" id="address-display" value="${
            wallet.assets?.[0]?.addresses?.[0]?.address || ""
          }" readonly>
          <button class="input-icon" onclick="toggleReceiveAddress()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <!--
          <button class="info-icon" onclick="copyToClipboard(document.getElementById('address-display').value)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          -->
        </div>
      </div>



      <div style="text-align: center; margin-top: 2rem;">
        <img id="qr-code" 
             src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${
               wallet.assets?.[0]?.addresses?.[0]?.address || ""
             }" 
             alt="QR Code" 
             style="width: 200px; height: 200px;">
      </div>
    </div>
  `;
}

const toggleReceiveAsset = () => {
  const wallet = state.getState().wallet;
  console.log(wallet);
  const assets = wallet.assets.map((asset) => ({
    label: asset.symbol,
    value: asset.symbol,
  }));
  console.log(assets);
  const input = document.getElementById("asset-input");
  createDropdown(input, assets, (selected) => {
    document.getElementById("asset-input").value = selected.label;
    const address = wallet.assets.find(
      (asset) => asset.symbol === selected.value
    ).addresses[0].address;
    document.getElementById("address-display").value = address;
    document.getElementById(
      "qr-code"
    ).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;
  });
};

const toggleReceiveAddress = () => {
  const wallet = state.getState().wallet;
  console.log(document.getElementById("asset-input").value);
  const asset = wallet.assets.find(
    (asset) => asset.symbol === document.getElementById("asset-input").value
  );
  const addresses = asset.addresses.map((address) => ({
    label: address.address,
    value: address.address,
  }));
  console.log(addresses);
  const input = document.getElementById("address-display");
  createDropdown(input, addresses, () => {
    // Handle address selection
    console.log("Selected address:", input.value);
    document.getElementById(
      "qr-code"
    ).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${input.value}`;
  });
};
