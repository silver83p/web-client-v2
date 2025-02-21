# Contact Creation Flow

```mermaid
sequenceDiagram
    title Contact Creation and Management Flow

    participant User
    participant UI
    participant App
    participant ContactStore
    participant Network

    %% New Chat Flow
    User->>UI: Clicks "New Chat"
    UI->>App: handleNewChat(recipient)
    App->>ContactStore: Check if contact exists
    alt Contact doesn't exist
        App->>ContactStore: createNewContact(address)
        ContactStore-->>App: New contact created
    end
    App->>ContactStore: Update username
    App->>ContactStore: Add to chats list
    App-->>UI: Update chat view

    %% Receive Message Flow
    Network->>App: New message received
    App->>App: processChats(messages)
    App->>ContactStore: Check if sender exists
    alt Contact doesn't exist
        App->>ContactStore: createNewContact(sender)
        ContactStore-->>App: New contact created
    end
    App->>ContactStore: Add message to contact
    App-->>UI: Update chat view

    %% Contact Creation Details
    Note over ContactStore: Contact Object Structure:<br/>- Normalized address<br/>- Optional username<br/>- Empty messages array<br/>- Creation timestamp<br/>- Unread counter (0)
```

This sequence diagram illustrates two main flows for contact creation:

1. Manual Contact Creation (New Chat)
   - Triggered by user initiating a new chat
   - Creates contact if doesn't exist
   - Updates chat list
2. Automatic Contact Creation (Receive Message)
   - Triggered by receiving a message
   - Creates contact for unknown sender
   - Updates messages and UI

The diagram also shows the basic contact object structure created in both flows.

```mermaid
sequenceDiagram
    participant Sender
    participant Recipient
    participant UI

    Sender->>Recipient: Send message with senderInfo
    Recipient->>Recipient: Process message & store senderInfo
    Note over Recipient: Contact updated with sender details

    Recipient->>UI: Click on contact
    UI->>UI: Check if contact.senderInfo exists
    alt Has senderInfo
        UI->>UI: Open contact info modal
    else No senderInfo
        Note over UI: Contact info not available
    end
```

This sequence diagram illustrates the flow for opening the contact info modal.

```mermaid
sequenceDiagram
    participant UI
    participant App

    UI->>App: Click on user info
    App->>App: Check contact.senderInfo
    alt Has senderInfo
        App->>UI: Open contact info modal
    else No senderInfo
        Note over App: Do nothing
    end
```

This sequence diagram illustrates the flow for opening the contact info modal.

## Contact Fields vs SenderInfo Fields

The Contact structure contains both direct fields (`username`, `name`) and a `senderInfo` object that appears to have overlapping fields. Here's how they differ and work together:

### Display Fields (Contact.username and Contact.name)

These fields are used throughout the UI for displaying contact identities:

```javascript
// Example of display hierarchy in UI components
${contact.name || contact.username || `${contact.address.slice(0,8)}...${contact.address.slice(-6)}`}
```

The display hierarchy is:

1. Show name if available
2. Otherwise show username
3. If neither exists, show truncated address

### SenderInfo Updates

When receiving messages, SenderInfo can update Contact fields, but only conditionally:

```javascript
// In processChats when receiving messages
if (!contact.username && contact.senderInfo.username) {
  contact.username = contact.senderInfo.username;
}
```

Key points:

- Only updates Contact.username if it's not already set
- Preserves any manually set or existing username
- Acts as a one-time population of the display fields

### SenderInfo Dynamic Updates

When a sender edits their profile information, the updates are handled as follows:

```javascript
// In processChats when receiving a new message
if (payload.senderInfo) {
  // Always overwrite the entire senderInfo object with the latest version
  contact.senderInfo = JSON.parse(JSON.stringify(payload.senderInfo)); // make a copy

  // But only update the display username if not already set
  if (!contact.username && contact.senderInfo.username) {
    contact.username = contact.senderInfo.username;
  }
}
```

Key points about senderInfo updates:

- The complete senderInfo object is **always** overwritten with the latest version
- This means profile updates (name, email, phone, etc.) are automatically reflected
- However, the contact's display fields (username/name) remain stable once set
- This design allows profile info to stay current while maintaining UI consistency

This creates two layers of contact information:

1. **Stable Display Layer**: `contact.username` and `contact.name` - set once, stays consistent
2. **Dynamic Profile Layer**: `contact.senderInfo` - always updated with latest profile information

### Username and Address Relationship

Important to note that usernames and addresses are independent entities:

```mermaid
sequenceDiagram
    participant User
    participant Network
    participant Blockchain

    User->>Network: Register username "alice"
    Note over Network: Create username hash
    Network->>Blockchain: Store registration tx:<br/>- username<br/>- username hash<br/>- address<br/>- public keys
    Note over Blockchain: Username now linked<br/>to address, but not<br/>derived from it

    User->>Network: Look up username
    Network->>Blockchain: Query by username hash
    Blockchain-->>Network: Return linked address
    Network-->>User: Address for username
```

Key points:

- Addresses are cryptographic keys
- Usernames are human-readable aliases
- They're connected through registration but not cryptographically derived
- A username lookup is a separate network query
- The display name in the UI can be different from the registered username

This means:

1. The same address can have different usernames over time
2. The display name shown in chat can be different from the registered username
3. Profile updates (senderInfo) don't affect the blockchain username registration

### Full Profile View

SenderInfo is used directly only in the contact info modal to show complete profile:

```javascript
document.getElementById("contactInfoUsername").textContent =
  senderInfo.username || "Not provided";
document.getElementById("contactInfoName").textContent =
  senderInfo.name || "Not provided";
// ... other fields like email, phone, etc.
```

### Design Benefits

This dual-field design allows:

- Quick access to display names without accessing senderInfo
- Preservation of manually set names/usernames
- Full profile information when needed
- Separation between display identity and full profile information

```mermaid
sequenceDiagram
    participant Message
    participant Contact
    participant UI

    Message->>Contact: Receive message with senderInfo
    Note over Contact: Check if username/name exist
    alt No existing username
        Contact->>Contact: Update username from senderInfo
    end
    Note over Contact: Store complete senderInfo

    UI->>Contact: Request display name
    Contact-->>UI: Return name || username || truncated address

    UI->>Contact: Open contact info
    alt Has senderInfo
        Contact-->>UI: Show full profile from senderInfo
    else No senderInfo
        Contact-->>UI: Cannot show full profile
    end
```

### Profile Updates and Message Flow

The diagram below shows how user profile information flows from account updates to messages:

```mermaid
sequenceDiagram
    participant User
    participant AccountForm
    participant Message
    participant Recipient

    User->>AccountForm: Update profile info
    AccountForm->>AccountForm: Save to myData.account

    Note over User: Later when sending message
    User->>Message: Send message
    Message->>Message: Include current myData.account<br/>as senderInfo
    Message->>Recipient: Send encrypted message<br/>with current senderInfo
```

Key aspects of profile information flow:

**Profile Management:**

- Users can update their profile info anytime through the Account form
- Profile includes: name, email, phone, linkedin, and x (Twitter)
- Changes are stored locally in `myData.account`
- Profile updates don't affect your blockchain-registered username

**Message Sending:**

- Each message automatically includes your current profile info as `senderInfo`
- The profile info sent is a snapshot of your `myData.account` at send time
- Previous messages retain the profile info from when they were sent
- Profile info is encrypted along with the message content

**Profile Updates:**

- Changes to your profile are reflected in all future messages
- Updating your profile doesn't modify previously sent messages
- Recipients see your latest profile info only when you send new messages
- You can update your profile before sending specific messages

**Security and Privacy:**

- Profile info is encrypted for each recipient separately
- Only the intended recipient can decrypt your profile info
- You control what profile info to include by updating your account
- Profile info is separate from your cryptographic identity (address)
