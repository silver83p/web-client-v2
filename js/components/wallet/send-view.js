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
          <input type="text" class="input" id="asset-input" value="${wallet.assets[0]?.name} (${wallet.assets[0]?.symbol})" readonly>
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
          <input type="text" class="input" placeholder="Enter recipient address" oninput="validateUser(this.value)" id="username-input">
          <button class="input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>
        <span class="input-status" id="valid-username-status"></span>
      </div>

      <div class="input-group">
        <label>Amount</label>
        <div class="input-wrapper">
          <input type="number" class="input" placeholder="0.00" id="amount-input" oninput="validateAmount(this.value)">
        </div>
        <div style="color: hsl(var(--gray-500)); font-size: 0.875rem; margin-top: 0.5rem;">
          Available: <span id="available-balance">${wallet.assets[0]?.balance}</span> <span id="asset-symbol">${wallet.assets[0]?.symbol}</span>
        </div>
        <span class="input-status" id="amount-status"></span>
      </div>

      <div class="input-group">
        <label>Memo (Optional)</label>
        <div class="input-wrapper">
          <input type="text" class="input" placeholder="Add a note">
        </div>
      </div>

      <button class="action-button primary" id="send-coin" onclick="handleSend()" style="width: 100%; margin-top: 2rem;" disabled>
        Send
      </button>
    </div>
    ${renderDialog()}
  `;
}

const renderDialog = () => {
  return `
    <!-- Transaction Dialog -->
    <div class="dialog hidden" id="transaction-dialog">
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="dialog-status">
            <div class="spinner"></div>
            <span class="dialog-message">Sending...</span>
          </div>
          <button class="dialog-close hidden" onclick="closeDialog()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
};

const toggleAssetDropdown = () => {
  const wallet = state.getState().wallet;
  console.log(wallet);
  const assets = wallet.assets.map((asset) => ({
    label: `${asset.name} (${asset.symbol})`,
    value: asset.symbol,
    balance: asset.balance,
  }));
  console.log(assets);
  const input = document.getElementById("asset-input");
  createDropdown(input, assets, (selected) => {
    document.getElementById("available-balance").textContent = selected.balance;
    document.getElementById("asset-symbol").textContent = selected.value;
    document.getElementById("address-input").value = wallet.assets.find(
      (asset) => asset.symbol === selected.value
    ).addresses[0].address;
  });
};

const toggleAddressDropdown = () => {
  const wallet = state.getState().wallet;
  const asset = wallet.assets.find(
    (asset) => asset.symbol === document.getElementById("asset-input").value
  );
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

let validateUserTimeout;
let isValidatingUser = false;
let validUser = false;
let validAmount = false;
const validateUser = async (username) => {
  validUser = false;
  const status = document.getElementById("valid-username-status");
  const sendButton = document.getElementById("send-coin");

  // Always disable button while typing or checking
  sendButton.disabled = true;

  // Clear previous timeout
  if (validateUserTimeout) {
    clearTimeout(validateUserTimeout);
  }

  // Reset status if username is empty
  if (!username) {
    status.textContent = "Username is required";
    status.className = "input-status error";
    return;
  }

  // Validate username format
  if (username.length < 3) {
    status.textContent = "Username must be at least 3 characters long";
    status.className = "input-status error";
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    status.textContent =
      "Username can only contain letters, numbers, and underscores";
    status.className = "input-status error";
    return;
  }

  // Show checking status
  status.textContent = "Checking username...";
  status.className = "input-status";
  isValidatingUser = true;

  // Add delay before checking to prevent too many requests
  validateUserTimeout = setTimeout(async () => {
    try {
      // Simulate API call with random response
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // const taken = Math.random() > 0.3; // 70% chance username is available

      const { isUserFound, address, error } =
        await AppActions.verifyUser(username);
      if (error) {
        status.textContent = error;
        status.className = "input-status error";
        return;
      }
      if (isUserFound) {
        status.textContent = "User Found";
        status.className = "input-status success";
        validUser = true
        if (validUser && validAmount) sendButton.disabled = false; // Only enable button when both username and amount are valid
      } else {
        status.textContent = "User not found";
        status.className = "input-status error";
      }
    } catch (error) {
      status.textContent = "Error checking username";
      status.className = "input-status error";
      console.error("Error checking username:", error);
    } finally {
      isValidatingUser = false;
    }
  }, 500);
};

// Validate amount
const validateAmount = (amount) => {
  validAmount = false
  const status = document.getElementById("amount-status");
  const sendButton = document.getElementById("send-coin");
  sendButton.disabled = true;
  if (amount <= 0) {
    status.textContent = "Amount must be greater than 0";
    status.className = "input-status error";
  } else {
    status.textContent = "";
    status.className = "input-status";
    validAmount = true
    if (validUser && validAmount) sendButton.disabled = false; // Only enable button when both username and amount are valid
  }
};

const showWalletView = () => {
  state.navigate("wallet");
};

// Transaction Dialog
const showDialog = function () {
  const dialog = document.getElementById("transaction-dialog");
  const closeButton = dialog.querySelector(".dialog-close");
  dialog.classList.remove("hidden");
  closeButton.classList.add("hidden");
  const dialogMessage = document.querySelector(".dialog-message");
  dialogMessage.textContent = "Sending...";
  const spinner = document.querySelector(".spinner");
  spinner.style.display = "block";
};

const updateDialog = function (message, showClose = false) {
  const dialogMessage = document.querySelector(".dialog-message");
  const spinner = document.querySelector(".spinner");
  const closeButton = document.querySelector(".dialog-close");

  dialogMessage.textContent = message;

  if (showClose) {
    spinner.style.display = "none";
    closeButton.classList.remove("hidden");
  }
};

const closeDialog = function () {
  const dialog = document.getElementById("transaction-dialog");
  dialog.classList.add("hidden");
  AppUtils.updateAccountStateData(state.getState().currentAddress);
};

// Send Transaction
const handleSend = async function () {
  const inputUsername = document.getElementById("username-input").value;
  const inputAmount = document.getElementById("amount-input").value;

  if (!inputUsername || !inputAmount) {
    alert("Please enter a username and an amount!");
    return;
  }

  showDialog();
  // // Simulate transaction
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // updateDialog("Transaction sent successfully!", true);



  try {
    const { address } = await AppActions.verifyUser(inputUsername);
    if (!address) {
      updateDialog("User not found", true);
      return;
    }
    const { success, result, error } = await AppActions.handleTransferTransaction(
      address,
      inputAmount
    );
    console.log("handleSend", success, result, error);
    if (success) {
      updateDialog(result, true);
    } else {
      console.error("Failed to send transaction:", error);
      updateDialog(`Failed to send transaction: ${error}`, true);
    }
  } catch (error) {
    console.error("Error sending transaction:", error);
    updateDialog(`Error sending transaction: ${error}`, true);
  }
};
