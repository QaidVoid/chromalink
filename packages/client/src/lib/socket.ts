import { io, type Socket } from "socket.io-client";
import { currentRoom, cursors, pixels, rooms, userCount } from "./stores";

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;

  socket = io();

  socket.on("rooms-list", (list) => rooms.set(list));

  socket.on("room-joined", (data) => {
    currentRoom.set(data.room);
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

  socket.on("cursor-update", (cursor) => {
    cursors.update((cs) => ({ ...cs, [cursor.id]: cursor }));
    setTimeout(() => {
      cursors.update((cs) => {
        const newCursors = { ...cs };
        delete newCursors[cursor.id];
        return newCursors;
      });
    }, 100);
  });

  socket.on("users-update", (users) => {
    userCount.set(users.length);
  });

  socket.on("board-cleared", () => pixels.set({}));

  return socket;
};

export const getSocket = () => socket;
