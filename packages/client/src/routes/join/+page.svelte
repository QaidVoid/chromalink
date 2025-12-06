<script lang="ts">
  import { goto } from "$app/navigation";
  import CreateRoom from "$lib/components/join/CreateRoom.svelte";
  import NicknameModal from "$lib/components/join/NicknameModal.svelte";
  import PasswordModal from "$lib/components/join/PasswordModal.svelte";
  import RoomsList from "$lib/components/join/RoomsList.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import { getSocket, initSocket } from "$lib/api/socket";
  import { currentRoom, nickname } from "$lib/stores";
  import {
    joinPageState,
    newRoomData,
    password,
    selectedRoomId,
  } from "$lib/stores/join";
  import { onMount } from "svelte";

  onMount(() => {
    const socket = initSocket();
    if (socket) {
      socket.emit("get-rooms");
    }

    if ($nickname.trim().length === 0) {
      joinPageState.set("nickname");
    }

    $effect(() => {
      if ($currentRoom) goto(`/room/${$currentRoom.id}`);
    });
  });

  const joinRoom = (roomId: string, hasPassword: boolean) => {
    const socket = getSocket();
    if (!socket) return;

    if (hasPassword) {
      selectedRoomId.set(roomId);
      password.set("");
      joinPageState.set("password");
    } else {
      socket.emit("join-room", { roomId });
    }
  };

  const handleCreateRoom = () => {
    joinPageState.set("creating");
    newRoomData.set({ id: "", name: "", password: "" });
  };

  const handleCancel = () => {
    joinPageState.set("browsing");
  };
</script>

{#if $joinPageState === "nickname"}
  <NicknameModal onComplete={() => joinPageState.set("browsing")} />
{/if}

<div
  class="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
  style="background: var(--bg-primary);"
>
  <div class="absolute top-4 right-4 z-20">
    <ThemeToggle />
  </div>

  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    <div
      class="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl"
      style="background: var(--accent-primary);"
    ></div>
    <div
      class="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
      style="background: var(--accent-secondary);"
    ></div>
  </div>

  <div
    class="rounded-3xl shadow-2xl p-10 max-w-3xl w-full relative z-10 border"
    style="background: var(--bg-secondary); border-color: var(--border-primary);"
  >
    <div class="text-center mb-10">
      <h1
        class="text-5xl font-bold mb-3 flex items-center justify-center gap-3"
        style="color: var(--accent-primary);"
      >
        <span class="icon-[mdi--palette]"></span>
        <span>Chromalink</span>
      </h1>
      <p class="text-lg" style="color: var(--text-secondary);">
        Collaborative pixel art in real-time
      </p>
    </div>

    {#if $joinPageState === "browsing"}
      <RoomsList {joinRoom} onCreateRoom={handleCreateRoom} />
    {:else if $joinPageState === "creating"}
      <CreateRoom onCancel={handleCancel} />
    {/if}
  </div>
</div>

{#if $joinPageState === "password"}
  <PasswordModal onCancel={handleCancel} />
{/if}
