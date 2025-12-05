<script lang="ts">
  import { theme } from "$lib/stores";

  function getTitle(currentTheme: string) {
    if (currentTheme === "dark") return "Switch to light mode";
    if (currentTheme === "light") return "Switch to system theme";
    return "Switch to dark mode";
  }
</script>

<button
  onclick={() => theme.toggle()}
  class="p-2 rounded-lg transition-all border"
  style="border-color: var(--border-primary);"
  aria-label="Toggle theme"
  title={getTitle($theme)}
>
  {#if $theme === "dark"}
    <span class="icon-[mdi--moon-waning-crescent] text-xl" style="color: var(--accent-primary);"></span>
  {:else if $theme === "light"}
    <span class="icon-[mdi--white-balance-sunny] text-xl" style="color: var(--accent-warning);"></span>
  {:else}
    <span class="icon-[mdi--monitor] text-xl" style="color: var(--text-secondary);"></span>
  {/if}
</button>
