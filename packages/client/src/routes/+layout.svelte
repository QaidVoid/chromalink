<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { toast } from "$lib/stores";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

{#if $toast}
  <div
    class="fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white font-semibold
    {$toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}"
  >
    {$toast.message}
  </div>
{/if}
