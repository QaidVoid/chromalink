import { Injectable, OnModuleInit } from "@nestjs/common";
import { DEFAULT_ROOMS, SYSTEM_ADMIN_ID } from "src/rooms/rooms.constants";
import type { Room, RoomListItem } from "src/rooms/rooms.interface";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class RoomsService implements OnModuleInit {
  private rooms: Map<string, Room> = new Map();

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    await this.loadRoomsFromDatabase();

    for (const { id, name } of DEFAULT_ROOMS) {
      if (!this.roomExists(id)) {
        await this.createRoom(id, name, SYSTEM_ADMIN_ID);
      }
    }
  }

  private async loadRoomsFromDatabase() {
    const dbRooms = await this.databaseService.getAllRooms();
    for (const dbRoom of dbRooms) {
      const room: Room = {
        id: dbRoom.id,
        name: dbRoom.name,
        userCount: 0,
        createdAt: new Date(dbRoom.created_at),
        adminId: dbRoom.admin_id,
        isLocked: Boolean(dbRoom.is_locked),
        allowedUsers: new Set<string>(),
        password: dbRoom.password ?? undefined,
      };
      this.rooms.set(room.id, room);
    }
  }

  async createRoom(
    id: string,
    name: string,
    adminId: string,
    password?: string,
  ): Promise<Room> {
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

    try {
      await this.databaseService.createRoom({
        id,
        name,
        admin_id: adminId,
        password: password ?? null,
        is_locked: 0,
      });
    } catch (error) {
      console.error("Database error creating room:", error);
      throw error;
    }

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

  async lockRoom(roomId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.isLocked = true;
      await this.databaseService.updateRoom(roomId, { is_locked: 1 });
      return true;
    }
    return false;
  }

  async unlockRoom(roomId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.isLocked = false;
      room.allowedUsers.clear();
      await this.databaseService.updateRoom(roomId, { is_locked: 0 });
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

  async deleteRoom(roomId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (room?.adminId !== SYSTEM_ADMIN_ID) {
      await this.databaseService.deleteRoom(roomId);
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
