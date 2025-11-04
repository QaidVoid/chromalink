<script lang="ts">
  import { goto } from "$app/navigation";
  import { getSocket, initSocket } from "$lib/socket";
  import { currentRoom, rooms } from "$lib/stores";
  import { onMount } from "svelte";

  let showCreateRoom = $state(false);
  let newRoomId = $state("");
  let newRoomName = $state("");

  onMount(() => {
    const socket = initSocket();
    socket.emit("get-rooms");
    $effect(() => {
      if ($currentRoom) goto(`/room/${$currentRoom.id}`);
    });
  });

  const joinRoom = (roomId: string) => {
    getSocket()?.emit("join-room", { roomId });
  };

  const createRoom = () => {
    if (newRoomId && newRoomName) {
      getSocket()?.emit("create-room", {
        roomId: newRoomId,
        roomName: newRoomName,
      });
      newRoomId = "";
      newRoomName = "";
      showCreateRoom = false;
    }
  };
</script>

<div
  class="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center p-8 relative overflow-hidden"
>
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <div
      class="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
    ></div>
  </div>

  <div
    class="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl w-full relative z-10 border border-purple-100"
  >
    <div class="text-center mb-10">
      <h1
        class="text-5xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3"
      >
        🎨 Pixel Art Rooms
      </h1>
      <p class="text-gray-600 text-lg">Choose a room or create your own</p>
    </div>

    {#if !showCreateRoom}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {#each $rooms as room}
          <button
            onclick={() => joinRoom(room.id)}
            class="p-7 bg-linear-to-br from-slate-50 to-purple-50 rounded-2xl hover:from-purple-50 hover:to-blue-50 transition-all border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-200/50 text-left group"
          >
            <div class="flex items-center justify-between mb-3">
              <h3
                class="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors"
              >
                {room.name}
              </h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-purple-500 group-hover:scale-110 transition-transform"
              >
                <path
                  d="M21 20V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v12a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 20z"
                ></path>
                <polyline points="3 14 12 20 21 14"></polyline>
                <polyline points="3 10 12 4 21 10"></polyline>
              </svg>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span class="text-base font-medium">{room.userCount} online</span>
            </div>
          </button>
        {/each}
      </div>

      <button
        onclick={() => (showCreateRoom = true)}
        class="w-full py-5 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Create New Room
      </button>
    {:else}
      <div class="space-y-6">
        <div>
          <label
            for="room-id"
            class="block text-base font-bold text-gray-700 mb-3"
            >Room ID (no spaces)</label
          >
          <input
            id="room-id"
            bind:value={newRoomId}
            placeholder="my-awesome-room"
            class="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition-colors"
          />
        </div>
        <div>
          <label
            for="room-name"
            class="block text-base font-bold text-gray-700 mb-3"
            >Room Name</label
          >
          <input
            id="room-name"
            bind:value={newRoomName}
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
            onclick={() => (showCreateRoom = false)}
            class="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold text-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
