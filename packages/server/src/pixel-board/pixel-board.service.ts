import assert from "node:assert";
import { Injectable } from "@nestjs/common";
import type { Pixel, User } from "src/pixel-board/pixel-board.interface";

@Injectable()
export class PixelBoardService {
  private boards: Map<string, Map<string, string>> = new Map();
  private users: Map<string, Map<string, User>> = new Map();
  private nicknames: Map<string, string> = new Map();
  private readonly BOARD_WIDTH = 48;
  private readonly BOARD_HEIGHT = 48;

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
    if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT) {
      throw new Error("Pixel out of bounds");
    }

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
      color: "#000000",
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
