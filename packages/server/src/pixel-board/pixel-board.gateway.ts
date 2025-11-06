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
import { PixelBoardService } from "src/pixel-board/pixel-board.service";
import { RoomService } from "src/pixel-board/room.service";

@WebSocketGateway()
export class PixelBoardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userRooms: Map<string, string> = new Map();

  constructor(
    private readonly pixelBoardService: PixelBoardService,
    private readonly roomService: RoomService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.emit("rooms-list", this.roomService.getAllRooms());
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const roomId = this.userRooms.get(client.id);
    if (roomId) {
      this.pixelBoardService.removeUser(roomId, client.id);
      this.roomService.decrementUserCount(roomId);
      this.server
        .to(roomId)
        .emit("users-update", this.pixelBoardService.getUsers(roomId));
      this.server.emit("rooms-list", this.roomService.getAllRooms());
      this.userRooms.delete(client.id);
    }
  }

  @SubscribeMessage("join-room")
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    if (!this.roomService.roomExists(roomId)) {
      client.emit("error", "Room does not exist");
      return;
    }

    if (!this.roomService.canUserJoin(roomId, client.id)) {
      client.emit("room-locked", { roomId });
      return;
    }

    const previousRoom = this.userRooms.get(client.id);
    if (previousRoom) {
      client.leave(previousRoom);

      this.pixelBoardService.removeUser(previousRoom, client.id);
      this.roomService.decrementUserCount(previousRoom);
      this.server
        .to(previousRoom)
        .emit("users-update", this.pixelBoardService.getUsers(previousRoom));
    }

    client.join(roomId);
    this.userRooms.set(client.id, roomId);
    this.pixelBoardService.addUser(roomId, client.id);
    this.roomService.incrementUserCount(roomId);

    const room = this.roomService.getRoom(roomId);
    const isAdmin = this.roomService.isAdmin(roomId, client.id);

    client.emit("board-state", this.pixelBoardService.getBoard(roomId));
    client.emit("room-joined", {
      roomId,
      room: {
        ...room,
        isAdmin,
      },
    });

    this.server.emit("rooms-list", this.roomService.getAllRooms());
    this.server
      .to(roomId)
      .emit("users-update", this.pixelBoardService.getUsers(roomId));
  }

  @SubscribeMessage("create-room")
  handleCreateRoom(
    @MessageBody() data: { roomId: string; roomName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, roomName } = data;

    if (this.roomService.roomExists(roomId)) {
      client.emit("error", "Room already exists");
      return;
    }

    const room = this.roomService.createRoom(roomId, roomName, client.id);
    this.server.emit("rooms-list", this.roomService.getAllRooms());
    client.emit("room-created", room);
  }

  @SubscribeMessage("get-rooms")
  handleGetRooms(@ConnectedSocket() client: Socket) {
    client.emit("rooms-list", this.roomService.getAllRooms());
  }

  @SubscribeMessage("lock-room")
  handleLockRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.roomService.lockRoom(roomId);
    this.server.to(roomId).emit("room-locked-status", { isLocked: true });
    this.server.emit("rooms-list", this.roomService.getAllRooms());
  }

  @SubscribeMessage("unlock-room")
  handleUnlockRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.roomService.unlockRoom(roomId);
    this.server.to(roomId).emit("room-locked-status", { isLocked: false });
    this.server.emit("rooms-list", this.roomService.getAllRooms());
  }

  @SubscribeMessage("kick-user")
  handleKickUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    const { userId } = data;
    this.roomService.kickUser(roomId, userId);

    const userSocket = this.server.sockets.sockets.get(userId);
    if (userSocket) {
      userSocket.leave(roomId);
      userSocket.emit("kicked-from-room", { roomId });

      this.userRooms.delete(userId);
      this.pixelBoardService.removeUser(roomId, userId);
      this.roomService.decrementUserCount(roomId);
      this.server
        .to(roomId)
        .emit("users-update", this.pixelBoardService.getUsers(roomId));
      this.server.emit("rooms-list", this.roomService.getAllRooms());
    }
  }

  @SubscribeMessage("delete-room")
  handleDeleteRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.server.to(roomId).emit("room-deleted", { roomId });

    this.pixelBoardService.deleteRoomData(roomId);
    this.roomService.deleteRoom(roomId);

    this.server.emit("rooms-list", this.roomService.getAllRooms());
  }

  @SubscribeMessage("draw-pixel")
  handleDrawPixel(
    @MessageBody() data: { x: number; y: number; color: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    try {
      const pixel = this.pixelBoardService.setPixel(
        roomId,
        data.x,
        data.y,
        data.color,
      );
      this.server.to(roomId).emit("pixel-update", pixel);
    } catch (error) {
      client.emit("error", error.message);
    }
  }

  @SubscribeMessage("cursor-move")
  handleCursorMove(
    @MessageBody() data: { x: number; y: number; color: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) return;

    this.pixelBoardService.updateUserCursor(
      roomId,
      client.id,
      data.x,
      data.y,
      data.color,
    );
    client.to(roomId).emit("cursor-update", {
      id: client.id,
      x: data.x,
      y: data.y,
      color: data.color,
    });
  }

  @SubscribeMessage("clear-board")
  handleClearBoard(@ConnectedSocket() client: Socket) {
    const roomId = this.userRooms.get(client.id);
    if (!roomId) {
      client.emit("error", "Not in a room");
      return;
    }

    if (!this.roomService.isAdmin(roomId, client.id)) {
      client.emit("error", "Not authorized");
      return;
    }

    this.pixelBoardService.clearBoard(roomId);
    this.server.to(roomId).emit("board-cleared");
  }
}
