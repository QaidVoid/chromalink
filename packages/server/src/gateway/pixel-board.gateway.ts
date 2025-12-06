import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { AuthService } from "src/common/auth.service";
import { BoardService } from "src/board/board.service";
import {
  ChatMessageSchema,
  CreateRoomSchema,
  CursorMoveSchema,
  DrawPixelSchema,
  JoinRoomSchema,
  KickUserSchema,
  NicknameSchema,
} from "src/common/validation/schemas";
import { RoomsService } from "src/rooms/rooms.service";
import { safeParse } from "valibot";

@WebSocketGateway()
export class PixelBoardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userRooms: Map<string, string> = new Map();

  constructor(
    private readonly authService: AuthService,
    private readonly boardService: BoardService,
    private readonly roomsService: RoomsService,
  ) {}

  private broadcastRoomUpdate(roomId: string) {
    this.server
      .to(roomId)
      .emit("users-update", this.boardService.getUsers(roomId));
    this.server.emit("rooms-list", this.roomsService.getAllRooms());
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.emit("rooms-list", this.roomsService.getAllRooms());
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      this.authService.removeSocketSession(client.id);
      return;
    }

    const room = this.roomsService.getRoom(roomId);
    if (!room) {
      this.authService.removeSocketSession(client.id);
      return;
    }

    this.boardService.removeUser(roomId, client.id);
    this.roomsService.decrementUserCount(roomId);

    this.broadcastRoomUpdate(roomId);
    this.userRooms.delete(client.id);
    this.authService.removeSocketSession(client.id);
  }

  @SubscribeMessage("set-nickname")
  async handleSetNickname(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const result = safeParse(NicknameSchema, data);
    if (!result.success) {
      client.emit("error", result.issues[0]?.message || "Invalid nickname");
      return;
    }

    try {
      const authResult = await this.authService.authenticateWithToken(
        result.output.token,
        result.output.nickname,
      );

      if (!authResult) {
        client.emit("error", "Authentication failed");
        return;
      }

      this.authService.setSocketSession(client.id, authResult.userId);

      this.boardService.setNickname(client.id, result.output.nickname);

      client.emit("user-authenticated", {
        userId: authResult.userId,
        token: authResult.token,
      });

      const roomId = this.userRooms.get(client.id);
      if (roomId) {
        this.server
          .to(roomId)
          .emit("users-update", this.boardService.getUsers(roomId));
      }
    } catch (error) {
      console.error("Error authenticating user:", error);
      client.emit("error", "Failed to set nickname");
    }
  }

  @SubscribeMessage("join-room")
  async handleJoinRoom(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const result = safeParse(JoinRoomSchema, data);
    if (!result.success) {
      client.emit("error", result.issues[0]?.message || "Invalid data");
      return;
    }

    const { roomId, password } = result.output;

    if (!this.roomsService.roomExists(roomId)) {
      client.emit("error", "Room does not exist");
      return;
    }

    if (!this.roomsService.verifyPassword(roomId, password || "")) {
      client.emit("password-incorrect", { roomId });
      return;
    }

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId) {
      client.emit("error", "Not authenticated");
      return;
    }

    if (!this.roomsService.canUserJoin(roomId, userId)) {
      client.emit("room-locked", { roomId });
      return;
    }

    const previousRoom = this.userRooms.get(client.id);
    if (previousRoom) {
      client.leave(previousRoom);

      this.boardService.removeUser(previousRoom, client.id);
      this.roomsService.decrementUserCount(previousRoom);
      this.server
        .to(previousRoom)
        .emit("users-update", this.boardService.getUsers(previousRoom));
      this.server.emit("rooms-list", this.roomsService.getAllRooms());
    }

    client.join(roomId);
    this.userRooms.set(client.id, roomId);
    this.boardService.addUser(roomId, client.id, userId);
    this.roomsService.incrementUserCount(roomId);

    const room = this.roomsService.getRoom(roomId);
    const isAdmin = this.roomsService.isAdmin(roomId, userId);

    client.emit("board-state", await this.boardService.getBoard(roomId));
    client.emit("room-joined", {
      roomId,
      room: {
        ...room,
        isAdmin,
        password: undefined,
      },
    });

    this.broadcastRoomUpdate(roomId);
  }

  @SubscribeMessage("create-room")
  async handleCreateRoom(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const result = safeParse(CreateRoomSchema, data);
    if (!result.success) {
      client.emit("error", result.issues[0]?.message || "Invalid data");
      return;
    }

    const { roomId, roomName, password } = result.output;

    if (this.roomsService.roomExists(roomId)) {
      client.emit("error", "Room already exists");
      return;
    }

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId) {
      client.emit("error", "Not authenticated");
      return;
    }

    try {
      const room = await this.roomsService.createRoom(
        roomId,
        roomName,
        userId,
        password && password.trim() !== "" ? password : undefined,
      );
      this.server.emit("rooms-list", this.roomsService.getAllRooms());
      client.emit("room-created", room);
    } catch (error) {
      console.error("Error creating room:", error);
      client.emit("error", "Failed to create room");
    }
  }

  @SubscribeMessage("get-rooms")
  handleGetRooms(@ConnectedSocket() client: Socket) {
    client.emit("rooms-list", this.roomsService.getAllRooms());
  }

  @SubscribeMessage("lock-room")
  async handleLockRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId || !this.roomsService.isAdmin(roomId, userId)) {
      client.emit("error", "Not authorized");
      return;
    }

    await this.roomsService.lockRoom(roomId);
    this.server.to(roomId).emit("room-locked-status", { isLocked: true });
    this.server.emit("rooms-list", this.roomsService.getAllRooms());
  }

  @SubscribeMessage("unlock-room")
  async handleUnlockRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId || !this.roomsService.isAdmin(roomId, userId)) {
      client.emit("error", "Not authorized");
      return;
    }

    await this.roomsService.unlockRoom(roomId);
    this.server.to(roomId).emit("room-locked-status", { isLocked: false });
    this.server.emit("rooms-list", this.roomsService.getAllRooms());
  }

  @SubscribeMessage("kick-user")
  handleKickUser(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const result = safeParse(KickUserSchema, data);
    if (!result.success) {
      client.emit("error", result.issues[0]?.message || "Invalid data");
      return;
    }

    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId || !this.roomsService.isAdmin(roomId, userId)) {
      client.emit("error", "Not authorized");
      return;
    }

    const { userId: targetUserId } = result.output;
    this.roomsService.kickUser(roomId, targetUserId);

    const targetSocketId = this.authService.getSocketIdFromUserId(targetUserId);
    if (targetSocketId) {
      const userSocket = this.server.sockets.sockets.get(targetSocketId);
      if (userSocket) {
        userSocket.leave(roomId);
        userSocket.emit("kicked-from-room", { roomId });

        this.userRooms.delete(targetSocketId);
        this.boardService.removeUser(roomId, targetSocketId);
        this.roomsService.decrementUserCount(roomId);
        this.broadcastRoomUpdate(roomId);
      }
    }
  }

  @SubscribeMessage("delete-room")
  async handleDeleteRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId || !this.roomsService.isAdmin(roomId, userId)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.server.to(roomId).emit("room-deleted", { roomId });

    this.boardService.deleteRoomData(roomId);
    await this.roomsService.deleteRoom(roomId);

    this.server.emit("rooms-list", this.roomsService.getAllRooms());
  }

  @SubscribeMessage("draw-pixel")
  async handleDrawPixel(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const result = safeParse(DrawPixelSchema, data);
    if (!result.success) {
      client.emit("error", result.issues[0]?.message || "Invalid data");
      return;
    }

    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    try {
      const pixel = await this.boardService.setPixel(
        roomId,
        result.output.x,
        result.output.y,
        result.output.color,
      );
      this.server.to(roomId).emit("pixel-update", pixel);
    } catch (error) {
      client.emit("error", error.message);
    }
  }

  @SubscribeMessage("cursor-move")
  handleCursorMove(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const result = safeParse(CursorMoveSchema, data);
    if (!result.success) return;

    const roomId = this.userRooms.get(client.id);
    if (!roomId) return;

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId) return;

    this.boardService.updateUserCursor(
      roomId,
      client.id,
      userId,
      result.output.x,
      result.output.y,
      result.output.color,
    );
    client.to(roomId).emit("cursor-update", {
      id: client.id,
      x: result.output.x,
      y: result.output.y,
      color: result.output.color,
    });
  }

  @SubscribeMessage("clear-board")
  async handleClearBoard(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId || !this.roomsService.isAdmin(roomId, userId)) {
      client.emit("error", "Not authorized");
      return;
    }

    await this.boardService.clearBoard(roomId);
    this.server.to(roomId).emit("board-cleared");
  }

  @SubscribeMessage("send-message")
  handleChatMessage(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const result = safeParse(ChatMessageSchema, data);
    if (!result.success) {
      client.emit("error", result.issues[0]?.message || "Invalid message");
      return;
    }

    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    const userId = this.authService.getUserIdFromSocket(client.id);
    if (!userId) {
      client.emit("error", "Not authenticated");
      return;
    }

    const nickname = this.boardService.getNickname(client.id);

    this.server.to(roomId).emit("chat-message", {
      userId,
      nickname,
      message: result.output.message,
      timestamp: new Date().toISOString(),
    });
  }
}
