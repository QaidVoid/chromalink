import {
  type InferOutput,
  array,
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

export const BatchDrawPixelsSchema = object({
  pixels: pipe(
    array(
      object({
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
      }),
    ),
    maxLength(64, "Cannot draw more than 64 pixels at once"),
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

export const BatchErasePixelsSchema = object({
  pixels: pipe(
    array(
      object({
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
      }),
    ),
    maxLength(64, "Cannot erase more than 64 pixels at once"),
  ),
});

export const CursorMoveSchema = object({
  x: pipe(number(), integer()),
  y: pipe(number(), integer()),
  color: pipe(
    string(),
    regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"),
  ),
  size: pipe(
    number(),
    integer(),
    minValue(1, "Brush size must be >= 1"),
    maxValue(8, "Brush size must be <= 8"),
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
export type BatchDrawPixelsInput = InferOutput<typeof BatchDrawPixelsSchema>;
export type ErasePixelInput = InferOutput<typeof ErasePixelSchema>;
export type BatchErasePixelsInput = InferOutput<typeof BatchErasePixelsSchema>;
export type CursorMoveInput = InferOutput<typeof CursorMoveSchema>;
export type KickUserInput = InferOutput<typeof KickUserSchema>;
export type ChatMessageInput = InferOutput<typeof ChatMessageSchema>;
