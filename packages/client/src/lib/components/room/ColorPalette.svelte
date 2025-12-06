<script lang="ts">
  import { selectedColor, brushSize } from "$lib/stores";
  import { colors as roomColors } from "$lib/stores/room";

  let { colors = $roomColors } = $props();

  const ERASER = "#ERASER";
  const MIN_BRUSH_SIZE = 1;
  const MAX_BRUSH_SIZE = 8;
</script>

<div>
  <div class="flex items-center gap-2 mb-4">
    <span class="icon-[mdi--palette] text-xl" style="color: var(--accent-primary);"></span>
    <h2 class="text-xl font-bold" style="color: var(--text-primary);">Colors</h2>
  </div>
  <div class="grid grid-cols-4 gap-2 mb-4">
    {#each colors as color}
      <button
        onclick={() => selectedColor.set(color)}
        class={`w-full aspect-square rounded-lg transition-all hover:scale-105 ${
          $selectedColor === color
            ? "ring-4 scale-105 shadow-lg"
            : "ring-2 hover:ring-opacity-60"
        }`}
        style={`background-color: ${color}; ${$selectedColor === color ? 'border-color: var(--accent-primary);' : 'border-color: var(--border-primary);'}`}
        aria-label={color}
      ></button>
    {/each}
    <button
      onclick={() => selectedColor.set(ERASER)}
      class={`w-full aspect-square rounded-lg transition-all hover:scale-105 flex items-center justify-center ${
        $selectedColor === ERASER
          ? "ring-4 scale-105 shadow-lg"
          : "ring-2 hover:ring-opacity-60"
      }`}
      style={`background: linear-gradient(135deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(135deg, #f0f0f0 25%, #ffffff 25%, #ffffff 75%, #f0f0f0 75%, #f0f0f0); background-size: 10px 10px; background-position: 0 0, 5px 5px; ${$selectedColor === ERASER ? 'border-color: var(--accent-primary);' : 'border-color: var(--border-primary);'}`}
      aria-label="Eraser"
      title="Eraser"
    >
      <span class="icon-[mdi--eraser] text-2xl" style="color: var(--text-secondary);"></span>
    </button>
  </div>
  <div class="p-3 rounded-lg border" style="background: var(--bg-tertiary); border-color: var(--border-primary);">
    <p class="text-xs mb-2 font-medium" style="color: var(--text-secondary);">Selected</p>
    <div class="flex items-center gap-3">
      {#if $selectedColor === ERASER}
        <div
          class="w-12 h-12 rounded-lg ring-2 shadow-sm shrink-0 flex items-center justify-center"
          style="background: linear-gradient(135deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(135deg, #f0f0f0 25%, #ffffff 25%, #ffffff 75%, #f0f0f0 75%, #f0f0f0); background-size: 8px 8px; background-position: 0 0, 4px 4px; border-color: var(--border-primary);"
        >
          <span class="icon-[mdi--eraser]" style="color: var(--text-secondary);"></span>
        </div>
        <span class="font-mono text-sm font-bold" style="color: var(--text-primary);">Eraser</span>
      {:else}
        <div
          class="w-12 h-12 rounded-lg ring-2 shadow-sm shrink-0"
          style={`background-color: ${$selectedColor}; border-color: var(--border-primary);`}
        ></div>
        <span class="font-mono text-sm font-bold" style="color: var(--text-primary);"
          >{$selectedColor}</span
        >
      {/if}
    </div>
  </div>
  <div class="mt-4">
    <div class="flex items-center gap-2 mb-3">
      <span class="icon-[mdi--brush] text-lg" style="color: var(--accent-primary);"></span>
      <h3 class="text-base font-bold" style="color: var(--text-primary);">Brush Size</h3>
    </div>
    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <input
          type="range"
          min={MIN_BRUSH_SIZE}
          max={MAX_BRUSH_SIZE}
          value={$brushSize}
          oninput={(e) => brushSize.set(Number(e.currentTarget.value))}
          class="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
          style="background: linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) {(($brushSize - MIN_BRUSH_SIZE) / (MAX_BRUSH_SIZE - MIN_BRUSH_SIZE)) * 100}%, var(--border-primary) {(($brushSize - MIN_BRUSH_SIZE) / (MAX_BRUSH_SIZE - MIN_BRUSH_SIZE)) * 100}%, var(--border-primary) 100%);"
        />
        <div
          class="w-12 h-12 rounded-lg ring-2 shadow-sm flex items-center justify-center shrink-0"
          style="background: var(--bg-tertiary); border-color: var(--accent-primary);"
        >
          <span class="font-mono text-sm font-bold" style="color: var(--text-primary);">{$brushSize}x{$brushSize}</span>
        </div>
      </div>
      <div class="flex items-center justify-between text-xs" style="color: var(--text-secondary);">
        <span>{MIN_BRUSH_SIZE}x{MIN_BRUSH_SIZE}</span>
        <span>{MAX_BRUSH_SIZE}x{MAX_BRUSH_SIZE}</span>
      </div>
    </div>
  </div>
</div>
