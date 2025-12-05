<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { toast, theme } from "$lib/stores";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(() => {
    theme.init();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

{#if $toast}
  <div
    class="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg font-semibold transition-all"
    style="background: {$toast.type === 'error' ? 'var(--accent-error)' : 'var(--accent-success)'}; color: white;"
  >
    {$toast.message}
  </div>
{/if}
