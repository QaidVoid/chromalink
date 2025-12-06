<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import { nickname, showError } from "$lib/stores";
  import { authTokenStore } from "$lib/stores/user";
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

    const token = authTokenStore.getToken();
    socket.emit("set-nickname", { token, nickname: newNickname });
    nickname.set(newNickname);
    onComplete?.();
  };
</script>

<div
  class="fixed inset-0 flex items-center justify-center p-8 z-50"
  style="background: var(--bg-primary);"
>
  <div
    class="rounded-2xl shadow-2xl p-8 max-w-md w-full"
    style="background: var(--bg-secondary);"
  >
    <div class="text-center mb-6">
      <div
        class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style="background: var(--accent-primary);"
      >
        <span class="icon-[mdi--account-outline] text-white text-2xl"></span>
      </div>
      <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">
        Welcome!
      </h1>
      <p style="color: var(--text-secondary);">Choose your nickname</p>
    </div>

    <div class="space-y-4">
      <input
        type="text"
        bind:value={newNickname}
        onkeypress={(e) => e.key === "Enter" && setUserNickname()}
        placeholder="Enter your nickname..."
        maxlength={20}
        class="w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg transition-colors"
        style="background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-primary);"
      />
      <button
        onclick={setUserNickname}
        disabled={!newNickname.trim()}
        class="w-full py-3 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        style="background: var(--accent-primary);"
      >
        Continue
      </button>
    </div>
  </div>
</div>
