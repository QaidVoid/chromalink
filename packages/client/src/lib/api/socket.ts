import { io, type Socket } from "socket.io-client";
import {
  chatMessages,
  currentRoom,
  cursors,
  isAdmin,
  isRoomLocked,
  pixels,
  rooms,
  showError,
  users,
} from "$lib/stores";
import { authTokenStore } from "$lib/stores/user";
import { leaveRoom } from "$lib/utils";

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;

  socket = io();

  socket.on("user-authenticated", (data: { userId: string; token: string }) => {
    authTokenStore.setToken(data.token);
  });

  socket.on("rooms-list", (list) => rooms.set(list));

  socket.on("room-joined", (data) => {
    currentRoom.set(data.room);
    isAdmin.set(data.room.isAdmin || false);
    isRoomLocked.set(data.room.isLocked || false);
    chatMessages.set([]);
  });

  socket.on("board-state", (boardPixels) => {
    const p: Record<string, string> = {};
    for (const px of boardPixels) {
      p[`${px.x},${px.y}`] = px.color;
    }
    pixels.set(p);
  });

  socket.on("pixel-update", (pixel) => {
    pixels.update((p) => ({
      ...p,
      [`${pixel.x},${pixel.y}`]: pixel.color,
    }));
  });

  socket.on("batch-pixels-update", (pixelList) => {
    pixels.update((p) => {
      const newPixels = { ...p };
      for (const pixel of pixelList) {
        newPixels[`${pixel.x},${pixel.y}`] = pixel.color;
      }
      return newPixels;
    });
  });

  socket.on("pixel-erased", (data) => {
    pixels.update((p) => {
      const newPixels = { ...p };
      delete newPixels[`${data.x},${data.y}`];
      return newPixels;
    });
  });

  socket.on("batch-pixels-erased", (coords) => {
    pixels.update((p) => {
      const newPixels = { ...p };
      for (const coord of coords) {
        delete newPixels[`${coord.x},${coord.y}`];
      }
      return newPixels;
    });
  });

  const cursorTimeouts = new Map<string, NodeJS.Timeout>();

  socket.on("cursor-update", (cursor) => {
    const existingTimeout = cursorTimeouts.get(cursor.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    cursors.update((cs) => ({ ...cs, [cursor.id]: cursor }));

    const timeout = setTimeout(() => {
      cursors.update((cs) => {
        const newCursors = { ...cs };
        delete newCursors[cursor.id];
        return newCursors;
      });
      cursorTimeouts.delete(cursor.id);
    }, 3000);

    cursorTimeouts.set(cursor.id, timeout);
  });

  socket.on("users-update", (data) => {
    users.set(data);
  });

  socket.on("board-cleared", () => pixels.set({}));

  socket.on("error", (message: string) => {
    showError(message);
  });

  socket.on("room-locked", () => {
    showError("This room is locked. Only the admin can invite users.");
  });

  socket.on("room-locked-status", (data) => {
    isRoomLocked.set(data.isLocked);
  });

  socket.on("kicked-from-room", () => {
    showError("You have been kicked from this room by the admin.");
    leaveRoom();
  });

  socket.on("room-deleted", () => {
    showError("This room has been deleted by the admin.");
    leaveRoom();
  });

  socket.on("password-incorrect", (data) => {
    showError(`Incorrect password for room ${data.roomId}`);
  });

  socket.on("chat-message", (data) => {
    chatMessages.update((messages) => [...messages, data]);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
