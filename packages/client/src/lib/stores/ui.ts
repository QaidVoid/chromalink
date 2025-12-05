import { writable } from "svelte/store";

export const toast = writable<{
  message: string;
  type: "success" | "error";
} | null>(null);

export const showError = (message: string) => {
  toast.set({ message, type: "error" });
  setTimeout(() => toast.set(null), 5000);
};
