import assert from "node:assert";
import { Injectable } from "@nestjs/common";
import { DEFAULT_USER_COLOR } from "src/board/board.constants";
import type { Pixel, User } from "src/board/board.interface";

@Injectable()
export class BoardService {
  private boards: Map<string, Map<string, string>> = new Map();
  private users: Map<string, Map<string, User>> = new Map();
  private nicknames: Map<string, string> = new Map();

  private ensureRoom(roomId: string) {
    if (!this.boards.has(roomId)) {
      this.boards.set(roomId, new Map());
    }

    if (!this.users.has(roomId)) {
      this.users.set(roomId, new Map());
    }
  }

  getBoard(roomId: string): Pixel[] {
    this.ensureRoom(roomId);

    const board = this.boards.get(roomId);

    assert(board, "Board not found");

    const pixels: Pixel[] = [];

    for (const [key, color] of board) {
      const [x, y] = key.split(",").map(Number);
      pixels.push({ x, y, color });
    }
    return pixels;
  }

  setPixel(roomId: string, x: number, y: number, color: string): Pixel {
    this.ensureRoom(roomId);

    const key = `${x},${y}`;

    const board = this.boards.get(roomId);
    assert(board, "Board not found");

    board.set(key, color);
    return { x, y, color };
  }

  updateUserCursor(
    roomId: string,
    userId: string,
    x: number,
    y: number,
    color: string,
  ) {
    this.ensureRoom(roomId);

    const roomUsers = this.users.get(roomId);
    assert(roomUsers, "Room users not found");

    const nickname = this.getNickname(userId);
    roomUsers.set(userId, { id: userId, nickname, x, y, color });
  }

  addUser(roomId: string, userId: string) {
    this.ensureRoom(roomId);

    const roomUsers = this.users.get(roomId);
    assert(roomUsers, "Room users not found");

    const nickname = this.getNickname(userId);

    roomUsers.set(userId, {
      id: userId,
      nickname,
      x: 0,
      y: 0,
      color: DEFAULT_USER_COLOR,
    });
  }

  removeUser(roomId: string, userId: string) {
    const roomUsers = this.users.get(roomId);

    if (roomUsers) {
      roomUsers.delete(userId);
    }
  }

  getUsers(roomId: string): User[] {
    this.ensureRoom(roomId);

    const roomUsers = this.users.get(roomId);
    assert(roomUsers, "Room users not found");

    return Array.from(roomUsers.values());
  }

  clearBoard(roomId: string) {
    this.ensureRoom(roomId);

    const board = this.boards.get(roomId);
    assert(board, "Board not found");

    board.clear();
  }

  deleteRoomData(roomId: string) {
    this.boards.delete(roomId);
    this.users.delete(roomId);
  }

  setNickname(userId: string, nickname: string) {
    this.nicknames.set(userId, nickname);
  }

  getNickname(userId: string): string {
    return this.nicknames.get(userId) || "Anonymous";
  }
}
