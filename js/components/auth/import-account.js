function renderImportAccount() {
  const root = document.getElementById("root");

  root.innerHTML = `
      <div class="import-account-page">
      <header class="send-header">
        <button class="back-button" onclick="state.navigate('auth')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1>Import Account</h1>
      </header>
        
        <img src="./public/icon-512x512.png" class="auth-logo" alt="Liberdus logo">


        <div class="seed-phrase-box">
        
        <p class="auth-description">
          Enter your 12-word seed phrase to recover your account.
        </p>
        
        <div class="sk-input-container">
          <textarea 
            class="sk-input"  
            placeholder="Enter your seed phrase"
            rows="4"
          ></textarea>
          <button class="qr-scanner-button" onclick="handleScanQR()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="8" y1="8" x2="16" y2="16" />
              <line x1="8" y1="16" x2="16" y2="8" />
            </svg>
          </button>
        </div>
  
        <button class="action-button primary" onclick="importPrivateKey()">
          Import
        </button>
        </div>
        ${renderUsernameInput("Register a username for your account.")}
  
        <p class="auth-terms">
          By using this service, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    `;

  const usernameInputBox = document.querySelector(".auth-form");
  usernameInputBox.classList.add("hidden");
}

function handleScanQR() {
  // QR scanning functionality would be implemented here
  console.log("QR scanner clicked");
}

async function importPrivateKey() {
  const seedPhrase = document.querySelector(".sk-input").value;
  console.log("Importing account with seed phrase:", seedPhrase);
  const { success, error, newAccount } =
    await AppActions.handleImportAccount(seedPhrase);

  console.log("importPrivateKey", success, error, newAccount);

  if (!success) {
    console.log("importPrivateKey error", error);
    // alert(error);
  }
  if (!newAccount) state.authenticate();
  else {
    // Show username input box
    const usernameInputBox = document.querySelector(".auth-form");
    console.log(usernameInputBox);
    usernameInputBox.classList.remove("hidden");
    console.log(usernameInputBox);

    // Hide seed input box
    const seedInputBox = document.querySelector(".seed-phrase-box");
    seedInputBox.classList.add("hidden");
    console.log(seedInputBox);
  }
}
