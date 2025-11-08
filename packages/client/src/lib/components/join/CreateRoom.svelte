<script lang="ts">
  import { getSocket } from "$lib/socket";
  import { joinPageState, newRoomData } from "$lib/stores/join";

  let { onCancel }: { onCancel?: () => void } = $props();

  const createRoom = () => {
    if ($newRoomData.id && $newRoomData.name) {
      getSocket()?.emit("create-room", {
        roomId: $newRoomData.id,
        roomName: $newRoomData.name,
        ...($newRoomData.password && { password: $newRoomData.password }),
      });
      joinPageState.set("browsing");
    }
  };
</script>

<div class="space-y-6">
  <div>
    <label for="room-id" class="block text-base font-bold text-gray-700 mb-3"
      >Room ID (no spaces)</label
    >
    <input
      id="room-id"
      bind:value={$newRoomData.id}
      placeholder="my-awesome-room"
      class="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition-colors"
    />
  </div>
  <div>
    <label for="room-name" class="block text-base font-bold text-gray-700 mb-3"
      >Room Name</label
    >
    <input
      id="room-name"
      bind:value={$newRoomData.name}
      placeholder="My Awesome Room"
      class="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition-colors"
    />
  </div>
  <div>
    <label
      for="room-password"
      class="block text-base font-bold text-gray-700 mb-3">Room Password</label
    >
    <input
      id="room-password"
      bind:value={$newRoomData.password}
      placeholder="My Awesome Room"
      class="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition-colors"
    />
  </div>
  <div class="flex gap-4">
    <button
      onclick={createRoom}
      class="flex-1 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg shadow-lg shadow-purple-300/50"
    >
      Create Room
    </button>
    <button
      onclick={onCancel}
      class="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold text-lg"
    >
      Cancel
    </button>
  </div>
</div>
