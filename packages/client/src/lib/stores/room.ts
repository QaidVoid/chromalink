import { writable } from "svelte/store";
import { DRAWING_COLORS } from "$lib/theme/colors";
import type { User } from "$lib/stores/board";

type KickModalState = {
  show: boolean;
  user: User | null;
};

export const kickModalState = writable<KickModalState>({
  show: false,
  user: null,
});

export const colors = writable(DRAWING_COLORS);
