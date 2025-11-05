import { Injectable } from "@nestjs/common";
import type { Room } from "src/pixel-board/room.interface";

@Injectable()
export class RoomService {
  private rooms: Map<string, Room> = new Map();

  constructor() {
    this.createRoom("lobby", "Main Lobby", "system");
    this.createRoom("chill", "Chill Zone", "system");
    this.createRoom("art", "Art Studio", "system");
  }

  createRoom(id: string, name: string, adminId: string): Room {
    const room: Room = {
      id,
      name,
      userCount: 0,
      createdAt: new Date(),
      adminId,
      isLocked: false,
      allowedUsers: new Set<string>(),
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  getAllRooms(): Omit<Room, "adminId" | "allowedUsers">[] {
    return Array.from(this.rooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      userCount: room.userCount,
      createdAt: room.createdAt,
      isLocked: room.isLocked,
    }));
  }

  incrementUserCount(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.userCount++;
    }
  }

  decrementUserCount(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room && room.userCount > 0) {
      room.userCount--;
    }
  }

  roomExists(id: string): boolean {
    return this.rooms.has(id);
  }

  isAdmin(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    return room?.adminId === userId || room?.adminId === "system";
  }

  lockRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.isLocked = true;
      return true;
    }
    return false;
  }

  unlockRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.isLocked = false;
      room.allowedUsers.clear();
      return true;
    }
    return false;
  }

  canUserJoin(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (!room.isLocked) return true;
    return room.adminId === userId || room.allowedUsers.has(userId);
  }

  allowUser(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.allowedUsers.add(userId);
    }
  }

  kickUser(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.allowedUsers.delete(userId);
    }
    return false;
  }

  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room?.adminId !== "system") {
      return this.rooms.delete(roomId);
    }
    return false;
  }
}
