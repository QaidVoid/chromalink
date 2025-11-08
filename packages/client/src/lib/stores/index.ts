import { writable } from "svelte/store";

type Room = {
  id: string;
  name: string;
  userCount: number;
  isLocked: boolean;
  hasPassword: boolean;
};

type Pixel = { x: number; y: number; color: string };

type User = {
  id: string;
  nickname: string;
};

export const pixels = writable<Record<string, string>>({});
export const cursors = writable<Record<string, Pixel>>({});
export const currentRoom = writable<Room | null>();
export const users = writable<User[]>([]);
export const selectedColor = writable("#FF6B6B");
export const isDrawing = writable(false);
export const rooms = writable<Room[]>([]);
export const isAdmin = writable(false);
export const isRoomLocked = writable(false);
export const nickname = writable("");

export const toast = writable<{
  message: string;
  type: "success" | "error";
} | null>(null);

export const showError = (message: string) => {
  toast.set({ message, type: "error" });
  setTimeout(() => toast.set(null), 5000);
};
