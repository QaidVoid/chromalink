<script lang="ts">
  import { selectedColor, brushSize, symmetryMode, type SymmetryMode } from "$lib/stores";
  import { colors as roomColors } from "$lib/stores/room";

  let { colors = $roomColors } = $props();

  const ERASER = "#ERASER";
  const MIN_BRUSH_SIZE = 1;
  const MAX_BRUSH_SIZE = 8;

  const symmetryModes: { value: SymmetryMode; label: string }[] = [
    { value: "none", label: "None" },
    { value: "horizontal", label: "H" },
    { value: "vertical", label: "V" },
    { value: "both", label: "HV" },
    { value: "radial4", label: "R4" },
    { value: "radial8", label: "R8" },
  ];
</script>

<div class="space-y-3">
  <div class="flex items-center gap-2 mb-2">
    <span class="icon-[mdi--palette] text-base" style="color: var(--accent-primary);"></span>
    <h2 class="text-sm font-bold" style="color: var(--text-primary);">Colors</h2>
  </div>
  <div class="grid grid-cols-4 gap-1.5">
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

  <div>
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="icon-[mdi--brush] text-base" style="color: var(--accent-primary);"></span>
        <h3 class="text-sm font-bold" style="color: var(--text-primary);">Brush</h3>
      </div>
      <span class="text-xs font-mono font-bold" style="color: var(--text-primary);">{$brushSize}x{$brushSize}</span>
    </div>
    <div class="space-y-2">
      <input
        type="range"
        min={MIN_BRUSH_SIZE}
        max={MAX_BRUSH_SIZE}
        value={$brushSize}
        oninput={(e) => brushSize.set(Number(e.currentTarget.value))}
        class="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style="background: linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) {(($brushSize - MIN_BRUSH_SIZE) / (MAX_BRUSH_SIZE - MIN_BRUSH_SIZE)) * 100}%, var(--border-primary) {(($brushSize - MIN_BRUSH_SIZE) / (MAX_BRUSH_SIZE - MIN_BRUSH_SIZE)) * 100}%, var(--border-primary) 100%);"
      />
    </div>
  </div>

  <div>
    <div class="flex items-center gap-2 mb-2">
      <span class="icon-[mdi--symmetry] text-base" style="color: var(--accent-primary);"></span>
      <h3 class="text-sm font-bold" style="color: var(--text-primary);">Symmetry</h3>
    </div>
    <div class="grid grid-cols-3 gap-2">
      {#each symmetryModes as mode}
        <button
          onclick={() => symmetryMode.set(mode.value)}
          class={`aspect-square rounded-lg transition-all hover:scale-105 flex items-center justify-center ${
            $symmetryMode === mode.value
              ? "ring-2 scale-105 shadow"
              : "ring-1 opacity-70 hover:opacity-100"
          }`}
          style={`background: var(--bg-tertiary); ${$symmetryMode === mode.value ? 'border-color: var(--accent-primary); color: var(--accent-primary);' : 'border-color: var(--border-primary); color: var(--text-secondary);'}`}
          title={mode.value === "none" ? "No Symmetry" : mode.value === "horizontal" ? "Horizontal Mirror" : mode.value === "vertical" ? "Vertical Mirror" : mode.value === "both" ? "Quad Mirror" : mode.value === "radial4" ? "4-Way Radial" : "8-Way Radial"}
        >
          <span class="text-sm font-bold">{mode.label}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
