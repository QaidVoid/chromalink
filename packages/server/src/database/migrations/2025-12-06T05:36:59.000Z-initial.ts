import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("room")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("password", "text")
    .addColumn("admin_id", "text", (col) => col.notNull())
    .addColumn("is_locked", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "text", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  await db.schema
    .createTable("board")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("room_id", "text", (col) =>
      col.references("room.id").onDelete("cascade").notNull(),
    )
    .addColumn("x", "integer", (col) => col.notNull())
    .addColumn("y", "integer", (col) => col.notNull())
    .addColumn("color", "text", (col) => col.notNull())
    .addColumn("updated_at", "text", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex("board_room_id_index")
    .on("board")
    .column("room_id")
    .execute();

  await db.schema
    .createIndex("board_room_id_x_y_unique")
    .on("board")
    .columns(["room_id", "x", "y"])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("board").execute();
  await db.schema.dropTable("room").execute();
}
