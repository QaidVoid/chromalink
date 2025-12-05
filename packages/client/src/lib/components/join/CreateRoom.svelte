<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import { showError } from "$lib/stores";
  import { joinPageState, newRoomData } from "$lib/stores/join";
  import { validateCreateRoom } from "$lib/api/validation";

  let { onCancel }: { onCancel?: () => void } = $props();

  const createRoom = () => {
    const socket = getSocket();
    if (!socket) return;

    const validation = validateCreateRoom($newRoomData);
    if (!validation.success) {
      showError(validation.error);
      return;
    }

    socket.emit("create-room", {
      roomId: validation.data.id,
      roomName: validation.data.name,
      ...($newRoomData.password && { password: $newRoomData.password }),
    });
    joinPageState.set("browsing");
  };
</script>

<div class="space-y-6">
  <div>
    <label
      for="room-id"
      class="block text-base font-bold mb-3"
      style="color: var(--text-primary);">Room ID (no spaces)</label
    >
    <input
      id="room-id"
      bind:value={$newRoomData.id}
      placeholder="my-awesome-room"
      class="w-full px-5 py-4 border-2 rounded-xl focus:outline-none text-lg transition-colors"
      style="background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-primary);"
    />
  </div>
  <div>
    <label
      for="room-name"
      class="block text-base font-bold mb-3"
      style="color: var(--text-primary);">Room Name</label
    >
    <input
      id="room-name"
      bind:value={$newRoomData.name}
      placeholder="My Awesome Room"
      class="w-full px-5 py-4 border-2 rounded-xl focus:outline-none text-lg transition-colors"
      style="background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-primary);"
    />
  </div>
  <div>
    <label
      for="room-password"
      class="block text-base font-bold mb-3"
      style="color: var(--text-primary);">Room Password (Optional)</label
    >
    <input
      id="room-password"
      type="password"
      bind:value={$newRoomData.password}
      placeholder="Leave empty for no password"
      class="w-full px-5 py-4 border-2 rounded-xl focus:outline-none text-lg transition-colors"
      style="background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-primary);"
    />
  </div>
  <div class="flex gap-4">
    <button
      onclick={createRoom}
      class="flex-1 py-4 text-white rounded-xl transition-all font-bold text-lg shadow-lg"
      style="background: var(--accent-primary);"
    >
      Create Room
    </button>
    <button
      onclick={onCancel}
      class="flex-1 py-4 rounded-xl transition-all font-bold text-lg"
      style="background: var(--bg-tertiary); color: var(--text-primary);"
    >
      Cancel
    </button>
  </div>
</div>
