<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import { joinPageState, password, selectedRoomId } from "$lib/stores/join";

  let { onCancel }: { onCancel?: () => void } = $props();

  const joinRoomWithPassword = () => {
    const socket = getSocket();
    if (!socket || !$selectedRoomId || !$password.trim()) return;

    socket.emit("join-room", {
      roomId: $selectedRoomId,
      password: $password,
    });
    joinPageState.set("browsing");
  };
</script>

<div
  class="fixed inset-0 flex items-center justify-center z-50 p-4"
  style="background: rgba(0, 0, 0, 0.5);"
>
  <div
    class="rounded-2xl shadow-2xl p-8 max-w-md w-full"
    style="background: var(--bg-secondary);"
  >
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">
        Enter Room Password
      </h2>
      <p style="color: var(--text-secondary);">
        This room is protected with a password
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <label
          for="password"
          class="block text-sm font-medium mb-2"
          style="color: var(--text-secondary);"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          bind:value={$password}
          placeholder="Enter password..."
          class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
          style="background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-primary);"
          onkeypress={(e) => e.key === "Enter" && joinRoomWithPassword()}
        />
      </div>

      <div class="flex gap-3 pt-2">
        <button
          onclick={joinRoomWithPassword}
          disabled={!password}
          class="flex-1 py-3 text-white rounded-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: var(--accent-primary);"
        >
          Join Room
        </button>
        <button
          onclick={onCancel}
          class="flex-1 py-3 rounded-xl transition-all font-bold"
          style="background: var(--bg-tertiary); color: var(--text-primary);"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
