import { writable } from "svelte/store";

export type Pixel = { x: number; y: number; color: string };

export type User = {
  id: string;
  nickname: string;
};

export const pixels = writable<Record<string, string>>({});
export const cursors = writable<Record<string, Pixel>>({});
export const users = writable<User[]>([]);
export const selectedColor = writable("#FF6B6B");
export const isDrawing = writable(false);
export const nickname = writable("");
