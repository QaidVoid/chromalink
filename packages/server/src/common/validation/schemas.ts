import {
  type InferOutput,
  integer,
  maxLength,
  maxValue,
  minLength,
  minValue,
  nullable,
  number,
  object,
  optional,
  pipe,
  regex,
  string,
  trim,
} from "valibot";

export const NicknameSchema = object({
  token: optional(nullable(string())),
  nickname: pipe(
    string(),
    trim(),
    minLength(1, "Nickname cannot be empty"),
    maxLength(20, "Nickname must be 20 characters or less"),
  ),
});

export const CreateRoomSchema = object({
  roomId: pipe(
    string(),
    trim(),
    minLength(1, "Room ID cannot be empty"),
    regex(
      /^[a-z0-9-]+$/,
      "Room ID can only contain lowercase letters, numbers, and hyphens",
    ),
  ),
  roomName: pipe(
    string(),
    trim(),
    minLength(1, "Room name cannot be empty"),
    maxLength(50, "Room name must be 50 characters or less"),
  ),
  password: optional(string()),
});

export const JoinRoomSchema = object({
  roomId: pipe(string(), trim(), minLength(1, "Room ID cannot be empty")),
  password: optional(string()),
});

export const DrawPixelSchema = object({
  x: pipe(
    number(),
    integer(),
    minValue(0, "X coordinate must be >= 0"),
    maxValue(47, "X coordinate must be < 48"),
  ),
  y: pipe(
    number(),
    integer(),
    minValue(0, "Y coordinate must be >= 0"),
    maxValue(47, "Y coordinate must be < 48"),
  ),
  color: pipe(
    string(),
    regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"),
  ),
});

export const ErasePixelSchema = object({
  x: pipe(
    number(),
    integer(),
    minValue(0, "X coordinate must be >= 0"),
    maxValue(47, "X coordinate must be < 48"),
  ),
  y: pipe(
    number(),
    integer(),
    minValue(0, "Y coordinate must be >= 0"),
    maxValue(47, "Y coordinate must be < 48"),
  ),
});

export const CursorMoveSchema = object({
  x: pipe(number(), integer()),
  y: pipe(number(), integer()),
  color: pipe(
    string(),
    regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"),
  ),
});

export const KickUserSchema = object({
  userId: pipe(string(), minLength(1, "User ID cannot be empty")),
});

export const ChatMessageSchema = object({
  message: pipe(
    string(),
    trim(),
    minLength(1, "Message cannot be empty"),
    maxLength(500, "Message must be 500 characters or less"),
  ),
});

export type NicknameInput = InferOutput<typeof NicknameSchema>;
export type CreateRoomInput = InferOutput<typeof CreateRoomSchema>;
export type JoinRoomInput = InferOutput<typeof JoinRoomSchema>;
export type DrawPixelInput = InferOutput<typeof DrawPixelSchema>;
export type ErasePixelInput = InferOutput<typeof ErasePixelSchema>;
export type CursorMoveInput = InferOutput<typeof CursorMoveSchema>;
export type KickUserInput = InferOutput<typeof KickUserSchema>;
export type ChatMessageInput = InferOutput<typeof ChatMessageSchema>;
