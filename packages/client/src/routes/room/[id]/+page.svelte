<script lang="ts">
  import { goto } from "$app/navigation";
  import Canvas from "$lib/components/Canvas.svelte";
  import { getSocket } from "$lib/socket";
  import {
    currentRoom,
    cursors,
    pixels,
    selectedColor,
    userCount,
  } from "$lib/stores";
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
  });

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

<div
  class="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-blue-50 p-8 relative overflow-hidden"
>
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <div
      class="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
    ></div>
  </div>

  <div class="max-w-7xl mx-auto relative z-10">
    <div class="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1
            class="text-5xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
          >
            {$currentRoom?.name || "Pixel Art Board"}
          </h1>
          <p class="text-gray-600 text-lg">Draw together in real-time</p>
        </div>
        <div class="flex items-center gap-4">
          <div
            class="flex items-center gap-3 bg-linear-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full border-2 border-blue-200 shadow-sm"
          >
            <span class="icon-[mdi--account-multiple-outline]"></span>
            <span class="font-bold text-blue-600 text-lg"
              >{$userCount} online</span
            >
          </div>
          <button
            onclick={leaveRoom}
            class="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors border-2 border-gray-300 hover:border-gray-400 shadow-sm"
          >
            <span class="icon-[mdi--logout]"></span>
            <span class="font-bold text-gray-700">Leave</span>
          </button>
        </div>
      </div>

      <div class="flex gap-8">
        <div class="flex-1">
          <div
            class="bg-linear-to-br from-slate-100 to-purple-100 p-4 rounded-2xl shadow-inner border-2 border-purple-200"
          >
            <Canvas />
          </div>
          <div class="flex gap-4 mt-6">
            <button
              onclick={clearBoard}
              class="flex items-center gap-2 px-7 py-4 bg-linear-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-200 hover:shadow-xl font-bold"
            >
              <span class="icon-[mdi--trash-outline]"></span>
              Clear Board
            </button>
            <button
              onclick={downloadImage}
              class="flex items-center gap-2 px-7 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl font-bold"
            >
              <span class="icon-[mdi--tray-download]"></span>
              Download
            </button>
          </div>
        </div>

        <div class="w-80">
          <div
            class="bg-linear-to-br from-slate-50 to-purple-50 rounded-2xl p-7 shadow-lg border-2 border-purple-200"
          >
            <div class="flex items-center gap-3 mb-6">
              <span class="icon-[mdi--color] text-purple-600 text-2xl"></span>
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
            <div
              class="p-5 bg-white rounded-xl shadow-sm border border-purple-100 mb-6"
            >
              <p class="text-sm text-gray-600 mb-3 font-semibold">
                Selected Color
              </p>
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
            <div
              class="p-5 bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200"
            >
              <p class="text-base text-blue-800 font-bold mb-3 flex items-center">
                <span class="icon-[mdi--lightbulb] text-yellow-400"></span>
                <span>Quick Tips</span>
              </p>
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
