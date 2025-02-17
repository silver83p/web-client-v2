## Message Data Structures

```mermaid
classDiagram
    class MessagePayload {
        message: string
        encrypted: boolean
        encryptionMethod: string
        public: string
        pqEncSharedKey: string
        sent_timestamp: number
        senderInfo: SenderInfo
    }

    class SenderInfo {
        username: string
        name: string
        email: string
        phone: string
        linkedin: string
        x: string
    }

    class TransactionMessage {
        type: string
        from: string
        to: string
        amount: bigint
        chatId: string
        message: string
        xmessage: MessagePayload
        timestamp: number
        network: string
        fee: bigint
        sign: SignatureData
    }

    class SignatureData {
        owner: string
        sig: string
    }

    class ProcessedMessage {
        message: string
        timestamp: number
        sent_timestamp: number
        my: boolean
    }

    MessagePayload --> SenderInfo
    TransactionMessage --> MessagePayload
    TransactionMessage --> SignatureData
```

## Message Flow with Data

Key Points:

- Message Creation:

  - Sender creates MessagePayload with encrypted content
  - Wraps payload in TransactionMessage for network transmission
  - Adds toll payment and signatures

- Data Transformation:

  - Raw message → Encrypted MessagePayload → Signed TransactionMessage
  - Network processes transaction and toll payment
  - Recipient decrypts back to ProcessedMessage format

- Storage:
  - Final message stored in recipient's contact.messages array
  - Updates chat list and unread counts
  - Maintains original timestamps for ordering

```mermaid
sequenceDiagram
    participant Sender
    participant Gateway
    participant Recipient

    Note over Sender: Create MessagePayload

    Sender->>Sender: 1. Prepare payload:<br/>MessagePayload {<br/>  message: "Hello",<br/>  encrypted: true,<br/>  encryptionMethod: "xchacha20poly1305",<br/>  senderInfo: {...}<br/>}

    Sender->>Sender: 2. Create Transaction:<br/>TransactionMessage {<br/>  type: "message",<br/>  xmessage: MessagePayload,<br/>  chatId: hash(from+to),<br/>  ...<br/>}

    Sender->>Gateway: 3. postChatMessage(TransactionMessage)

    Gateway->>Recipient: 4. Recipient polls and gets<br/>TransactionMessage

    Recipient->>Recipient: 5. processChats():<br/>Decrypts to ProcessedMessage {<br/>  message: "Hello",<br/>  timestamp: now(),<br/>  sent_timestamp: original,<br/>  my: false<br/>}

    Note over Recipient: 6. Add to contact.messages[]
```

## Message Discovery Flow

Key Points:

- Polling Strategy:

  - Regular checks for new messages via pollChats()
  - 5-second intervals when actively chatting
  - 30-second intervals when idle
  - Uses chatTimestamp to only fetch new messages

- Two-Step Message Retrieval:

  - Step 1: Get list of new messages by sender
  - Step 2: Fetch full message content for each sender
  - Efficient batching of messages per sender

- Message Processing:
  - Decrypts messages using hybrid encryption
  - Updates contact's unread count
  - Updates chat list order
  - Saves to localStorage for persistence

```mermaid
sequenceDiagram
    participant Recipient
    participant Gateway
    participant Storage

    Note over Recipient: pollChats() runs every<br/>5s when chatting,<br/>30s when idle

    Recipient->>Gateway: 1. getChats(address, timestamp)
    Note over Gateway: Finds messages newer than<br/>recipient's last chatTimestamp

    Gateway-->>Recipient: 2. Returns {<br/>chats: {<br/>  senderAddress: messageId,<br/>  senderAddress2: messageId2<br/>}}

    alt Has New Messages
        loop For each sender
            Recipient->>Gateway: 3. queryNetwork(<br/>/messages/messageId/timestamp)
            Gateway-->>Recipient: 4. Returns {<br/>messages: [<br/>  {type: "message",<br/>   xmessage: payload,...},<br/>  {...}<br/>]}

            Recipient->>Recipient: 5. processChats():<br/>- Decrypt messages<br/>- Update contact.unread++<br/>- Update myData.chats

            Recipient->>Storage: 6. Save to localStorage
        end
        Note over Recipient: Update UI and show<br/>notification if needed
    end

    Note over Recipient: Update myAccount.chatTimestamp<br/>to latest message timestamp
```

## Sequence Diagram Example

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob

    %% Solid arrow for request
    A->>B: Hello Bob!

    %% Dashed arrow for response
    B-->>A: Hi Alice!

    %% Note over one participant
    Note over A: Alice thinks

    %% Note over multiple participants
    Note over A,B: They are greeting

    %% Alternative path (dotted box)
    alt is morning
        A->>B: Good morning!
    end
```