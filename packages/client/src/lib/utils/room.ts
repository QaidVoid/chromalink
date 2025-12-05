import { getSocket } from "$lib/api/socket";
import { showError } from "$lib/stores";
import { kickModalState } from "$lib/stores/room";

export const roomActions = {
  lockRoom: () => {
    const socket = getSocket();
    if (!socket) {
      showError("Not connected to server");
      return;
    }
    socket.emit("lock-room");
  },

  unlockRoom: () => {
    const socket = getSocket();
    if (!socket) {
      showError("Not connected to server");
      return;
    }
    socket.emit("unlock-room");
  },

  deleteRoom: () => {
    const socket = getSocket();
    if (!socket) {
      showError("Not connected to server");
      return;
    }
    socket.emit("delete-room");
  },

  clearBoard: () => {
    const socket = getSocket();
    if (!socket) {
      showError("Not connected to server");
      return;
    }
    socket.emit("clear-board");
  },

  showKickConfirmation: (user: { id: string; nickname: string }) => {
    kickModalState.set({ show: true, user });
  },

  hideKickConfirmation: () => {
    kickModalState.set({ show: false, user: null });
  },

  confirmKick: () => {
    kickModalState.update((state) => {
      if (state.user) {
        const socket = getSocket();
        if (!socket) {
          showError("Not connected to server");
          return { show: false, user: null };
        }
        socket.emit("kick-user", { userId: state.user.id });
      }
      return { show: false, user: null };
    });
  },
};

export const downloadCanvasImage = (roomName?: string) => {
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    showError("Canvas not found");
    return;
  }

  const dataUrl = canvas.toDataURL();
  const link = document.createElement("a");
  link.download = `pixel-art-${roomName || "board"}.png`;
  link.href = dataUrl;
  link.click();
};
