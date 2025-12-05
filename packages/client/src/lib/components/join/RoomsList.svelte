<script lang="ts">
  import { rooms } from "$lib/stores";

  let {
    joinRoom,
    onCreateRoom,
  }: {
    joinRoom: (roomId: string, hasPassword: boolean) => void;
    onCreateRoom: () => void;
  } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
  {#each $rooms as room}
    <button
      onclick={() => joinRoom(room.id, room.hasPassword)}
      class="relative p-7 rounded-2xl transition-all border-2 hover:shadow-xl text-left group"
      style="background: var(--bg-tertiary); border-color: var(--border-primary);"
    >
      <div class="flex items-center justify-between mb-3">
        <h3
          class="text-2xl font-bold transition-colors"
          style="color: var(--text-primary);"
        >
          {room.name}
        </h3>
        {#if room.isLocked}
          <span
            class="icon-[mdi--lock-outline] text-2xl"
            style="color: var(--accent-warning);"
          ></span>
        {:else}
          <span
            class="icon-[mdi--lock-open-outline] text-2xl"
            style="color: var(--accent-success);"
          ></span>
        {/if}
      </div>
      <div class="flex items-center gap-2" style="color: var(--text-secondary);">
        <span class="icon-[mdi--account-multiple-outline]"></span>
        <span class="text-base font-medium">{room.userCount} online</span>
      </div>

      {#if room.hasPassword}
        <div
          class="absolute bottom-3 right-3 flex items-center gap-1"
          style="color: var(--accent-warning);"
        >
          <span class="icon-[mdi--key] text-sm"></span>
          <span class="text-xs font-medium">Protected</span>
        </div>
      {/if}
    </button>
  {/each}
</div>

<button
  onclick={onCreateRoom}
  class="w-full py-5 text-white rounded-2xl transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
  style="background: var(--accent-primary);"
>
  <span class="icon-[mdi--plus]"></span>
  Create New Room
</button>
