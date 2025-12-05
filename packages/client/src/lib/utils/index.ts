import { goto } from "$app/navigation";
import { currentRoom, cursors, isAdmin, pixels, users } from "$lib/stores";

export function resetState() {
  pixels.set({});
  cursors.set({});
  currentRoom.set(null);
  isAdmin.set(false);
  users.set([]);
}

export function leaveRoom() {
  resetState();
  goto("/join");
}

// Re-export utilities
export * from "./board";
export * from "./room";
