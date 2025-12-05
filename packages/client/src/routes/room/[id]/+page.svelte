<script lang="ts">
  import { goto } from "$app/navigation";
  import Canvas from "$lib/components/board/Canvas.svelte";
  import ColorPalette from "$lib/components/room/ColorPalette.svelte";
  import Header from "$lib/components/room/Header.svelte";
  import KickModal from "$lib/components/room/KickModal.svelte";
  import TipsPanel from "$lib/components/room/TipsPanel.svelte";
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
  class="h-screen flex flex-col bg-linear-to-br from-slate-50 via-purple-50 to-blue-50 overflow-hidden"
>
  <KickModal />

  <Header onDownload={handleDownload} />

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
        <ColorPalette />
        <TipsPanel />
        <UserList />
      </div>
    </div>
  </div>
</div>
