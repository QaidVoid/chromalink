<script lang="ts">
  import { goto } from "$app/navigation";
  import Canvas from "$lib/components/Canvas.svelte";
  import { getSocket } from "$lib/socket";
  import {
    currentRoom,
    isAdmin,
    isRoomLocked,
    selectedColor,
    users,
  } from "$lib/stores";
  import { onDestroy, onMount } from "svelte";
  import { leaveRoom, resetState } from "$lib/utils";

  let colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#52489C",
    "#F08A5D",
    "#B83B5E",
    "#6A2C70",
    "#000000",
    "#FFFFFF",
    "#808080",
    "#FFB6C1",
  ];

  let showKickConfirmModal = $state(false);
  let userToKick = $state<{ id: string; nickname: string } | null>(null);

  onMount(() => {
    const socket = getSocket();
    if (!socket) {
      goto("/join");
      return;
    }
  });

  onDestroy(() => {
    resetState();
  });

  const lockRoom = () => {
    getSocket()?.emit("lock-room");
  };

  const unlockRoom = () => {
    getSocket()?.emit("unlock-room");
  };

  const kickUser = (userId: string, nickName: string) => {
    getSocket()?.emit("kick-user", { userId, nickName });
  };

  const confirmKick = (user: { id: string; nickname: string }) => {
    userToKick = user;
    showKickConfirmModal = true;
  };

  const handleKick = () => {
    if (userToKick) {
      kickUser(userToKick.id, userToKick.nickname);
      showKickConfirmModal = false;
      userToKick = null;
    }
  };

  const cancelKick = () => {
    showKickConfirmModal = false;
    userToKick = null;
  };

  const deleteRoom = () => {
    getSocket()?.emit("delete-room");
  };

  const clearBoard = () => {
    getSocket()?.emit("clear-board");
  };

  const downloadImage = () => {
    const dataUrl = (
      document.querySelector("canvas") as HTMLCanvasElement
    ).toDataURL();
    const link = document.createElement("a");
    link.download = `pixel-art-${$currentRoom?.name || "board"}.png`;
    link.href = dataUrl;
    link.click();
  };
</script>

<div
  class="h-screen flex flex-col bg-linear-to-br from-slate-50 via-purple-50 to-blue-50 overflow-hidden"
>
  {#if showKickConfirmModal && userToKick}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div class="text-center mb-4">
          <div
            class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <span class="icon-[mdi--alert-outline] text-red-600 text-2xl"
            ></span>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">Kick User?</h3>
          <p class="text-gray-600 text-sm">
            Are you sure you want to kick <span class="font-semibold"
              >{userToKick.nickname}</span
            >?
          </p>
        </div>
        <div class="flex gap-3">
          <button
            onclick={handleKick}
            class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            Kick
          </button>
          <button
            onclick={cancelKick}
            class="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <div
    class="shrink-0 bg-white border-b-2 border-purple-100 shadow-md px-6 py-4"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1
          class="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2"
        >
          {$currentRoom?.name || "Pixel Art Board"}
          {#if $isRoomLocked}
            <span class="icon-[mdi--lock-outline] text-orange-500 text-xl"
            ></span>
          {/if}
        </h1>
      </div>

      <div class="flex items-center gap-3">
        {#if $isAdmin}
          <button
            onclick={clearBoard}
            class="flex items-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
            title="Clear Board"
          >
            <span class="icon-[mdi--trash-outline]"></span>
            Clear
          </button>

          {#if $isRoomLocked}
            <button
              onclick={unlockRoom}
              class="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
              title="Unlock Room"
            >
              <span class="icon-[mdi--lock-open-outline]"></span>
              Unlock
            </button>
          {:else}
            <button
              onclick={lockRoom}
              class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
              title="Lock Room"
            >
              <span class="icon-[mdi--lock-outline]"></span>
              Lock
            </button>
          {/if}

          <button
            onclick={deleteRoom}
            class="w-full flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <span class="icon-[mdi--delete-outline]"></span>
            Delete Room
          </button>

          <div class="h-8 w-px bg-gray-300"></div>
        {/if}

        <div
          class="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200"
        >
          <span class="icon-[mdi--account-multiple-outline] text-blue-600"
          ></span>
          <span class="font-bold text-blue-600">{$users.length}</span>
        </div>

        <button
          onclick={downloadImage}
          class="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm font-medium"
        >
          <span class="icon-[mdi--tray-download]"></span>
          Download
        </button>

        <button
          onclick={leaveRoom}
          class="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors shadow-sm font-medium"
        >
          <span class="icon-[mdi--logout]"></span>
          Leave
        </button>
      </div>
    </div>
  </div>

  <div class="flex-1 flex overflow-hidden">
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="h-full w-full flex items-center justify-center">
        <div
          class="bg-white rounded-xl shadow-xl p-3 border-2 border-purple-200 max-h-full flex items-center justify-center"
        >
          <Canvas />
        </div>
      </div>
    </div>

    <div
      class="w-80 shrink-0 bg-white border-l-2 border-purple-100 shadow-lg overflow-y-auto"
    >
      <div class="p-6 space-y-6">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <span class="icon-[mdi--palette] text-purple-600 text-xl"></span>
            <h2 class="text-xl font-bold text-gray-800">Colors</h2>
          </div>
          <div class="grid grid-cols-4 gap-2 mb-4">
            {#each colors as color}
              <button
                onclick={() => selectedColor.set(color)}
                class={`w-full aspect-square rounded-lg transition-all hover:scale-105 ${
                  $selectedColor === color
                    ? "ring-4 ring-purple-500 scale-105 shadow-lg"
                    : "ring-2 ring-gray-200 hover:ring-purple-300"
                }`}
                style={`background-color: ${color}`}
                aria-label={color}
              ></button>
            {/each}
          </div>
          <div class="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p class="text-xs text-gray-600 mb-2 font-medium">Selected</p>
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-lg ring-2 ring-gray-300 shadow-sm shrink-0"
                style={`background-color: ${$selectedColor}`}
              ></div>
              <span class="font-mono text-sm font-bold text-gray-700"
                >{$selectedColor}</span
              >
            </div>
          </div>
        </div>

        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p
            class="text-sm text-blue-800 font-bold mb-2 flex items-center gap-1"
          >
            <span class="icon-[mdi--lightbulb-outline] text-yellow-500"></span>
            Quick Tips
          </p>
          <ul class="text-xs text-blue-700 space-y-1.5">
            <li>• Click to paint pixels</li>
            <li>• Choose colors from palette</li>
            <li>• See live collaboration</li>
            <li>• Download when done</li>
          </ul>
        </div>

        <div class="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
          <p
            class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"
          >
            <span class="icon-[mdi--account-group]"></span>
            Users ({$users.length})
          </p>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            {#each $users as user}
              <div
                class="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <span class="icon-[mdi--account] text-slate-600 shrink-0"
                  ></span>
                  <span class="text-sm text-slate-700 truncate"
                    >{user.nickname}</span
                  >
                </div>
                {#if $isAdmin && user.id !== getSocket()?.id}
                  <button
                    onclick={() => confirmKick(user)}
                    class="shrink-0 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors ml-2"
                    title="Kick {user.nickname}"
                  >
                    <span class="icon-[mdi--close] text-xs"></span>
                  </button>
                {/if}
              </div>
            {/each}
            {#if $users.length === 0}
              <p class="text-xs text-slate-500 text-center py-2">
                No users online
              </p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
