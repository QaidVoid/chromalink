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
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
>
  <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Enter Room Password</h2>
      <p class="text-gray-600">This room is protected with a password</p>
    </div>

    <div class="space-y-4">
      <div>
        <label
          for="password"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          bind:value={$password}
          placeholder="Enter password..."
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          onkeypress={(e) => e.key === "Enter" && joinRoomWithPassword()}
        />
      </div>

      <div class="flex gap-3 pt-2">
        <button
          onclick={joinRoomWithPassword}
          disabled={!password}
          class="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-bold"
        >
          Join Room
        </button>
        <button
          onclick={onCancel}
          class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
