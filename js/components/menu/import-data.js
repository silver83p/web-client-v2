function renderImportPage() {
  const root = document.getElementById("root");
  // const chats = state.getState().chats;


  root.innerHTML = `
    <div class="import-page">
      <div class="import-header">
        <button class="back-button" onclick="state.navigate('wallet')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1>Import Data</h1>
      </div>

      <label class="section-title">Select File</label>
      <div class="file-input-container">
        <input type="file" id="file-input" hidden accept=".json">
        <label for="file-input" class="file-input-label">Choose File</label>
        <span class="file-name" id="file-name">No file chosen</span>
      </div>

      <label class="section-title">Password (if encrypted)</label>
      <input 
          type="password" 
          class="password-input" 
          id="password-input"
          placeholder="Enter password for encrypted files"
      >

      <button class="load-button" onclick="handleImportData()">Load Data</button>
      <div id="import-status"></div>

    </div>
  `;

  // Add file input change handler
  document.getElementById("file-input").addEventListener("change", (e) => {
    const fileName = e.target.files[0]?.name || "No file chosen";
    document.getElementById("file-name").textContent = fileName;
  });
}

async function handleImportData() {
  const fileInput = document.getElementById("file-input");

  try {
    // Read the file
    const file = fileInput.files[0];
    const fileContent = await file.text();

    let jsonData;
    // Check if data is encrypted and decrypt if necessary
    // if (isEncryptedData(fileContent)) {
    //     if (!passwordInput.value) {
    //         throw new Error('Password required for encrypted data');
    //     }
    //     const decrypted = await decryptData(fileContent, passwordInput.value);
    //     jsonData = JSON.parse(decrypted);
    // } else {
    //     jsonData = JSON.parse(fileContent);
    // }
    jsonData = JSON.parse(fileContent);

    // Update state with imported data
    state.updateState(jsonData);

    // Show success message
    showSuccessMessage();
  } catch (error) {
    console.error("Error importing data:", error);
    showErrorMessage(error.message);
  }
}

const showSuccessMessage = () => {
  const statusDiv = document.getElementById("import-status");
  statusDiv.innerHTML = '<div class="success-message">Data imported successfully!</div>';
  setTimeout(() => {
    clearValues();
  }, 2000);
};

const showErrorMessage = (message) => {
  const statusDiv = document.getElementById("import-status");
  statusDiv.innerHTML = `<div class="error-message">Failed to import data: ${message}</div>`;
  setTimeout(() => {
    clearValues();
  }, 2000);
};

const clearValues = () => {
  console.log("Clearing values");
  const fileInput = document.getElementById("file-input");
  const passwordInput = document.getElementById("password-input");
  const statusDiv = document.getElementById("import-status");
  fileInput.value = "";
  passwordInput.value = "";
  statusDiv.innerHTML = "";
};
