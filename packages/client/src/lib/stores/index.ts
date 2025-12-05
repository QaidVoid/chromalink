import { writable } from "svelte/store";

export type RoomListItem = {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
  isLocked: boolean;
  hasPassword: boolean;
};

export type Room = RoomListItem & {
  isAdmin: boolean;
};

export const currentRoom = writable<Room | null>(null);
export const rooms = writable<RoomListItem[]>([]);
export const isAdmin = writable(false);
export const isRoomLocked = writable(false);

// Re-export from other stores
export * from "./board";
export * from "./ui";
export * from "./room";
export * from "./join";
export * from "./theme";
