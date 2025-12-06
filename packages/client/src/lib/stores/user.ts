import { writable } from "svelte/store";

const AUTH_TOKEN_KEY = "chromalink-auth-token";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function saveAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function createAuthStore() {
  const { subscribe, set } = writable<string | null>(getAuthToken());

  return {
    subscribe,
    getToken: getAuthToken,
    setToken: (token: string) => {
      saveAuthToken(token);
      set(token);
    },
  };
}

export const authTokenStore = createAuthStore();
