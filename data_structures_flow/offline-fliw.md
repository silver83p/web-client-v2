# Offline Functionality Plan

## Overview

This document outlines the comprehensive offline-first strategy for our PWA, ensuring users have a seamless experience regardless of network connectivity. The plan follows best practices from the Offline Cookbook and modern PWA patterns.

## Core Requirements

1. Provide a full offline-first experience with graceful degradation
2. Cache all critical resources for instant loading
3. Enable offline access to user data (chats, contacts, wallet info)
4. Handle dynamic content and API requests appropriately
5. Provide clear feedback about connectivity status and available actions
6. Ensure data consistency between online/offline states
7. Handle page refreshes in offline mode

## Caching Strategy

### Cache Types

1. **STATIC_CACHE** (v{timestamp})
   - Shell resources (HTML, CSS, JS, images)
   - Font files and icons
   - Manifest and other app metadata
2. **DYNAMIC_CACHE** (v{timestamp})

   - API responses
   - Dynamically loaded content
   - User-specific data

3. **DATA_CACHE** (v{timestamp})
   - IndexedDB for structured data
   - Chat history
   - Contact information
   - Wallet data
   - Pending transactions

### Caching Patterns

1. **Cache First, Network Fallback**

   - Use for: Static assets, app shell, fonts, images
   - Implementation: Check cache → Return if found → Fetch from network if missing
   - Benefits: Fastest possible load time for static content

2. **Stale While Revalidate**

   - Use for: Frequently updated API responses, user profile data
   - Implementation: Return from cache → Fetch update → Cache update for next time
   - Benefits: Quick response while keeping content fresh

3. **Network First, Cache Fallback**

   - Use for: Chat messages, transaction history
   - Implementation: Try network → Use cache if offline → Update cache when online
   - Benefits: Always fresh content when possible, graceful offline fallback

4. **Cache Only**
   - Use for: App shell after initial install
   - Implementation: Serve directly from cache
   - Benefits: Guaranteed offline functionality

### Precaching Strategy

1. **Install Phase**

   ```javascript
   const PRECACHE_URLS = [
     "/",
     "/index.html",
     "/styles.css",
     "/app.js",
     "/manifest.json",
     "/offline.html",
     "/images/logo.png",
     // Add all critical assets
   ];
   ```

2. **Runtime Caching Rules**

   ```javascript
   // Network first for API endpoints
   registerRoute(
     ({ url }) => url.pathname.startsWith("/api/"),
     new NetworkFirst()
   );

   // Cache first for static assets
   registerRoute(
     ({ request }) => request.destination === "image",
     new CacheFirst()
   );
   ```

## Data Management

### IndexedDB Structure

1. **Chats Store**

   - Key: chatId
   - Value: {chats[], contacts{}, version, lastUpdated}

2. **Contacts Store**

   - Key: address
   - Value: {contacts{}, version, lastUpdated}

3. **Wallet Store**
   - Key: assetId
   - Value: {wallet{}, version, lastUpdated}

### Offline Data Access

1. **Data Storage**

   ```javascript
   // Import database functions
   import { STORES, saveData, getData, getAllData } from "./db.js";

   // Add version information to data before saving
   function addVersion(data) {
     return {
       ...data,
       version: Date.now(),
       lastUpdated: Date.now(),
     };
   }

   // Example of saving chat data
   const chatData = addVersion({
     chatId: myAccount.keys.address,
     chats: myData.chats,
     contacts: myData.contacts,
   });
   await saveData(STORES.CHATS, chatData);
   ```

2. **Data Access Strategy**
   - Cache data in IndexedDB when online
   - Read from IndexedDB when offline
   - Update local data when back online
   - Maintain "last updated" timestamps

## UI/UX Considerations

### Offline Indicators

1. **Toast Notifications**

   - Show toast when going offline: "You're offline. Some features are unavailable."
   - Show toast when coming back online: "You're back online!"

2. **Action-Specific Feedback**
   - Disabled state for offline-incompatible actions
   - Visual indicators for disabled elements
   - Clear error messages for failed operations

### Progressive Enhancement

1. **Feature Detection**

   ```javascript
   if ("serviceWorker" in navigator) {
     // Enable PWA features
     await registerServiceWorker();
     setupServiceWorkerMessaging();
     setupAppStateManagement();
     setupConnectivityDetection();
   }
   ```

2. **Graceful Degradation**
   - Fallback content for uncached resources
   - Simplified UI for unsupported features
   - Clear messaging about limited functionality

## Error Handling

### Network Failures

1. **Request Timeouts**

   - Implement appropriate timeout periods
   - Clear feedback about network status

2. **Offline State Management**
   - Global `isOnline` variable to track connectivity
   - Periodic connectivity checks
   - Automatic UI updates based on connectivity

## Testing Strategy

### Offline Scenarios

1. **Network Conditions**

   - Complete offline
   - Intermittent connectivity

2. **User Actions**
   - Page load while offline
   - Navigation while offline
   - Form submissions
   - Data synchronization
   - Page refresh

### Test Cases

1. **Installation**

   - [ ] Verify precaching of critical resources
   - [ ] Confirm service worker registration
   - [ ] Check cache storage initialization

2. **Online → Offline Transition**

   - [ ] Test automatic offline detection
   - [ ] Verify UI updates
   - [ ] Confirm cached content accessibility
   - [ ] Check disabled feature handling

3. **Offline → Online Transition**

   - [ ] Test reconnection detection
   - [ ] Verify data synchronization
   - [ ] Check UI restoration

4. **Data Management**
   - [ ] Verify offline data access
   - [ ] Confirm data consistency

## Progress Update

### Completed Items ✅

1. **Service Worker Setup**

   - ✅ Implemented service worker registration with version management
   - ✅ Added caching strategies for offline access
   - ✅ Implemented update notification system
   - ✅ Added resilient service worker installation that doesn't fail when offline

2. **Offline Page**

   - ✅ Created offline.html fallback page
   - ✅ Implemented proper styling matching app's design system
   - ✅ Added clear user feedback about available/unavailable features

3. **Connectivity Detection**

   - ✅ Implemented global `isOnline` state variable
   - ✅ Added event listeners for online/offline events
   - ✅ Created `setupConnectivityDetection()` function
   - ✅ Implemented `handleConnectivityChange()` for state updates
   - ✅ Added periodic connectivity checks
   - ✅ Improved online detection with network verification

4. **UI/UX Implementation**

   - ✅ Implemented `markConnectivityDependentElements` function
   - ✅ Added visual feedback for offline-disabled elements
   - ✅ Implemented tooltips for disabled elements
   - ✅ Added form submission prevention when offline
   - ✅ Integrated with toast notification system
   - ✅ Added CSS styles for offline states

5. **Data Storage**

   - ✅ Implemented IndexedDB setup with three stores (chats, contacts, wallet)
   - ✅ Added data versioning for consistency tracking
   - ✅ Implemented caching of chat data when online
   - ✅ Implemented caching of contacts data when online
   - ✅ Implemented caching of wallet data when online
   - ✅ Added offline data access for all stores

6. **Component Implementation**
   - ✅ Updated `updateChatList()` to handle offline mode
   - ✅ Updated `updateContactsList()` to handle offline mode
   - ✅ Updated `updateWalletView()` to handle offline mode
   - ✅ Added conditional polling based on connectivity

### Current Implementation Details

The following code has been implemented to support offline functionality:

```javascript
// Global connectivity state
let isOnline = true; // Will be updated by connectivity checks

// Setup connectivity detection
function setupConnectivityDetection() {
  // Listen for browser online/offline events
  window.addEventListener("online", handleConnectivityChange);
  window.addEventListener("offline", handleConnectivityChange);

  // Mark elements that depend on connectivity
  markConnectivityDependentElements();

  // Check initial status (don't trust the browser's initial state)
  checkConnectivity();

  // Periodically check connectivity (every 30 seconds)
  setInterval(checkConnectivity, 30000);
}

// Handle online/offline events
async function handleConnectivityChange(event) {
  if (event.type === "offline") {
    const wasOnline = isOnline;
    // Trust offline events immediately
    isOnline = false;
    updateUIForConnectivity();
    if (wasOnline) {
      showToast(
        "You're offline. Some features are unavailable.",
        3000,
        "offline"
      );
    }
  } else {
    // For online events, verify connectivity before updating UI
    const wasOffline = !isOnline;
    isOnline = await checkOnlineStatus();

    if (isOnline && wasOffline) {
      updateUIForConnectivity();
      showToast("You're back online!", 3000, "online");

      // Sync any pending offline actions
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && "sync" in registration) {
        try {
          await registration.sync.register("sync-messages");
          await registration.sync.register("sync-transactions");
        } catch (err) {
          console.error("Background sync registration failed:", err);
        }
      }
    }
  }
}

// Mark elements that should be disabled when offline
function markConnectivityDependentElements() {
  // Elements that require network connectivity
  const networkDependentElements = [
    // Chat related
    "#handleSendMessage",
    ".message-input",
    "#newChatButton",

    // Wallet related
    "#openSendModal",
    "#refreshBalance",
    '#sendForm button[type="submit"]',

    // Contact related
    "#chatRecipient",

    // Profile related
    '#accountForm button[type="submit"]',
    '#createAccountForm button[type="submit"]',
    '#importForm button[type="submit"]',
  ];

  // Add data attribute to all network-dependent elements
  networkDependentElements.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.setAttribute("data-requires-connection", "true");

      // Add tooltip for disabled state
      element.title = "This feature requires an internet connection";

      // Add aria label for accessibility
      element.setAttribute("aria-disabled", !isOnline);
    });
  });
}

// Update UI elements based on connectivity status
function updateUIForConnectivity() {
  const networkDependentElements = document.querySelectorAll(
    "[data-requires-connection]"
  );

  networkDependentElements.forEach((element) => {
    if (!isOnline) {
      // Disable element
      element.disabled = true;
      element.classList.add("offline-disabled");

      // If it's a form, prevent submission
      if (element.form) {
        element.form.addEventListener("submit", preventOfflineSubmit);
      }
    } else {
      // Enable element
      element.disabled = false;
      element.classList.remove("offline-disabled");

      // Remove form submit prevention
      if (element.form) {
        element.form.removeEventListener("submit", preventOfflineSubmit);
      }
    }

    // Update aria-disabled state
    element.setAttribute("aria-disabled", !isOnline);
  });
}

// Prevent form submissions when offline
function preventOfflineSubmit(event) {
  if (!isOnline) {
    event.preventDefault();
    showToast("This action requires an internet connection", 3000, "error");
  }
}

// Data access pattern for components
async function updateChatList(force) {
  if (myAccount && myAccount.keys) {
    if (isOnline) {
      // Online: Get from network and cache
      gotChats = await getChats(myAccount.keys);
      if (gotChats > 0 || force) {
        // Cache the updated chat data
        try {
          const chatData = addVersion({
            chatId: myAccount.keys.address,
            chats: myData.chats,
            contacts: myData.contacts,
          });
          await saveData(STORES.CHATS, chatData);
        } catch (error) {
          console.error("Failed to cache chat data:", error);
        }
      }
    } else {
      // Offline: Get from cache
      try {
        const cachedData = await getData(STORES.CHATS, myAccount.keys.address);
        if (cachedData) {
          myData.chats = cachedData.chats;
          myData.contacts = cachedData.contacts;
          console.log(
            "Using cached chat data from:",
            new Date(cachedData.lastUpdated)
          );
        }
      } catch (error) {
        console.error("Failed to read cached chat data:", error);
      }
    }
  }

  // Update UI with available data
  // ...
}
```

Enhanced CSS styles have been added to provide clear visual feedback for offline-disabled elements:

```css
.offline-disabled {
  opacity: 0.6;
  cursor: not-allowed !important;
  position: relative;
  pointer-events: none;
  background-color: var(--hover-background) !important;
}

/* Exception for floating button - don't apply position:relative */
.floating-button.offline-disabled {
  position: fixed; /* Keep the original positioning */
}

@media (min-width: 769px) {
  .floating-button.offline-disabled {
    position: absolute; /* Match the media query from the original floating-button */
  }
}

.offline-disabled::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.05) 10px,
    rgba(0, 0, 0, 0.05) 20px
  );
  pointer-events: none;
}

.offline-disabled:hover::after {
  content: "Requires internet connection";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
}
```

### Next Steps 🔄

1. **Data Synchronization**

   - [ ] Implement data conflict resolution for cached data
   - [ ] Add data refresh mechanisms when coming back online
   - [ ] Implement merge strategies for conflicting changes

2. **UI/UX Polish**

   - [ ] Add persistent offline status indicator in header/navigation
   - [ ] Enhance update notification styling

3. **Testing**
   - [ ] Test service worker installation and updates
   - [ ] Verify caching strategies effectiveness
   - [ ] Test offline page functionality
   - [ ] Validate offline element disabling
   - [ ] Test offline data access and sync

## Implementation Phases

### Phase 1: Foundation ✅ (Completed)

- [x] Service Worker setup
- [x] Basic caching implementation
- [x] Offline detection
- [x] Essential UI feedback
- [x] IndexedDB setup and integration

### Phase 2: Data Management ✅ (Completed)

- [x] IndexedDB setup
- [x] Offline data access
- [x] Data versioning
- [x] Conditional data fetching based on connectivity
- [x] Simple data refresh on reconnection

### Phase 3: Enhanced Features (Optional - Not Implemented)

- [ ] Background sync for pending actions
- [ ] Conflict resolution for cached data
- [ ] Offline transaction queue

### Phase 4: Polish (Optional - Not Implemented)

- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Edge case handling

## Core Offline Functionality Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant SW as Service Worker
    participant IDB as IndexedDB
    participant C as Cache Storage
    participant N as Network

    Note over A: App Initialization
    U->>A: Open Application
    A->>SW: Register Service Worker (registerServiceWorker)
    A->>A: Setup Service Worker Messaging (setupServiceWorkerMessaging)
    A->>A: Setup App State Management (setupAppStateManagement)
    A->>A: Setup Connectivity Detection (setupConnectivityDetection)

    rect rgba(200, 230, 200, 0.16)
        Note over SW: Install Phase
        SW->>C: Create Cache Storages
        SW->>C: Precache App Shell
        SW-->>A: Installation Complete
    end

    rect rgba(230, 230, 200, 0.02)
        Note over A: Runtime Phase
        A->>A: Check Connection Status (checkConnectivity)
        A->>A: Set isOnline variable
        A->>A: Mark Network-Dependent Elements (markConnectivityDependentElements)

        alt Online Mode
            A->>N: Check Version (checkVersion)
            N-->>A: Return Version
            A->>A: Process Version Check

            A->>N: Fetch Fresh Data (getChats, updateWalletBalances)
            N-->>A: Return Data
            A->>IDB: Cache Data (saveData with addVersion)
            A->>A: Update UI
        else Offline Mode
            A->>A: Show "Version check failed. You are offline." Alert
            A->>IDB: Load Cached Data (getData)
            IDB-->>A: Return Cached Data
            A->>A: Update UI with Cached Data
            A->>A: Apply Offline UI Styling (updateUIForConnectivity)
        end
    end

    rect rgba(230, 200, 200, 0.08)
        Note over U: User Interactions
        U->>A: Request Resource/Action

        alt Is Network-Dependent Action (has data-requires-connection)
            alt Online
                A->>N: Process Request (postChatMessage, postAssetTransfer)
                N-->>A: Return Response
                A->>A: Update UI
                A->>IDB: Update Cached Data
            else Offline
                A->>A: Action Disabled (offline-disabled class)
                A->>A: Show Tooltip "Requires internet connection"
                A->>A: Prevent Form Submit (preventOfflineSubmit)
                A->>A: Show Toast "This action requires an internet connection"
            end
        else Is Offline-Compatible Action
            A->>A: Process Action Locally
            A->>A: Update UI
        end
    end

    rect rgba(200, 230, 230, 0.15)
        Note over A: Connectivity Changes

        alt Going Offline (handleConnectivityChange)
            A->>A: Set isOnline = false
            A->>A: Update UI for Offline Mode (updateUIForConnectivity)
            A->>A: Show "You're offline" Toast
        else Coming Online (handleConnectivityChange)
            A->>A: Check Online Status (checkOnlineStatus)
            A->>A: Set isOnline = true
            A->>A: Update UI for Online Mode (updateUIForConnectivity)
            A->>A: Show "You're back online" Toast
            A->>A: Register Background Sync (if supported)
            A->>A: Update Chat List (updateChatList)
        end
    end
```

### Page Refresh While Offline Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant SW as Service Worker
    participant A as App
    participant C as Cache Storage
    participant IDB as IndexedDB

    Note over U: User Refreshes Page While Offline

    U->>B: Refresh Page
    B->>SW: Request App Resources

    rect rgba(200, 230, 200, 0.16)
        Note over SW: Service Worker Intercepts
        SW->>C: Get Cached App Shell
        C-->>SW: Return Cached Resources
        SW-->>B: Serve Cached App
        B-->>U: Display Cached App
    end

    rect rgba(230, 200, 230, 0.12)
        Note over A: App Initialization (Offline)
        A->>A: Initialize Service Worker
        A->>A: Setup Connectivity Detection
        A->>A: Check Online Status (checkOnlineStatus)
        A->>A: Detect Offline State

        Note over A: Version Check Fails
        A->>A: Show "Version check failed. You are offline." Alert
        A->>A: Set isOnline = false
        A->>A: Update UI for Offline Mode (updateUIForConnectivity)
        A->>A: Mark Network-Dependent Elements (markConnectivityDependentElements)
    end

    rect rgba(230, 230, 200, 0.08)
        Note over A: Load Cached Data

        alt User Is Logged In
            A->>IDB: Get Cached Chat Data (getData from STORES.CHATS)
            IDB-->>A: Return Cached Chats
            A->>A: Populate Chat UI (updateChatList)

            A->>IDB: Get Cached Contacts Data (getData from STORES.CONTACTS)
            IDB-->>A: Return Cached Contacts
            A->>A: Populate Contacts UI (updateContactsList)

            A->>IDB: Get Cached Wallet Data (getData from STORES.WALLET)
            IDB-->>A: Return Cached Wallet
            A->>A: Populate Wallet UI (updateWalletView)
        else No Cached Login
            A->>A: Show Login Screen
            A->>A: Disable Network-Dependent Actions
        end
    end

    rect rgba(200, 200, 230, 0.14)
        Note over A: User Experience
        A->>A: Apply offline-disabled Class to Network-Dependent Elements
        A->>A: Add Tooltips "Requires internet connection"

        U->>A: Attempt Network-Dependent Action
        A->>A: Action Already Disabled (pointer-events: none)
        A->>A: Show Tooltip on Hover
    end
```

### Component Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component (Chat/Contacts/Wallet)
    participant IDB as IndexedDB
    participant N as Network

    Note over C: Component Initialization (switchView)

    alt Online Mode (isOnline === true)
        C->>N: Fetch Data (getChats/updateWalletBalances)
        N-->>C: Return Data
        C->>C: Update UI
        C->>IDB: Cache Data (saveData with addVersion)
    else Offline Mode (isOnline === false)
        C->>IDB: Get Cached Data (getData)
        IDB-->>C: Return Cached Data
        C->>C: Update UI with Cached Data
        C->>C: Disable Network-Dependent Actions
    end

    Note over C: Specific Component Behavior

    alt Chat Component
        C->>C: Set Polling Interval Based on Connectivity
        C->>C: Disable Send Message Button When Offline
    else Wallet Component
        C->>C: Disable Send/Refresh Buttons When Offline
        C->>C: Show Cached Balance Information
    else Contacts Component
        C->>C: Display Cached Contact Information
    end

    Note over C: User Interaction

    alt Network-Dependent Action
        U->>C: Attempt Action
        alt Online
            C->>N: Process Action
            N-->>C: Return Result
            C->>C: Update UI
            C->>IDB: Update Cache
        else Offline
            C->>C: Action Already Disabled (offline-disabled class)
            C->>C: Show Tooltip "Requires internet connection"
        end
    else Offline-Compatible Action (View Only)
        U->>C: View Data
        C->>C: Display Cached Data
    end
```

## References

- [The Offline Cookbook](https://web.dev/articles/offline-cookbook)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [IndexedDB Best Practices](https://web.dev/articles/indexeddb-best-practices)
- [Background Sync](https://web.dev/articles/background-sync)
- [Cache API](https://web.dev/articles/cache-api-quick-guide)
