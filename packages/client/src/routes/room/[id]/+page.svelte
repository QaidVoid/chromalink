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
      <div class="p-4">
        <ColorPalette />
      </div>
      <div class="flex-1 flex flex-col min-h-0 p-4 pt-0 gap-4">
        <div class="shrink-0">
          <UserList />
        </div>
        <div class="flex-1 min-h-0">
          <Chat />
        </div>
      </div>
    </div>
  </div>
</div>
