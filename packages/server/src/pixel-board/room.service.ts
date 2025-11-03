import { Injectable } from "@nestjs/common";
import type { Room } from "src/pixel-board/room.interface";

@Injectable()
export class RoomService {
  private rooms: Map<string, Room> = new Map();

  constructor() {
    this.createRoom("lobby", "Main Lobby");
    this.createRoom("chill", "Chill Zone");
    this.createRoom("art", "Art Studio");
  }

  createRoom(id: string, name: string): Room {
    const room: Room = {
      id,
      name,
      userCount: 0,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  incrementUserCount(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.userCount++;
    }
  }

  decrementUserCount(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.userCount--;
    }
  }

  roomExists(id: string): boolean {
    return this.rooms.has(id);
  }
}
