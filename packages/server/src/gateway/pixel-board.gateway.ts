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
import { BoardService } from "src/board/board.service";
import {
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

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const roomId = this.userRooms.get(client.id);
    if (!roomId) return;

    const room = this.roomsService.getRoom(roomId);
    if (!room) return;

    this.boardService.removeUser(roomId, client.id);
    this.roomsService.decrementUserCount(roomId);

    if (room.adminId === client.id && room.adminId !== "system") {
      const remainingUsers = this.boardService.getUsers(roomId);
      if (remainingUsers.length > 0) {
        room.adminId = remainingUsers[0].id;
      } else {
        this.boardService.deleteRoomData(roomId);
        this.roomsService.deleteRoom(roomId);
        this.server.emit("rooms-list", this.roomsService.getAllRooms());
        this.userRooms.delete(client.id);
        return;
      }
    }

    this.broadcastRoomUpdate(roomId);
    this.userRooms.delete(client.id);
  }

  @SubscribeMessage("set-nickname")
  handleSetNickname(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const result = safeParse(NicknameSchema, data);
    if (!result.success) {
      client.emit("error", result.issues[0]?.message || "Invalid nickname");
      return;
    }

    this.boardService.setNickname(client.id, result.output.nickname);

    const roomId = this.userRooms.get(client.id);
    if (roomId) {
      this.server
        .to(roomId)
        .emit("users-update", this.boardService.getUsers(roomId));
    }
  }

  @SubscribeMessage("join-room")
  handleJoinRoom(
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

    if (!this.roomsService.canUserJoin(roomId, client.id)) {
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
    this.boardService.addUser(roomId, client.id);
    this.roomsService.incrementUserCount(roomId);

    const room = this.roomsService.getRoom(roomId);
    const isAdmin = this.roomsService.isAdmin(roomId, client.id);

    client.emit("board-state", this.boardService.getBoard(roomId));
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
  handleCreateRoom(
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

    const room = this.roomsService.createRoom(
      roomId,
      roomName,
      client.id,
      password && password.trim() !== "" ? password : undefined,
    );
    this.server.emit("rooms-list", this.roomsService.getAllRooms());
    client.emit("room-created", room);
  }

  @SubscribeMessage("get-rooms")
  handleGetRooms(@ConnectedSocket() client: Socket) {
    client.emit("rooms-list", this.roomsService.getAllRooms());
  }

  @SubscribeMessage("lock-room")
  handleLockRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomsService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.roomsService.lockRoom(roomId);
    this.server.to(roomId).emit("room-locked-status", { isLocked: true });
    this.server.emit("rooms-list", this.roomsService.getAllRooms());
  }

  @SubscribeMessage("unlock-room")
  handleUnlockRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomsService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.roomsService.unlockRoom(roomId);
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

    if (!this.roomsService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    const { userId } = result.output;
    this.roomsService.kickUser(roomId, userId);

    const userSocket = this.server.sockets.sockets.get(userId);
    if (userSocket) {
      userSocket.leave(roomId);
      userSocket.emit("kicked-from-room", { roomId });

      this.userRooms.delete(userId);
      this.boardService.removeUser(roomId, userId);
      this.roomsService.decrementUserCount(roomId);
      this.broadcastRoomUpdate(roomId);
    }
  }

  @SubscribeMessage("delete-room")
  handleDeleteRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomsService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.server.to(roomId).emit("room-deleted", { roomId });

    this.boardService.deleteRoomData(roomId);
    this.roomsService.deleteRoom(roomId);

    this.server.emit("rooms-list", this.roomsService.getAllRooms());
  }

  @SubscribeMessage("draw-pixel")
  handleDrawPixel(
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
      const pixel = this.boardService.setPixel(
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

    this.boardService.updateUserCursor(
      roomId,
      client.id,
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
  handleClearBoard(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomsService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.boardService.clearBoard(roomId);
    this.server.to(roomId).emit("board-cleared");
  }
}
