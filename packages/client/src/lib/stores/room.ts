import { writable } from "svelte/store";
import { DRAWING_COLORS } from "$lib/theme/colors";

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

export const colors = writable(DRAWING_COLORS);
