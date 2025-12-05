import * as v from "valibot";

export const nicknameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, "Nickname cannot be empty"),
  v.maxLength(20, "Nickname must be 20 characters or less"),
);

export const roomIdSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, "Room ID cannot be empty"),
  v.regex(
    /^[a-z0-9-]+$/,
    "Room ID can only contain lowercase letters, numbers, and hyphens",
  ),
);

export const roomNameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, "Room name cannot be empty"),
  v.maxLength(50, "Room name must be 50 characters or less"),
);

export const passwordSchema = v.optional(v.string());

export const createRoomSchema = v.object({
  id: roomIdSchema,
  name: roomNameSchema,
  password: passwordSchema,
});

export const hexColorSchema = v.pipe(
  v.string(),
  v.regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
);

export type CreateRoomData = v.InferOutput<typeof createRoomSchema>;

export const validateNickname = (nickname: string): string | null => {
  const result = v.safeParse(nicknameSchema, nickname);
  if (!result.success) {
    return result.issues[0]?.message || "Invalid nickname";
  }
  return null;
};

export const validateRoomId = (roomId: string): string | null => {
  const result = v.safeParse(roomIdSchema, roomId);
  if (!result.success) {
    return result.issues[0]?.message || "Invalid room ID";
  }
  return null;
};

export const validateRoomName = (roomName: string): string | null => {
  const result = v.safeParse(roomNameSchema, roomName);
  if (!result.success) {
    return result.issues[0]?.message || "Invalid room name";
  }
  return null;
};

export const validateCreateRoom = (
  data: CreateRoomData,
): { success: true; data: CreateRoomData } | { success: false; error: string } => {
  const result = v.safeParse(createRoomSchema, data);
  if (!result.success) {
    return {
      success: false,
      error: result.issues[0]?.message || "Invalid room data",
    };
  }
  return { success: true, data: result.output };
};
