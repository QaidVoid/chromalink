import { writable } from "svelte/store";
import { DEFAULT_COLOR } from "$lib/theme/colors";

export type Pixel = { x: number; y: number; color: string; size?: number };

export type User = {
  id: string;
  userId: string;
  nickname: string;
};

export const pixels = writable<Record<string, string>>({});
export const cursors = writable<Record<string, Pixel>>({});
export const users = writable<User[]>([]);
export const selectedColor = writable(DEFAULT_COLOR);
export const brushSize = writable(1);
export const isDrawing = writable(false);
export const nickname = writable("");
