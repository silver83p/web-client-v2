function renderExportPage() {
  const root = document.getElementById("root");
  // const chats = state.getState().chats;

  root.innerHTML = `
    <div class="export-page">
      <div class="export-header">
        <button class="back-button" onclick="state.navigate('wallet')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1>Export Data</h1>
      </div>

      <label class="section-title">Password</label>
      <input 
          type="password" 
          class="export-password-input" 
          id="export-password-input"
          placeholder="Leave empty for unencrypted export"
      >

      <button class="load-button" onclick="handleExportData()">Export Data</button>
      <div id="export-status"></div>

    </div>
  `;
}

async function handleExportData() {
  const exportData = {
    timestamp: new Date().toISOString(),
    account: state.getState().account,
    network: state.getState().network,
    wallet: state.getState().wallet,
    chats: state.getState().chats,
    contacts: state.getState().contacts,
    unread: state.getState().unread,
  };

  const password = document.getElementById("export-password-input").value;
  let jsonData = JSON.stringify(exportData, null, 2);

  // Encrypt data if password is provided
  try {
    // jsonData = password ? await encryptData(jsonData, password) : jsonData;
  } catch (error) {
    console.error("Encryption failed:", error);
    showExportErrorMessage(error.message);
    return;
  }

  try {
    // Create and trigger download
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `app-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    showExportSuccessMessage();
  } catch (error) {
    console.error("Error exporting data:", error);
    showExportErrorMessage(error.message);
  }
}

const showExportSuccessMessage = () => {
  const statusDiv = document.getElementById("export-status");
  statusDiv.innerHTML =
    '<div class="success-message">Data exported successfully!</div>';
  setTimeout(() => {
    clearExportValues();
  }, 2000);
};

const showExportErrorMessage = (message) => {
  const statusDiv = document.getElementById("export-status");
  statusDiv.innerHTML = `<div class="error-message">Failed to export data: ${message}</div>`;
  setTimeout(() => {
    clearExpoValues();
  }, 2000);
};

const clearExportValues = () => {
  console.log("Clearing values");
  const passwordInput = document.getElementById("export-password-input");
  const statusDiv = document.getElementById("export-status");
  passwordInput.value = "";
  statusDiv.innerHTML = "";
};
