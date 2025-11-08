<script lang="ts">
  import { kickModalState } from "$lib/stores/room";
  import { roomActions } from "$lib/utils/room";
</script>

{#if $kickModalState.show && $kickModalState.user}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
      <div class="text-center mb-4">
        <div
          class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <span class="icon-[mdi--alert-outline] text-red-600 text-2xl"></span>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">Kick User?</h3>
        <p class="text-gray-600 text-sm">
          Are you sure you want to kick <span class="font-semibold"
            >{$kickModalState.user.nickname}</span
          >?
        </p>
      </div>
      <div class="flex gap-3">
        <button
          onclick={roomActions.confirmKick}
          class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
        >
          Kick
        </button>
        <button
          onclick={roomActions.hideKickConfirmation}
          class="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
