function renderCreateAccount() {
  const root = document.getElementById("root");

  root.innerHTML = `
      <div class="create-account-page">
      <header class="send-header">
        <button class="back-button" onclick="state.navigate('auth')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1>Choose a username</h1>
      </header>
        
        <img src="./public/icon-512x512.png" class="auth-logo" alt="Liberdus logo">
        
        ${renderUsernameInput(false, "Pick a unique username or display name.")}
        <p class="auth-terms">
          By using this service, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    `;
}

function renderUsernameInput(isImport = false, label = "") {
  return `
        <div class="auth-form">
          <p class="auth-description">${label}</p>
          <label class="input-label">Username or display name</label>
          <input 
            type="text" 
            class="auth-input" 
            id="username" 
            placeholder="Enter your username"
            oninput="checkUsername(this.value)"
          >
          <span class="input-status" id="username-status"></span>

          ${
            isImport
              ? `<button class="auth-button primary" id="create-button" onclick="handleAppLogin()" disabled>`
              : `<button class="auth-button primary" id="create-button" onclick="handleAppLogin()" disabled>`
          }
          
            <span id="button-text">Create Account</span>
            <span id="button-loader" class="hidden">Creating Account...</span>
          </button>
        </div>
      `;
}

let checkUsernameTimeout;
let isCheckingUsername = false;

async function checkUsername(username) {
  const status = document.getElementById("username-status");
  const createButton = document.getElementById("create-button");
  const buttonText = document.getElementById("button-text");

  // Always disable button while typing or checking
  createButton.disabled = true;
  buttonText.textContent = "Create Account";

  // Clear previous timeout
  if (checkUsernameTimeout) {
    clearTimeout(checkUsernameTimeout);
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
  status.textContent = "Checking availability...";
  status.className = "input-status";
  isCheckingUsername = true;

  // Add delay before checking to prevent too many requests
  checkUsernameTimeout = setTimeout(async () => {
    try {
      // Simulate API call with random response
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // const taken = Math.random() > 0.3; // 70% chance username is available

      const { taken, localWallet, error } =
        await AppActions.handleUsernameAvailability(username);
      console.log(taken, localWallet);
      if (error) {
        status.textContent = error;
        status.className = "input-status error";
        return;
      }
      if (localWallet) {
        status.textContent = "Found username in local wallet";
        status.className = "input-status success";
        buttonText.textContent = "Sign In";
        createButton.disabled = false;
      } else if (taken) {
        status.textContent = "Username is already taken";
        status.className = "input-status error";
      } else {
        status.textContent = "Username is available!";
        status.className = "input-status success";
        createButton.disabled = false; // Only enable button when username is available
      }
    } catch (error) {
      status.textContent = "Error checking username availability";
      status.className = "input-status error";
      console.error("Error checking username availability:", error);
    } finally {
      isCheckingUsername = false;
    }
  }, 500);
}


// handleAppLogin is used in both sign-in and import-account
async function handleAppLogin() {
  const username = document.getElementById("username").value;
  const buttonText = document.getElementById("button-text");
  const buttonLoader = document.getElementById("button-loader");
  const createButton = document.getElementById("create-button");

  // From import-account page
  const seedPhrase = document.querySelector(".sk-input")?.value;
  console.log("seedPhrase", seedPhrase);

  // Prevent submission if still checking username
  if (isCheckingUsername) {
    return;
  }

  buttonText.classList.add("hidden");
  buttonLoader.classList.remove("hidden");
  createButton.disabled = true;

  // Simulate account creation
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  const { success, error, existingWallet } = await AppActions.handleSignIn(
    username, seedPhrase
  );
  if (success) {
    buttonText.classList.remove("hidden");
    buttonLoader.classList.add("hidden");
    createButton.disabled = false;
    if (existingWallet || seedPhrase) state.authenticate();
    else state.navigate("recovery-key");
  } else {
    buttonText.classList.remove("hidden");
    buttonLoader.classList.add("hidden");
    createButton.disabled = false;
    alert(error);
  }
}
