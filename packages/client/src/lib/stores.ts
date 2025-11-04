import { writable } from "svelte/store";

type Room = {
  id: string;
  name: string;
  userCount: number;
};

type Pixel = { x: number; y: number; color: string };

export const pixels = writable<Record<string, string>>({});
export const cursors = writable<Record<string, Pixel>>({});
export const currentRoom = writable<Room | null>();
export const userCount = writable(0);
export const selectedColor = writable("#FF6B6B");
export const isDrawing = writable(false);
export const rooms = writable<Room[]>([]);
