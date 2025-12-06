<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import { chatMessages, showError } from "$lib/stores";

  let messageInput = $state("");
  let chatContainer: HTMLDivElement;

  const sendMessage = () => {
    const socket = getSocket();
    if (!socket) {
      showError("Not connected to server");
      return;
    }

    const trimmed = messageInput.trim();
    if (!trimmed) return;

    socket.emit("send-message", { message: trimmed });
    messageInput = "";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Auto-scroll to bottom when new messages arrive
  $effect(() => {
    if (chatContainer && $chatMessages.length > 0) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
</script>

<div
  class="flex flex-col h-full border-2 rounded-lg"
  style="background: var(--bg-secondary); border-color: var(--border-primary);"
>
  <div class="p-3 border-b-2" style="border-color: var(--border-primary);">
    <h3
      class="font-bold flex items-center gap-2"
      style="color: var(--text-primary);"
    >
      <span class="icon-[mdi--chat]"></span>
      Chat
    </h3>
  </div>

  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-3 space-y-2">
    {#each $chatMessages as msg}
      <div class="p-2 rounded-lg" style="background: var(--bg-tertiary);">
        <div class="flex items-baseline gap-2 mb-1">
          <span
            class="font-semibold text-sm"
            style="color: var(--accent-primary);"
          >
            {msg.nickname}
          </span>
          <span class="text-xs" style="color: var(--text-tertiary);">
            {formatTime(msg.timestamp)}
          </span>
        </div>
        <p class="text-sm wrap-break-word" style="color: var(--text-primary);">
          {msg.message}
        </p>
      </div>
    {:else}
      <div class="text-center py-8" style="color: var(--text-tertiary);">
        <span class="icon-[mdi--chat-outline] text-4xl mb-2"></span>
        <p class="text-sm">No messages yet. Start the conversation!</p>
      </div>
    {/each}
  </div>

  <div class="p-3 border-t-2" style="border-color: var(--border-primary);">
    <form
      onsubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      class="flex gap-2"
    >
      <input
        type="text"
        bind:value={messageInput}
        placeholder="Type a message..."
        maxlength={500}
        class="flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none text-sm min-w-0"
        style="background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-primary);"
      />
      <button
        type="submit"
        disabled={!messageInput.trim()}
        class="px-3 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        style="background: var(--accent-primary);"
        title="Submit message"
      >
        <span class="icon-[mdi--send] text-sm"></span>
      </button>
    </form>
  </div>
</div>
