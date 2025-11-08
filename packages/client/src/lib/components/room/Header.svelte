<script lang="ts">
  import { currentRoom, isAdmin, isRoomLocked, users } from "$lib/stores";
  import { leaveRoom } from "$lib/utils";
  import { roomActions } from "$lib/utils/room";

  let { onDownload } = $props();
</script>

<div class="shrink-0 bg-white border-b-2 border-purple-100 shadow-md px-6 py-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h1
        class="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2"
      >
        {$currentRoom?.name || "Pixel Art Board"}
        {#if $isRoomLocked}
          <span class="icon-[mdi--lock-outline] text-orange-500 text-xl"></span>
        {/if}
      </h1>
    </div>

    <div class="flex items-center gap-3">
      {#if $isAdmin}
        <button
          onclick={roomActions.clearBoard}
          class="flex items-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
          title="Clear Board"
        >
          <span class="icon-[mdi--trash-outline]"></span>
          Clear
        </button>

        {#if $isRoomLocked}
          <button
            onclick={roomActions.unlockRoom}
            class="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
            title="Unlock Room"
          >
            <span class="icon-[mdi--lock-open-outline]"></span>
            Unlock
          </button>
        {:else}
          <button
            onclick={roomActions.lockRoom}
            class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
            title="Lock Room"
          >
            <span class="icon-[mdi--lock-outline]"></span>
            Lock
          </button>
        {/if}

        <button
          onclick={roomActions.deleteRoom}
          class="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <span class="icon-[mdi--delete-outline]"></span>
          Delete Room
        </button>

        <div class="h-8 w-px bg-gray-300"></div>
      {/if}

      <div
        class="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200"
      >
        <span class="icon-[mdi--account-multiple-outline] text-blue-600"></span>
        <span class="font-bold text-blue-600">{$users.length}</span>
      </div>

      <button
        onclick={onDownload}
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
