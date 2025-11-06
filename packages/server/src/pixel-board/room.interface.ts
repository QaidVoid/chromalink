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
