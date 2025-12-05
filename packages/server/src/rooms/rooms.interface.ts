export interface Room {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
  adminId: string;
  isLocked: boolean;
  allowedUsers: Set<string>;
  password?: string;
}

export interface RoomListItem {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
  isLocked: boolean;
  hasPassword: boolean;
}

export interface RoomJoinedPayload {
  roomId: string;
  room: RoomListItem & {
    isAdmin: boolean;
  };
}
