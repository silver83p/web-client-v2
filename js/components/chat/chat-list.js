function renderChats() {
  const root = document.getElementById("root");
  const chats = state.getState().chats;

  root.innerHTML = `
    <header class="header">
      <div class="flex-between">
        <h1>Chats</h1>
        <button class="search-button">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </div>
      <div class="search-container">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input type="text" class="search-input" placeholder="Search messages...">
      </div>
    </header>
    
    <div class="chat-list">
      ${
        chats.length === 0
          ? `
        <div class="no-messages">
          No Messages Yet
        </div>
      `
          : Object.values(chats)
              .map(
                (chat) => `
            <div class="chat-item" data-id="${chat.address}">
              <div class="avatar">
                <span>${chat.name ? chat.name[0] : ""}</span>
                <!-- <span class="status-indicator ${
                  chat.status === "online" ? "status-online" : "status-offline"
                }"></span> -->
              </div>
              <div class="chat-content">
                <div class="chat-header">
                  <span class="chat-name">${chat.name || chat.username || `${chat.address.slice(0,8)}...${chat.address.slice(-6)}`}</span>
                  <span class="chat-time">${AppUtils.formatTime(
                    chat.timestamp
                  )}</span>
                </div>
                <p class="chat-message">${chat.message}</p>
              </div>
              ${
                chat.unread
                  ? `
                <div class="unread-badge">${chat.unread}</div>
              `
                  : ""
              }
            </div>
          `
              )
              .join("")
      }
    </div>
    
    <button class="floating-button">
      <span>+</span>
      <span>New Chat</span>
    </button>
  `;

  // Add event listeners
  document.querySelectorAll(".chat-item").forEach((item) => {
    item.addEventListener("click", () => {
      const address = item.getAttribute("data-id");
      state.navigate(`/chats/${address}`);
    });
  });
}
