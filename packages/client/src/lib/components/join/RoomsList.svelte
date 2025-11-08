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
          <span class="icon-[mdi--lock-open-outline] text-blue-600 text-2xl"
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
  onclick={onCreateRoom}
  class="w-full py-5 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/50"
>
  <span class="icon-[mdi--plus]"></span>
  Create New Room
</button>
