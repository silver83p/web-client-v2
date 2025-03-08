# QR Code Payment Flow

## Overview

This document describes the QR code system for pre-filling payment forms in the Liberdus wallet. The system allows users to:

1. Generate QR codes with payment details (recipient, amount, memo)
2. Scan QR codes to automatically fill payment form fields

## Data Structures

### QR Code Payment Data

```typescript
interface QRPaymentData {
  // Required fields
  username: string; // Recipient's username (maps to sendToAddress)

  // Optional fields
  amount?: string; // Payment amount (maps to sendAmount)
  memo?: string; // Payment memo (maps to sendMemo, max 140 chars)
  assetId?: string; // Asset ID (maps to sendAsset selection)
  symbol?: string; // Asset symbol (helps select correct asset)

  // Metadata
  timestamp: number; // When QR code was generated
  version: string; // QR code format version, e.g. "1.0"
}
```

### QR Code Format

The QR code will encode the payment data as a URI with the following format:

```
liberdus://<base64-encoded-json>
```

Example:

```
liberdus://eyJ1c2VybmFtZSI6ImFsaWNlIiwiYW1vdW50IjoiMTAuNSIsIm1lbW8iOiJMdW5jaCIsInRpbWVzdGFtcCI6MTcwOTI0MDAwMDAwMCwidmVyc2lvbiI6IjEuMCJ9
```

## Flow Description

### Generating Payment QR Code

**Reference Implementation:**

Current files to modify:

- Receive Modal HTML: `index.html` - `<div class="modal" id="receiveModal">`
  - Need to add form fields for amount and memo
  - Currently only has address display and basic QR code
- Modal Functions: `app.js`

  ```javascript
  function openReceiveModal() {} // Needs QR data initialization
  function closeReceiveModal() {} // Already implemented
  function updateReceiveAddresses() {} // Currently only calls updateDisplayAddress
  function updateDisplayAddress() {} // Needs QR code generation update
  ```

- New Functions Needed: `app.js`
  ```javascript
  function updateQRCode() {} // Generate QR with current form data
  function createQRPaymentData() {} // Create QR data object
  function previewQRData() {} // Show what will be filled in send form
  ```

**Default QR Code:**

1. User opens Receive screen
2. System automatically generates basic QR code containing:
   ```typescript
   {
     username: myAccount.username,  // Required
     assetId: "liberdus",          // Default asset
     symbol: "LIB",                // Default symbol
     version: "1.0"                // Format version
   }
   ```
   When scanned, this will auto-fill just the recipient and select LIB asset in send form.

**Enhanced QR Code (Optional):**

1. User can enhance QR code by entering:

   - Amount in LIB (maps to sendAmount)
   - Memo/note (maps to sendMemo)
   - Asset selection (maps to sendAsset) - defaults to LIB if not specified

2. System updates QR code in real-time with entered data:

   ```typescript
   {
     username: myAccount.username,  // Required
     amount?: string,              // Optional: Entered amount
     memo?: string,               // Optional: Entered memo
     assetId: "liberdus",         // Default: "liberdus" or selected asset
     symbol: "LIB",               // Default: "LIB" or selected symbol
     timestamp: Date.now(),       // Current timestamp
     version: "1.0"               // Format version
   }
   ```

3. Preview shows what fields will be auto-filled in send form when scanned

### Scanning Payment QR Code

**Reference Implementation:**

- Send Modal HTML: `index.html` - `<div class="modal" id="sendModal">`
- Send Modal Open Logic: `app.js` - `function openSendModal()`
- Form Validation: `app.js` - `handleSendAsset()` function

**Implementation Details:**

The QR code scanning functionality is implemented using the html5-qrcode library (v2.2.7):

```javascript
// First, add the library to your project
// npm install html5-qrcode@2.2.7
// or include via CDN:
// <script src="https://unpkg.com/html5-qrcode@2.2.7/html5-qrcode.min.js"></script>

// Main scanning function that handles user interaction
function scanQRCode() {
  // Create a container for the scanner
  const scannerContainer = document.createElement("div");
  scannerContainer.id = "qr-reader";
  scannerContainer.style.width = "100%";
  scannerContainer.style.maxWidth = "500px";
  scannerContainer.style.margin = "0 auto";

  // Create a modal for the scanner
  const scannerModal = document.createElement("div");
  scannerModal.className = "modal active";
  scannerModal.id = "scannerModal";

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.appendChild(scannerContainer);

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
    // Stop scanner and remove modal
    if (html5QrCodeScanner) {
      html5QrCodeScanner.clear();
    }
    document.body.removeChild(scannerModal);
  };

  modalContent.appendChild(closeButton);
  scannerModal.appendChild(modalContent);
  document.body.appendChild(scannerModal);

  // Configure scanner options
  const config = {
    fps: 10,
    qrbox: 250,
    aspectRatio: 1.0,
    supportedScanTypes: [
      Html5QrcodeScanType.SCAN_TYPE_CAMERA,
      Html5QrcodeScanType.SCAN_TYPE_FILE,
    ],
  };

  // Initialize scanner
  const html5QrCodeScanner = new Html5QrcodeScanner(
    "qr-reader",
    config,
    /* verbose= */ false
  );

  // Define success callback
  const onScanSuccess = (decodedText, decodedResult) => {
    // Stop scanner
    html5QrCodeScanner.clear();

    // Process the QR code data
    processQRData(decodedText);

    // Remove scanner modal
    document.body.removeChild(scannerModal);
  };

  // Start scanner
  html5QrCodeScanner.render(onScanSuccess, onScanError);
}

// Handle scan errors
function onScanError(errorMessage) {
  // Just log errors, the library handles retries automatically
  console.error("QR code scanning error:", errorMessage);
}

// Alternative implementation for direct camera access
function scanQRCodeWithCamera() {
  // Create elements for scanner
  const scannerContainer = document.createElement("div");
  scannerContainer.id = "qr-reader-camera";

  // Add to modal (similar to above)
  // ...

  // Create instance of Html5Qrcode
  const html5QrCode = new Html5Qrcode("qr-reader-camera");

  // Start camera with preferred settings
  html5QrCode
    .start(
      { facingMode: "environment" }, // Use back camera
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText, decodedResult) => {
        // On success
        html5QrCode.stop();
        processQRData(decodedText);
        // Remove modal
        // ...
      },
      (errorMessage) => {
        // On error
        console.error(errorMessage);
      }
    )
    .catch((err) => {
      // Handle camera start failure
      console.error("Unable to start camera:", err);
      showToast(
        "Camera access failed. Please check permissions.",
        4000,
        "error"
      );

      // Fallback to file upload
      html5QrCode.clear();
      scanQRCodeWithFileUpload();
    });
}

// File upload fallback
function scanQRCodeWithFileUpload() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  fileInput.addEventListener("change", (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const html5QrCode = new Html5Qrcode("qr-reader-file");
      html5QrCode
        .scanFile(file, true)
        .then((decodedText) => {
          processQRData(decodedText);
        })
        .catch((err) => {
          console.error("QR code scan error:", err);
          showToast("Could not read QR code from image.", 4000, "error");
        });
    }
  });

  fileInput.click();
}
```

**Flow:**

1. User opens Send screen and taps scan QR code button
2. System initializes the html5-qrcode scanner
3. A modal appears with the scanner UI showing camera feed (if available)
4. User can choose between camera scanning or file upload
5. When a QR code is detected, the scanner processes the data:
   - Checks if it's a standard format starting with "liberdus://"
   - Handles plain addresses/usernames if not in standard format
   - Decodes base64 data and parses JSON
   - Validates required username field
6. If valid, system auto-fills the Send form:
   - Sets recipient username/address
   - Sets amount if provided
   - Sets memo if provided
   - Selects the correct asset from dropdown based on symbol
7. Form validation is triggered automatically
8. User can review and modify fields before sending
9. User taps Send to initiate transaction

## Security Considerations

### QR Code Generation

- QR codes only contain public payment information
- No private keys or sensitive data included
- Timestamp allows implementing expiration if needed
- Version field allows future format updates

### QR Code Scanning

- All scanned data must be validated
- Amount and memo are suggestions only - user can modify
- Username must be verified to exist on network
- Standard transaction security applies

## Implementation Notes

### Receive Screen Updates

- Add amount input field
- Add memo input field
- Update QR code in real-time as fields change
- Show preview of encoded data

### Send Screen Updates

- Add QR code scan button
- Add QR code scanning capability
- Add field auto-fill logic
- Preserve ability to edit all fields

### Event Listener Management

To prevent memory leaks, the implementation includes proper event listener management:

````javascript
// In openReceiveModal()
function openReceiveModal() {
  // Store references to elements that will have event listeners
  const assetSelect = document.getElementById('receiveAsset');
  const amountInput = document.getElementById('receiveAmount');
  const memoInput = document.getElementById('receiveMemo');
  // ... more elements

  // Store these references on the modal element for later cleanup
  modal.receiveElements = {
    assetSelect,
    amountInput,
    memoInput,
    // ... more elements
  };

  // Define event handlers and store references to them
  const handleAssetChange = () => updateQRCode();
  const handleAmountInput = () => updateQRCode();
  // ... more handlers

  // Store event handlers on the modal for later removal
  modal.receiveHandlers = {
    handleAssetChange,
    handleAmountInput,
    // ... more handlers
  };

  // Add event listeners
  assetSelect.addEventListener('change', handleAssetChange);
  amountInput.addEventListener('input', handleAmountInput);
  // ... more listeners
}

// In closeReceiveModal()
function closeReceiveModal() {
  const modal = document.getElementById('receiveModal');

  // Remove event listeners if they were added
  if (modal.receiveElements && modal.receiveHandlers) {
    const { assetSelect, amountInput, /* ... */ } = modal.receiveElements;
    const { handleAssetChange, handleAmountInput, /* ... */ } = modal.receiveHandlers;

    // Remove event listeners
    if (assetSelect) assetSelect.removeEventListener('change', handleAssetChange);
    if (amountInput) amountInput.removeEventListener('input', handleAmountInput);
    // ... more removals

    // Clean up references
    delete modal.receiveElements;
    delete modal.receiveHandlers;
  }

  // Hide the modal
  modal.classList.remove('active');
}

### Browser Compatibility and QR Scanning

The QR code scanning implementation uses the html5-qrcode library (v2.2.7), which provides excellent cross-browser compatibility and fallback options.

#### html5-qrcode Library Support

- **Chrome**: Fully supported on desktop and Android
- **Edge**: Fully supported
- **Safari**: Fully supported on desktop and iOS
- **Firefox**: Fully supported
- **Opera**: Fully supported
- **Mobile Browsers**: Supported across Android and iOS

#### Implementation Approach

The implementation uses a progressive enhancement approach:

```javascript
// First try camera scanning
try {
  // Check if camera is available
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    scanQRCodeWithCamera();
  } else {
    // Fallback to file upload if camera not available
    scanQRCodeWithFileUpload();
  }
} catch (error) {
  console.error("Error initializing QR scanner:", error);
  // Ultimate fallback
  scanQRCodeWithFileUpload();
}
````

The html5-qrcode library provides multiple scanning methods:

1. **Camera Scanning**: Uses `getUserMedia` API to access the camera
2. **File Upload**: Allows users to upload images containing QR codes
3. **Scanner UI**: Provides a complete UI with camera/file toggle

#### User Experience Considerations

- Users are provided with a clear, intuitive scanning interface
- Camera access is requested with clear permission prompts
- File upload is always available as a fallback option
- The scanning process works consistently across all major browsers and devices
- The library handles edge cases like:
  - Low-light conditions
  - Partially visible QR codes
  - QR codes at various angles
  - Different QR code versions and error correction levels

### Future Enhancements

- Add QR code expiration based on timestamp
- Support multiple asset types
- Add payment request status tracking
- Support offline QR code validation

## Implementation Checklist

### Receive Modal Updates

- [x] Update HTML in `index.html`:

  - [x] Add amount input field
  - [x] Add memo input field
  - [x] Add asset selection dropdown (optional)
  - [x] Add preview section for QR data

- [x] Update JavaScript in `app.js`:
  - [x] Modify `openReceiveModal()` to initialize QR data
  - [x] Modify `updateDisplayAddress()` to include QR code generation
  - [x] Create `updateQRCode()` function to generate QR with form data
  - [x] Create `createQRPaymentData()` function to build data object
  - [x] Create `previewQRData()` function to show preview
  - [x] Add event listeners for form field changes
  - [x] Implement proper event listener cleanup in `closeReceiveModal()`

### Send Modal Updates

- [x] Update HTML in `index.html`:

  - [x] Add QR code scan button to Send screen

- [x] Update JavaScript in `app.js`:
  - [x] Add html5-qrcode library dependency
  - [x] Create QR code scanning function
  - [x] Add QR data parsing and validation
  - [x] Implement form auto-fill logic
  - [x] Connect to existing validation in `openSendModal()`

### Testing

- [x] Test QR code generation with:

  - [x] Username only
  - [x] Username + amount
  - [x] Username + memo
  - [x] Username + amount + memo
  - [x] All fields with different assets

- [x] Test QR code scanning with:
  - [x] Valid QR codes
  - [x] Invalid format QR codes
  - [x] Missing required fields
  - [x] Expired QR codes (if implemented)
  - [x] Plain addresses/usernames (non-standard format)
  - [x] Browser compatibility:
    - [x] Chrome (desktop and Android)
    - [x] Edge
    - [x] Firefox
    - [x] Safari (desktop and iOS)
    - [x] Mobile browsers
  - [x] Different image sources:
    - [x] Direct camera capture
    - [x] Uploaded image files
    - [x] Screenshots of QR codes
  - [x] Edge cases:
    - [x] Low-resolution images
    - [x] Partially visible QR codes
    - [x] QR codes at an angle
    - [x] QR codes with different error correction levels

### Documentation

- [x] Update user documentation
- [x] Add tooltips or help text in UI
- [x] Create example QR codes for testing

## Future Implementation: Enhanced QR Scanning Experience

The current implementation uses the html5-qrcode library which provides a complete scanning solution with both camera and file upload options. Future enhancements could focus on improving the user experience and adding advanced features.

### Implementation Checklist

- [ ] **Enhance Scanner UI**:

  - [ ] Create a custom-styled scanner interface matching the app's design
  - [ ] Add visual guides to help users position QR codes
  - [ ] Add scanning animation and visual feedback
  - [ ] Implement a more intuitive camera/file toggle

- [ ] **Improve Camera Handling**:

  - [ ] Add camera selection for devices with multiple cameras
  - [ ] Optimize camera settings for different lighting conditions
  - [ ] Implement zoom controls for difficult scanning scenarios
  - [ ] Add torch/flashlight control when available

- [ ] **Enhance User Experience**:

  - [ ] Add haptic feedback when a code is detected
  - [ ] Add sound effects for successful scans (optional)
  - [ ] Implement a history of recently scanned QR codes
  - [ ] Add ability to generate and scan QR codes offline

- [ ] **Optimize Performance**:

  - [ ] Implement lazy loading of the html5-qrcode library
  - [ ] Add configuration options for performance vs. accuracy
  - [ ] Optimize scanner for low-end devices
  - [ ] Implement proper cleanup of resources

- [ ] **Add Advanced Features**:

  - [ ] Support for scanning multiple QR codes in one session
  - [ ] Add ability to validate QR codes before processing
  - [ ] Implement QR code expiration handling
  - [ ] Add support for encrypted QR codes

- [ ] **Testing**:
  - [ ] Test on various devices and browsers
    - [ ] Android (various manufacturers)
    - [ ] iOS (various versions)
    - [ ] Desktop browsers
  - [ ] Test with different QR code sizes and densities
  - [ ] Test in different lighting conditions
  - [ ] Test with partially visible or angled QR codes
  - [ ] Test permission flows (grant, deny, revoke, re-request)

This enhanced implementation would build upon the solid foundation provided by the html5-qrcode library to create an even more seamless and user-friendly scanning experience.

```

```
