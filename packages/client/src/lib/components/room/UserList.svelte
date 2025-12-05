<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import { isAdmin, users } from "$lib/stores";
  import { roomActions } from "$lib/utils/room";
</script>

<div class="p-4 rounded-lg border-2" style="background: var(--bg-tertiary); border-color: var(--border-primary);">
  <p class="text-sm font-bold mb-3 flex items-center gap-2" style="color: var(--text-primary);">
    <span class="icon-[mdi--account-group]"></span>
    Users ({$users.length})
  </p>
  <div class="space-y-2 max-h-48 overflow-y-auto">
    {#each $users as user}
      <div
        class="flex items-center justify-between p-2 rounded-lg border"
        style="background: var(--bg-secondary); border-color: var(--border-primary);"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="icon-[mdi--account] shrink-0" style="color: var(--text-secondary);"></span>
          <span class="text-sm truncate" style="color: var(--text-primary);">{user.nickname}</span>
        </div>
        {#if $isAdmin && user.id !== getSocket()?.id}
          <button
            onclick={() => roomActions.showKickConfirmation(user)}
            class="shrink-0 p-1.5 text-white rounded transition-colors ml-2"
            style="background: var(--accent-error);"
            title="Kick {user.nickname}"
          >
            <span class="icon-[mdi--close] text-xs"></span>
          </button>
        {/if}
      </div>
    {/each}
    {#if $users.length === 0}
      <p class="text-xs text-center py-2" style="color: var(--text-tertiary);">No users online</p>
    {/if}
  </div>
</div>
