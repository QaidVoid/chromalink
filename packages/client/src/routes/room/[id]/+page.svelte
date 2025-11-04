<script lang="ts">
  import { goto } from "$app/navigation";
  import Canvas from "$lib/components/Canvas.svelte";
  import { getSocket } from "$lib/socket";
  import { currentRoom, cursors, pixels, selectedColor, userCount } from "$lib/stores";
  import { onDestroy, onMount } from "svelte";
    import type { PageProps } from "./$types";

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

  let { params }: PageProps = $props();

  onMount(() => {
    const socket = getSocket();
    if (!socket) {
      goto("/join");
      return;
    }

    socket.emit("join-room", { roomId: params.id });
  });

  onDestroy(() => {
    currentRoom.set(null);
    userCount.set(0);
    pixels.set({});
    cursors.set({});
  })

  const leaveRoom = () => {
    currentRoom.set(null);
    userCount.set(0);
    pixels.set({});
    cursors.set({});

    goto("/join");
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

<div class="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-blue-50 p-8 relative overflow-hidden">
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <div class="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
  </div>

  <div class="max-w-7xl mx-auto relative z-10">
    <div class="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-5xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {$currentRoom?.name || "Pixel Art Board"}
          </h1>
          <p class="text-gray-600 text-lg">Draw together in real-time</p>
        </div>
        <div class="flex items-center gap-4">
          <div
            class="flex items-center gap-3 bg-linear-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full border-2 border-blue-200 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-blue-600"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span class="font-bold text-blue-600 text-lg">{$userCount} online</span>
          </div>
          <button
            onclick={leaveRoom}
            class="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors border-2 border-gray-300 hover:border-gray-400 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" x2="9" y1="12" y2="12"></line>
            </svg>
            <span class="font-bold text-gray-700">Leave</span>
          </button>
        </div>
      </div>

      <div class="flex gap-8">
        <div class="flex-1">
          <div class="bg-linear-to-br from-slate-100 to-purple-100 p-4 rounded-2xl shadow-inner border-2 border-purple-200">
            <Canvas />
          </div>
          <div class="flex gap-4 mt-6">
            <button
              onclick={clearBoard}
              class="flex items-center gap-2 px-7 py-4 bg-linear-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-200 hover:shadow-xl font-bold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear Board
            </button>
            <button
              onclick={downloadImage}
              class="flex items-center gap-2 px-7 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl font-bold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
            </button>
          </div>
        </div>

        <div class="w-80">
          <div class="bg-linear-to-br from-slate-50 to-purple-50 rounded-2xl p-7 shadow-lg border-2 border-purple-200">
            <div class="flex items-center gap-3 mb-6">
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
                class="text-purple-600"
              >
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
              </svg>
              <h2 class="text-2xl font-bold text-gray-800">Color Palette</h2>
            </div>
            <div class="grid grid-cols-4 gap-3 mb-6">
              {#each colors as color}
                <button
                  onclick={() => selectedColor.set(color)}
                  class={`w-14 h-14 rounded-xl transition-all hover:scale-110 shadow-md ${
                    $selectedColor === color
                      ? "ring-4 ring-purple-500 scale-110 shadow-lg"
                      : "ring-2 ring-gray-300 hover:ring-purple-300"
                  }`}
                  style={`background-color: ${color}`}
                  aria-label={color}
                ></button>
              {/each}
            </div>
            <div class="p-5 bg-white rounded-xl shadow-sm border border-purple-100 mb-6">
              <p class="text-sm text-gray-600 mb-3 font-semibold">Selected Color</p>
              <div class="flex items-center gap-4">
                <div
                  class="w-20 h-20 rounded-xl ring-2 ring-gray-300 shadow-md"
                  style={`background-color: ${$selectedColor}`}
                ></div>
                <span class="font-mono text-xl font-bold text-gray-700"
                  >{$selectedColor}</span
                >
              </div>
            </div>
            <div class="p-5 bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <p class="text-base text-blue-800 font-bold mb-3">💡 Quick Tips</p>
              <ul class="text-sm text-blue-700 space-y-2 leading-relaxed">
                <li>• Click and drag to draw</li>
                <li>• Select colors from palette</li>
                <li>• See others drawing live</li>
                <li>• Download your masterpiece</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
