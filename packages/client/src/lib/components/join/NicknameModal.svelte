<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import { nickname, showError } from "$lib/stores";
  import { validateNickname } from "$lib/api/validation";

  let { onComplete }: { onComplete?: () => void } = $props();

  let newNickname = $state("");

  const setUserNickname = () => {
    const socket = getSocket();
    if (!socket) return;

    const error = validateNickname(newNickname);
    if (error) {
      showError(error);
      return;
    }

    socket.emit("set-nickname", { nickname: newNickname });
    nickname.set(newNickname);
    onComplete?.();
  };
</script>

<div
  class="min-h-screen bg-linear-to-br from-purple-100 to-blue-100 flex items-center justify-center p-8"
>
  <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
    <div class="text-center mb-6">
      <div
        class="w-12 h-12 bg-linear-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <span class="icon-[mdi--account-outline] text-white text-2xl"></span>
      </div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
      <p class="text-gray-600">Choose your nickname</p>
    </div>

    <div class="space-y-4">
      <input
        type="text"
        bind:value={newNickname}
        onkeypress={(e) => e.key === "Enter" && setUserNickname()}
        placeholder="Enter your nickname..."
        maxlength={20}
        class="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
      />
      <button
        onclick={setUserNickname}
        disabled={!newNickname.trim()}
        class="w-full py-3 bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  </div>
</div>
