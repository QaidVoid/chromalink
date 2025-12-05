<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import { isAdmin, users } from "$lib/stores";
  import { roomActions } from "$lib/utils/room";
</script>

<div class="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
  <p class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
    <span class="icon-[mdi--account-group]"></span>
    Users ({$users.length})
  </p>
  <div class="space-y-2 max-h-48 overflow-y-auto">
    {#each $users as user}
      <div
        class="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="icon-[mdi--account] text-slate-600 shrink-0"></span>
          <span class="text-sm text-slate-700 truncate">{user.nickname}</span>
        </div>
        {#if $isAdmin && user.id !== getSocket()?.id}
          <button
            onclick={() => roomActions.showKickConfirmation(user)}
            class="shrink-0 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors ml-2"
            title="Kick {user.nickname}"
          >
            <span class="icon-[mdi--close] text-xs"></span>
          </button>
        {/if}
      </div>
    {/each}
    {#if $users.length === 0}
      <p class="text-xs text-slate-500 text-center py-2">No users online</p>
    {/if}
  </div>
</div>
