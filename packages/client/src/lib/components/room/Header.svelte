<script lang="ts">
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import { currentRoom, isAdmin, isRoomLocked, users } from "$lib/stores";
  import { leaveRoom } from "$lib/utils";
  import { roomActions } from "$lib/utils/room";

  let { onDownload } = $props();
</script>

<div
  class="shrink-0 border-b-2 shadow-md px-6 py-4"
  style="background: var(--bg-secondary); border-color: var(--border-primary);"
>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h1
        class="text-3xl font-bold flex items-center gap-2"
        style="color: var(--accent-primary);"
      >
        {$currentRoom?.name || "Pixel Art Board"}
        {#if $isRoomLocked}
          <span
            class="icon-[mdi--lock-outline] text-xl"
            style="color: var(--accent-warning);"
          ></span>
        {/if}
      </h1>
    </div>

    <div class="flex items-center gap-3">
      <ThemeToggle />
      {#if $isAdmin}
        <button
          onclick={roomActions.clearBoard}
          class="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
          style="background: var(--accent-error);"
          title="Clear Board"
        >
          <span class="icon-[mdi--trash-outline]"></span>
          Clear
        </button>

        {#if $isRoomLocked}
          <button
            onclick={roomActions.unlockRoom}
            class="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
            style="background: var(--accent-success);"
            title="Unlock Room"
          >
            <span class="icon-[mdi--lock-open-outline]"></span>
            Unlock
          </button>
        {:else}
          <button
            onclick={roomActions.lockRoom}
            class="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
            style="background: var(--accent-warning);"
            title="Lock Room"
          >
            <span class="icon-[mdi--lock-outline]"></span>
            Lock
          </button>
        {/if}

        <button
          onclick={roomActions.deleteRoom}
          class="flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-all text-sm font-medium"
          style="background: var(--accent-error);"
        >
          <span class="icon-[mdi--delete-outline]"></span>
          Delete Room
        </button>

        <div class="h-8 w-px" style="background: var(--border-primary);"></div>
      {/if}

      <div
        class="flex items-center gap-2 px-4 py-2 rounded-lg border"
        style="background: var(--bg-tertiary); border-color: var(--border-primary); color: var(--accent-primary);"
      >
        <span class="icon-[mdi--account-multiple-outline]"></span>
        <span class="font-bold">{$users.length}</span>
      </div>

      <button
        onclick={onDownload}
        class="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm font-medium"
        style="background: var(--accent-success);"
      >
        <span class="icon-[mdi--tray-download]"></span>
        Download
      </button>

      <button
        onclick={leaveRoom}
        class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm font-medium"
        style="background: var(--bg-tertiary); color: var(--text-primary);"
      >
        <span class="icon-[mdi--logout]"></span>
        Leave
      </button>
    </div>
  </div>
</div>
