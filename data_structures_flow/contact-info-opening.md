# Contact Info Opening Flow

This document describes the flow for opening contact information from the contacts list.

## UI Layout

```ascii
Before (Contacts List):              After (Contact Info):
+-------------------------+         +-------------------------+
|       Contacts         |         |    Contact Info     [⋮] | <- Menu button
+-------------------------+         +-------------------------+
| ┌─────────────────────┐|         | Username: john         |
| │ [Avatar]  john     ││         | Name: Not provided      |
| │ 0x1234...5678      ││         | Email: Not provided     |
| └─────────────────────┘|         | Phone: Not provided     |
| ┌─────────────────────┐|         | LinkedIn: Not provided  |
| │ [Avatar]  bob      ││         | X: Not provided         |
| │ 0x9876...4321      ││         |                         |
| └─────────────────────┘|         |                         |
+-------------------------+         +-------------------------+

Menu Dropdown:
+------------------+
| ✏️ Edit          |
| 💬 Open Chat     |
+------------------+
```

## Implementation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CL as Contact List
    participant CI as Contact Info Modal
    participant M as Menu
    participant D as myData

    U->>CL: Clicks contact item
    CL->>CI: Opens contact info modal
    CI->>D: Fetch contact details
    D-->>CI: Return contact data
    CI->>CI: Display contact info

    Note over CI,M: User can interact with menu
    U->>M: Opens menu dropdown
    M-->>U: Show options (Edit/Chat)

    alt User clicks "Open Chat"
        U->>M: Clicks Open Chat
        M->>CI: Close contact info
        CI->>CL: Open chat modal
    end
```

## Menu Implementation

The menu button in the top-right corner of the contact info modal provides these actions:

- Edit Contact (future implementation)
- Open Chat

## Event Flow

1. User clicks a contact in the contacts list
2. Contact info modal opens showing contact details
3. User can:
   - View contact information
   - Use menu to open chat
   - Close modal to return to contacts list
