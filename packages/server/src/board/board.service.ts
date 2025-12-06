import assert from "node:assert";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { DEFAULT_USER_COLOR } from "src/board/board.constants";
import type { Pixel, User } from "src/board/board.interface";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class BoardService implements OnModuleInit {
  private boards: Map<string, Map<string, string>> = new Map();
  private users: Map<string, Map<string, User>> = new Map();
  private nicknames: Map<string, string> = new Map();

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    await this.loadBoardsFromDatabase();
  }

  private async loadBoardsFromDatabase() {
    const allBoards = await this.databaseService.getAllRooms();
    for (const room of allBoards) {
      const pixels = await this.databaseService.getBoard(room.id);
      const boardMap = new Map<string, string>();

      for (const pixel of pixels) {
        const key = `${pixel.x},${pixel.y}`;
        boardMap.set(key, pixel.color);
      }

      this.boards.set(room.id, boardMap);
    }
  }

  private ensureRoom(roomId: string) {
    if (!this.boards.has(roomId)) {
      this.boards.set(roomId, new Map());
    }

    if (!this.users.has(roomId)) {
      this.users.set(roomId, new Map());
    }
  }

  async getBoard(roomId: string): Promise<Pixel[]> {
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

  async setPixel(
    roomId: string,
    x: number,
    y: number,
    color: string,
  ): Promise<Pixel> {
    this.ensureRoom(roomId);

    const key = `${x},${y}`;

    const board = this.boards.get(roomId);
    assert(board, "Board not found");

    board.set(key, color);

    await this.databaseService.setPixel(roomId, x, y, color);

    return { x, y, color };
  }

  async erasePixel(roomId: string, x: number, y: number): Promise<void> {
    this.ensureRoom(roomId);

    const key = `${x},${y}`;

    const board = this.boards.get(roomId);
    assert(board, "Board not found");

    board.delete(key);

    await this.databaseService.deletePixel(roomId, x, y);
  }

  updateUserCursor(
    roomId: string,
    socketId: string,
    userId: string,
    x: number,
    y: number,
    color: string,
  ) {
    this.ensureRoom(roomId);

    const roomUsers = this.users.get(roomId);
    assert(roomUsers, "Room users not found");

    const nickname = this.getNickname(socketId);
    roomUsers.set(socketId, { id: socketId, userId, nickname, x, y, color });
  }

  addUser(roomId: string, socketId: string, userId: string) {
    this.ensureRoom(roomId);

    const roomUsers = this.users.get(roomId);
    assert(roomUsers, "Room users not found");

    const nickname = this.getNickname(socketId);

    roomUsers.set(socketId, {
      id: socketId,
      userId,
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

  async clearBoard(roomId: string) {
    this.ensureRoom(roomId);

    const board = this.boards.get(roomId);
    assert(board, "Board not found");

    board.clear();

    await this.databaseService.clearBoard(roomId);
  }

  async deleteRoomData(roomId: string) {
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
