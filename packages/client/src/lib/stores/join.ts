import { writable } from "svelte/store";

type JoinPageState = "browsing" | "creating" | "password" | "nickname";

export const joinPageState = writable<JoinPageState>("nickname");
export const selectedRoomId = writable<string>("");
export const password = writable<string>("");
export const newRoomData = writable({
  id: "",
  name: "",
  password: "",
});
