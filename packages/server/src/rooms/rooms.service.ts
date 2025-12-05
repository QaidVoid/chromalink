import { Injectable } from "@nestjs/common";
import { DEFAULT_ROOMS, SYSTEM_ADMIN_ID } from "src/rooms/rooms.constants";
import type { Room, RoomListItem } from "src/rooms/rooms.interface";

@Injectable()
export class RoomsService {
  private rooms: Map<string, Room> = new Map();

  constructor() {
    for (const { id, name } of DEFAULT_ROOMS) {
      this.createRoom(id, name, SYSTEM_ADMIN_ID);
    }
  }

  createRoom(
    id: string,
    name: string,
    adminId: string,
    password?: string,
  ): Room {
    const room: Room = {
      id,
      name,
      userCount: 0,
      createdAt: new Date(),
      adminId,
      isLocked: false,
      allowedUsers: new Set<string>(),
      password,
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  getAllRooms(): RoomListItem[] {
    return Array.from(this.rooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      userCount: room.userCount,
      createdAt: room.createdAt,
      isLocked: room.isLocked,
      hasPassword: room.password !== undefined,
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
    return room?.adminId === userId;
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
      return true;
    }
    return false;
  }

  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room?.adminId !== SYSTEM_ADMIN_ID) {
      return this.rooms.delete(roomId);
    }
    return false;
  }

  verifyPassword(roomId: string, password: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (!room.password) return true;
    return room.password === password;
  }
}
