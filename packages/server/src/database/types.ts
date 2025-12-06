import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  user: UserTable;
  room: RoomTable;
  board: BoardTable;
}

export interface UserTable {
  id: string;
  nickname: string;
  token: string;
  created_at: ColumnType<Date, string | undefined, never>;
  last_seen: ColumnType<Date, string | undefined, string>;
}

export interface RoomTable {
  id: string;
  name: string;
  password: string | null;
  admin_id: string;
  is_locked: ColumnType<boolean, boolean | number, boolean | number>;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface BoardTable {
  id: Generated<number>;
  room_id: string;
  x: number;
  y: number;
  color: string;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export type Room = Selectable<RoomTable>;
export type NewRoom = Insertable<RoomTable>;
export type RoomUpdate = Updateable<RoomTable>;

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type Board = Selectable<BoardTable>;
export type NewBoard = Insertable<BoardTable>;
export type BoardUpdate = Updateable<BoardTable>;
