import { Injectable, OnModuleInit } from "@nestjs/common";
import { sql } from "kysely";
import { db } from "./connection";
import type { NewRoom, NewUser, RoomUpdate, UserUpdate } from "./types";

@Injectable()
export class DatabaseService implements OnModuleInit {
  async onModuleInit() {
    console.log("Database connection initialized");
  }

  async createUser(user: NewUser) {
    return await db
      .insertInto("user")
      .values(user)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getUser(id: string) {
    return await db
      .selectFrom("user")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async getUserByNickname(nickname: string) {
    return await db
      .selectFrom("user")
      .selectAll()
      .where("nickname", "=", nickname)
      .executeTakeFirst();
  }

  async updateUser(id: string, update: UserUpdate) {
    return await db
      .updateTable("user")
      .set(update)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async createRoom(room: NewRoom) {
    return await db
      .insertInto("room")
      .values(room)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getRoom(id: string) {
    return await db
      .selectFrom("room")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async getAllRooms() {
    return await db.selectFrom("room").selectAll().execute();
  }

  async updateRoom(id: string, update: RoomUpdate) {
    return await db
      .updateTable("room")
      .set(update)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteRoom(id: string) {
    return await db.deleteFrom("room").where("id", "=", id).executeTakeFirst();
  }

  async setPixel(roomId: string, x: number, y: number, color: string) {
    return await db
      .insertInto("board")
      .values({ room_id: roomId, x, y, color })
      .onConflict((oc) =>
        oc.columns(["room_id", "x", "y"]).doUpdateSet({
          color,
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();
  }

  async deletePixel(roomId: string, x: number, y: number) {
    return await db
      .deleteFrom("board")
      .where("room_id", "=", roomId)
      .where("x", "=", x)
      .where("y", "=", y)
      .execute();
  }

  async getBoard(roomId: string) {
    return await db
      .selectFrom("board")
      .selectAll()
      .where("room_id", "=", roomId)
      .execute();
  }

  async clearBoard(roomId: string) {
    return await db.deleteFrom("board").where("room_id", "=", roomId).execute();
  }

  async batchSetPixels(
    roomId: string,
    pixels: { x: number; y: number; color: string }[],
  ) {
    if (pixels.length === 0) return;

    const values = pixels.map((p) => ({
      room_id: roomId,
      x: p.x,
      y: p.y,
      color: p.color,
    }));

    return await db
      .insertInto("board")
      .values(values)
      .onConflict((oc) =>
        oc.columns(["room_id", "x", "y"]).doUpdateSet({
          color: sql.raw("excluded.color"),
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();
  }

  async batchDeletePixels(roomId: string, pixels: { x: number; y: number }[]) {
    if (pixels.length === 0) return;

    let query = db.deleteFrom("board").where("room_id", "=", roomId);

    query = query.where((eb) => {
      const conditions = pixels.map((p) =>
        eb.and([eb("x", "=", p.x), eb("y", "=", p.y)]),
      );
      return eb.or(conditions);
    });

    return await query.execute();
  }
}
