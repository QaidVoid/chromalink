import { Injectable } from "@nestjs/common";
import type { Pixel, User } from "src/pixel-board/pixel-board.interface";

@Injectable()
export class PixelBoardService {
  private board: Map<string, string> = new Map();
  private users: Map<string, User> = new Map();
  private readonly BOARD_WIDTH = 48;
  private readonly BOARD_HEIGHT = 48;

  getBoard(): Pixel[] {
    const pixels: Pixel[] = [];

    for (const [key, color] of this.board) {
      const [x, y] = key.split(",").map(Number);
      pixels.push({ x, y, color });
    }
    return pixels;
  }

  setPixel(x: number, y: number, color: string): Pixel {
    if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT) {
      throw new Error("Pixel out of bounds");
    }

    const key = `${x},${y}`;
    this.board.set(key, color);
    return { x, y, color };
  }

  updateUserCursor(userId: string, x: number, y: number, color: string) {
    this.users.set(userId, { id: userId, x, y, color });
  }

  removeUser(userId: string) {
    this.users.delete(userId);
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  clearBoard() {
    this.board.clear();
  }
}
