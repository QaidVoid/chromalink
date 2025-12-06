<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";

  const features = [
    {
      icon: "🎨",
      title: "Real-time Collaboration",
      desc: "See everyone's cursor. Draw together. No lag.",
    },
    {
      icon: "💬",
      title: "Live Chat",
      desc: "Talk while you draw. Or just lurk. We don't judge.",
    },
    {
      icon: "🔓",
      title: "Public or Private",
      desc: "Share your room or lock it down with a password.",
    },
    { icon: "🔄", title: "Undo/Redo", desc: "Oops? Ctrl+Z. Crisis averted." },
    {
      icon: "🌈",
      title: "Symmetry Mode",
      desc: "4-way, 8-way, radial—make patterns that look way cooler than they should.",
    },
    {
      icon: "☁️",
      title: "No Signup",
      desc: "Pick a nickname, click a button, start drawing. That's it.",
    },
  ];

  function startDrawing() {
    goto("/join");
  }

  let mounted = false;
  onMount(() => {
    mounted = true;
  });
</script>

<div
  class="min-h-screen flex flex-col relative overflow-hidden"
  style="background: var(--bg-primary);"
>
  <div class="absolute top-4 right-4 z-50">
    <ThemeToggle />
  </div>

  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    <div
      class="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse"
      style="background: var(--accent-primary);"
    ></div>
    <div
      class="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 1s; background: var(--accent-secondary);"
    ></div>
    <div
      class="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 2s; background: var(--accent-error);"
    ></div>
  </div>

  <div
    class="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center relative z-10"
  >
    <div class="flex flex-col max-w-4xl items-center">
      <h1
        class="text-6xl md:text-8xl font-extrabold mb-6 drop-shadow-2xl"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px); transition: all 0.6s ease-out; color: var(--accent-primary);"
      >
        Chromalink
      </h1>
      <p
        class="text-xl md:text-3xl mb-4 font-light"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px); transition: all 0.6s ease-out 0.1s; color: var(--text-primary);"
      >
        Draw pixels with friends. In real-time. For fun.
      </p>
      <p
        class="text-lg md:text-xl mb-10"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px); transition: all 0.6s ease-out 0.15s; color: var(--text-secondary);"
      >
        A collaborative pixel art canvas that actually works
      </p>
      <button
        onclick={startDrawing}
        class="px-10 py-4 text-white font-bold text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px) scale({mounted
          ? 1
          : 0.95}); transition: all 0.6s ease-out 0.2s; background: var(--accent-primary);"
      >
        <span class="icon-[mdi--palette]"></span>
        <span>Start Drawing Now</span>
      </button>
      <p
        class="text-sm mt-6"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px); transition: all 0.6s ease-out 0.3s; color: var(--text-tertiary);"
      >
        No signup • Instant access • 100% free
      </p>
    </div>
  </div>

  <div
    class="backdrop-blur-xl py-20 w-full relative z-10 border-t"
    style="background: var(--bg-secondary); border-color: var(--border-primary);"
  >
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-4xl font-bold text-center mb-16" style="color: var(--text-primary);">
        What's included
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature, i}
          <div
            class="backdrop-blur-lg rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 border group"
            style="animation-delay: {0.2 + i * 0.1}s; opacity: {mounted
              ? 1
              : 0}; transform: translateY({mounted
              ? 0
              : 30}px); transition: all 0.6s ease-out; background: var(--bg-tertiary); border-color: var(--border-primary);"
          >
            <div
              class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300"
            >
              {feature.icon}
            </div>
            <h3 class="text-2xl font-bold mb-3" style="color: var(--text-primary);">{feature.title}</h3>
            <p class="leading-relaxed" style="color: var(--text-secondary);">{feature.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <footer
    class="py-8 text-center text-sm relative z-10 border-t"
    style="color: var(--text-tertiary); border-color: var(--border-primary);"
  >
    <p class="mb-2">
      Built with Svelte 5 + WebSockets
    </p>
    <a
      href="https://github.com/QaidVoid/chromalink"
      target="_blank"
      class="transition-colors hover:underline inline-flex items-center gap-1"
      style="color: var(--accent-primary);"
    >
      <span class="icon-[mdi--github]"></span>
      <span>View source on GitHub</span>
    </a>
  </footer>
</div>

<style>
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }
</style>
