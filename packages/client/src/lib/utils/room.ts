import { getSocket } from "$lib/socket";
import { kickModalState } from "$lib/stores/room";

export const roomActions = {
  lockRoom: () => getSocket()?.emit("lock-room"),
  unlockRoom: () => getSocket()?.emit("unlock-room"),
  deleteRoom: () => getSocket()?.emit("delete-room"),
  clearBoard: () => getSocket()?.emit("clear-board"),

  showKickConfirmation: (user: { id: string; nickname: string }) => {
    kickModalState.set({ show: true, user });
  },

  hideKickConfirmation: () => {
    kickModalState.set({ show: false, user: null });
  },

  confirmKick: () => {
    kickModalState.update((state) => {
      if (state.user) {
        getSocket()?.emit("kick-user", {
          userId: state.user.id,
          nickName: state.user.nickname,
        });
      }
      return { show: false, user: null };
    });
  },
};

export const downloadCanvasImage = (roomName?: string) => {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  const dataUrl = canvas.toDataURL();
  const link = document.createElement("a");
  link.download = `pixel-art-${roomName || "board"}.png`;
  link.href = dataUrl;
  link.click();
};
