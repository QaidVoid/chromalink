<script lang="ts">
  import { goto } from "$app/navigation";
  import CreateRoom from "$lib/components/join/CreateRoom.svelte";
  import NicknameModal from "$lib/components/join/NicknameModal.svelte";
  import PasswordModal from "$lib/components/join/PasswordModal.svelte";
  import RoomsList from "$lib/components/join/RoomsList.svelte";
  import { getSocket, initSocket } from "$lib/socket";
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
    socket.emit("get-rooms");

    if ($nickname.trim().length === 0) {
      joinPageState.set("nickname");
    }

    $effect(() => {
      if ($currentRoom) goto(`/room/${$currentRoom.id}`);
    });
  });

  const joinRoom = (roomId: string, hasPassword: boolean) => {
    if (hasPassword) {
      selectedRoomId.set(roomId);
      password.set("");
      joinPageState.set("password");
    } else {
      getSocket()?.emit("join-room", { roomId });
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
  class="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center p-8 relative overflow-hidden"
>
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <div
      class="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
    ></div>
  </div>

  <div
    class="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl w-full relative z-10 border border-purple-100"
  >
    <div class="text-center mb-10">
      <h1
        class="text-5xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 flex items-center justify-center"
      >
        <span
          class="icon-[mdi--color] mask-(--svg) bg-linear-to-r from-purple-600 to-blue-600"
        ></span>
        <span>Pixel Art Rooms</span>
      </h1>
      <p class="text-gray-600 text-lg">Choose a room or create your own</p>
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
