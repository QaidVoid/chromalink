<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  const features = [
    {
      icon: "🎨",
      title: "Real-time Collaboration",
      desc: "Draw together with friends instantly.",
    },
    {
      icon: "💬",
      title: "Live Chat",
      desc: "Chat while you create, all in one place.",
    },
    {
      icon: "🔓",
      title: "Public or Private Rooms",
      desc: "Share openly or protect with a password.",
    },
    { icon: "🔄", title: "Undo/Redo", desc: "Mistake? Just hit Ctrl+Z." },
    {
      icon: "🌈",
      title: "Symmetry & Patterns",
      desc: "Create stunning designs with advanced tools.",
    },
    {
      icon: "☁️",
      title: "No Signup Required",
      desc: "Start drawing in seconds—no account needed.",
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
  class="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden"
>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      class="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
    ></div>
    <div
      class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 1s;"
    ></div>
    <div
      class="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 2s;"
    ></div>
  </div>

  <div
    class="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center relative z-10"
  >
    <div class="max-w-4xl">
      <h1
        class="text-6xl md:text-8xl font-extrabold mb-6 drop-shadow-2xl"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px); transition: all 0.6s ease-out;"
      >
        <span
          class="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-400 to-blue-400"
        >
          ChromaLink
        </span>
      </h1>
      <p
        class="text-xl md:text-3xl mb-4 text-gray-300 font-light"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px); transition: all 0.6s ease-out 0.1s;"
      >
        Collaborative pixel art, reimagined.
      </p>
      <p
        class="text-lg md:text-xl mb-10 text-gray-400"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px); transition: all 0.6s ease-out 0.15s;"
      >
        Create stunning pixel art together in real-time
      </p>
      <button
        onclick={startDrawing}
        class="px-10 py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-full shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transform hover:scale-105 transition-all duration-300"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px) scale({mounted
          ? 1
          : 0.95}); transition: all 0.6s ease-out 0.2s;"
      >
        ✨ Start Drawing Now
      </button>
      <p
        class="text-sm mt-6 text-gray-400"
        style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted
          ? 0
          : 20}px); transition: all 0.6s ease-out 0.3s;"
      >
        No signup • Instant access • 100% free
      </p>
    </div>
  </div>

  <div
    class="bg-black/20 backdrop-blur-xl py-20 w-full relative z-10 border-t border-white/5"
  >
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-4xl font-bold text-center text-white mb-16">
        Why Artists Love ChromaLink
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature, i}
          <div
            class="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center shadow-xl hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-white/10 group"
            style="animation-delay: {0.2 + i * 0.1}s; opacity: {mounted
              ? 1
              : 0}; transform: translateY({mounted
              ? 0
              : 30}px); transition: all 0.6s ease-out;"
          >
            <div
              class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300"
            >
              {feature.icon}
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">{feature.title}</h3>
            <p class="text-gray-300 leading-relaxed">{feature.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <footer
    class="py-8 text-center text-gray-400 text-sm relative z-10 border-t border-white/5"
  >
    <a
      href="https://github.com/QaidVoid/chromalink"
      target="_blank"
      class="text-purple-400 hover:text-purple-300 transition-colors"
      >Open Source</a
    >
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
