function renderGetStarted() {
  const root = document.getElementById("root");

  root.innerHTML = `
    <div class="auth-container">
      <img src="./public/icon-512x512.png" class="auth-logo" alt="Liberdus logo">
      <h1 class="auth-title">Get Started</h1>
      <div class="auth-buttons">
        <button class="auth-button primary" onclick="goToSignIn()">Sign In</button>
        <button class="auth-button secondary" onclick="goToImport()">Import Account</button>
      </div>
    </div>
  `;
}
function goToSignIn() {
  state.navigate("sign-in");
}

function goToImport() {
  state.navigate("import-account");
}
