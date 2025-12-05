<script lang="ts">
  import { kickModalState } from "$lib/stores/room";
  import { roomActions } from "$lib/utils/room";
</script>

{#if $kickModalState.show && $kickModalState.user}
  <div
    class="fixed inset-0 flex items-center justify-center z-50 p-4"
    style="background: rgba(0, 0, 0, 0.5);"
  >
    <div class="rounded-2xl shadow-2xl p-6 max-w-sm w-full" style="background: var(--bg-secondary);">
      <div class="text-center mb-4">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style="background: var(--bg-tertiary);"
        >
          <span class="icon-[mdi--alert-outline] text-2xl" style="color: var(--accent-error);"></span>
        </div>
        <h3 class="text-lg font-bold mb-2" style="color: var(--text-primary);">Kick User?</h3>
        <p class="text-sm" style="color: var(--text-secondary);">
          Are you sure you want to kick <span class="font-semibold"
            >{$kickModalState.user.nickname}</span
          >?
        </p>
      </div>
      <div class="flex gap-3">
        <button
          onclick={roomActions.confirmKick}
          class="flex-1 py-2.5 text-white rounded-lg transition-colors font-medium"
          style="background: var(--accent-error);"
        >
          Kick
        </button>
        <button
          onclick={roomActions.hideKickConfirmation}
          class="flex-1 py-2.5 rounded-lg transition-colors font-medium"
          style="background: var(--bg-tertiary); color: var(--text-primary);"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
