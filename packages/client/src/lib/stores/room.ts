import { writable } from "svelte/store";

type KickModalState = {
  show: boolean;
  user: {
    id: string;
    nickname: string;
  } | null;
};

export const kickModalState = writable<KickModalState>({
  show: false,
  user: null,
});

export const colors = writable([
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#52489C",
  "#F08A5D",
  "#B83B5E",
  "#6A2C70",
  "#000000",
  "#FFFFFF",
  "#808080",
  "#FFB6C1",
]);
