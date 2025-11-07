<script lang="ts">
  import { goto } from "$app/navigation";
  import { getSocket, initSocket } from "$lib/socket";
  import { currentRoom, nickname, rooms } from "$lib/stores";
  import { onMount } from "svelte";

  let showCreateRoom = $state(false);
  let newRoomId = $state("");
  let newRoomName = $state("");
  let newRoomPassword = $state("");
  let selectedRoomId = $state("");
  let showPasswordModal = $state(false);
  let password = $state("");
  let showNicknameModal = $state($nickname.trim().length === 0);
  let newNickname = $state("");

  onMount(() => {
    const socket = initSocket();
    socket.emit("get-rooms");
    $effect(() => {
      if ($currentRoom) goto(`/room/${$currentRoom.id}`);
    });
  });

  const setUserNickname = () => {
    if (newNickname.trim()) {
      getSocket()?.emit("set-nickname", { nickname: newNickname });
      showNicknameModal = false;
      nickname.set(newNickname);
    }
  };

  const joinRoom = (roomId: string, hasPassword: boolean) => {
    if (hasPassword) {
      selectedRoomId = roomId;
      showPasswordModal = true;
      password = "";
    } else {
      getSocket()?.emit("join-room", { roomId });
    }
  };

  const joinRoomWithPassword = () => {
    if (selectedRoomId && password.trim()) {
      getSocket()?.emit("join-room", { roomId: selectedRoomId, password });
      showPasswordModal = false;
      password = "";
      selectedRoomId = "";
    }
  };

  const createRoom = () => {
    if (newRoomId && newRoomName) {
      getSocket()?.emit("create-room", {
        roomId: newRoomId,
        roomName: newRoomName,
        ...(newRoomPassword && { password: newRoomPassword }),
      });
      newRoomId = "";
      newRoomName = "";
      showCreateRoom = false;
    }
  };

  const closePasswordModal = () => {
    showPasswordModal = false;
    password = "";
    selectedRoomId = "";
  };
</script>

{#if showNicknameModal}
  <div class="min-h-screen bg-linear-to-br from-purple-100 to-blue-100 flex items-center justify-center p-8">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-linear-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="icon-[mdi--account-outline] text-white text-2xl"></span>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          Welcome!
        </h1>
        <p class="text-gray-600">Choose your nickname</p>
      </div>

      <div class="space-y-4">
        <input
          type="text"
          bind:value={newNickname}
          onkeypress={(e) => e.key === 'Enter' && setUserNickname()}
          placeholder="Enter your nickname..."
          maxlength={20}
          class="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
        />
        <button
          onclick={setUserNickname}
          disabled={!newNickname.trim()}
          class="w-full py-3 bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
{/if}

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

  {#if showPasswordModal}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            Enter Room Password
          </h2>
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
              bind:value={password}
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
              onclick={closePasswordModal}
              class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <div
    class="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl w-full relative z-10 border border-purple-100"
  >
    <div class="text-center mb-10">
      <h1
        class="text-5xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 flex items-center justify-center"
      >
        <span
          class="icon-[mdi--color] mask-(--svg) bg-linear-to-r from-purple-600 to-blue-600"
        ></span>
        <span>Pixel Art Rooms</span>
      </h1>
      <p class="text-gray-600 text-lg">Choose a room or create your own</p>
    </div>

    {#if !showCreateRoom}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {#each $rooms as room}
          <button
            onclick={() => joinRoom(room.id, room.hasPassword)}
            class="relative p-7 bg-linear-to-br from-slate-50 to-purple-50 rounded-2xl hover:from-purple-50 hover:to-blue-50 transition-all border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-200/50 text-left group"
          >
            <div class="flex items-center justify-between mb-3">
              <h3
                class="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors"
              >
                {room.name}
              </h3>
              {#if room.isLocked}
                <span class="icon-[mdi--lock-outline] text-orange-600 text-2xl"
                ></span>
              {:else}
                <span
                  class="icon-[mdi--lock-open-outline] text-blue-600 text-2xl"
                ></span>
              {/if}
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <span class="icon-[mdi--account-multiple-outline]"></span>
              <span class="text-base font-medium">{room.userCount} online</span>
            </div>

            {#if room.hasPassword}
              <div
                class="absolute bottom-3 right-3 flex items-center gap-1 text-yellow-600"
              >
                <span class="icon-[mdi--key] text-sm"></span>
                <span class="text-xs font-medium">Protected</span>
              </div>
            {/if}
          </button>
        {/each}
      </div>

      <button
        onclick={() => (showCreateRoom = true)}
        class="w-full py-5 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/50"
      >
        <span class="icon-[mdi--plus]"></span>
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
        <div>
          <label
            for="room-password"
            class="block text-base font-bold text-gray-700 mb-3"
            >Room Password</label
          >
          <input
            id="room-password"
            bind:value={newRoomPassword}
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
