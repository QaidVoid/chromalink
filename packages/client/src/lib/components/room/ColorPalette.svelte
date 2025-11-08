<script lang="ts">
  import { selectedColor } from "$lib/stores";
  import { colors as roomColors } from "$lib/stores/room";

  let { colors = $roomColors } = $props();
</script>

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
