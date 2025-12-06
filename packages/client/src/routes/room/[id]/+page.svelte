<script lang="ts">
  import { goto } from "$app/navigation";
  import Canvas from "$lib/components/board/Canvas.svelte";
  import Chat from "$lib/components/room/Chat.svelte";
  import ColorPalette from "$lib/components/room/ColorPalette.svelte";
  import Header from "$lib/components/room/Header.svelte";
  import KickModal from "$lib/components/room/KickModal.svelte";
  import UserList from "$lib/components/room/UserList.svelte";
  import { getSocket } from "$lib/api/socket";
  import { currentRoom } from "$lib/stores";
  import { resetState } from "$lib/utils";
  import { downloadCanvasImage } from "$lib/utils/room";
  import { onDestroy, onMount } from "svelte";

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

  const handleDownload = () => {
    downloadCanvasImage($currentRoom?.name);
  };

  let activeTab = $state<"draw" | "users" | "chat">("draw");
</script>

<div
  class="h-screen flex flex-col overflow-hidden"
  style="background: var(--bg-primary);"
>
  <KickModal />

  <Header onDownload={handleDownload} />

  <div class="flex-1 flex overflow-hidden">
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="h-full w-full flex items-center justify-center">
        <div
          class="rounded-xl shadow-xl p-3 border-2 max-h-full flex items-center justify-center"
          style="background: var(--bg-secondary); border-color: var(--border-primary);"
        >
          <Canvas />
        </div>
      </div>
    </div>

    <div
      class="w-80 shrink-0 border-l-2 shadow-lg flex flex-col"
      style="background: var(--bg-secondary); border-color: var(--border-primary);"
    >
      <div class="flex border-b" style="border-color: var(--border-primary);">
        <button
          onclick={() => activeTab = "draw"}
          class={`flex-1 px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === "draw" ? "border-b-2" : "opacity-60 hover:opacity-100"
          }`}
          style={activeTab === "draw" ? "border-color: var(--accent-primary); color: var(--accent-primary);" : "color: var(--text-secondary);"}
        >
          <span class="icon-[mdi--palette] text-base"></span>
          <span>Draw</span>
        </button>
        <button
          onclick={() => activeTab = "users"}
          class={`flex-1 px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === "users" ? "border-b-2" : "opacity-60 hover:opacity-100"
          }`}
          style={activeTab === "users" ? "border-color: var(--accent-primary); color: var(--accent-primary);" : "color: var(--text-secondary);"}
        >
          <span class="icon-[mdi--account-group] text-base"></span>
          <span>Users</span>
        </button>
        <button
          onclick={() => activeTab = "chat"}
          class={`flex-1 px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === "chat" ? "border-b-2" : "opacity-60 hover:opacity-100"
          }`}
          style={activeTab === "chat" ? "border-color: var(--accent-primary); color: var(--accent-primary);" : "color: var(--text-secondary);"}
        >
          <span class="icon-[mdi--chat] text-base"></span>
          <span>Chat</span>
        </button>
      </div>

      <div class="flex-1 overflow-auto p-4">
        {#if activeTab === "draw"}
          <ColorPalette />
        {:else if activeTab === "users"}
          <UserList />
        {:else if activeTab === "chat"}
          <div class="h-full">
            <Chat />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
