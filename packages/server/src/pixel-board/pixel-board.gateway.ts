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

@WebSocketGateway({
  // TODO: remove later
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: false,
  },
})
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

    const previousRoom = this.userRooms.get(client.id);
    if (previousRoom) {
      client.leave(previousRoom);

      this.pixelBoardService.removeUser(previousRoom, client.id);
      this.roomService.decrementUserCount(previousRoom);
      this.server
        .to(previousRoom)
        .emit("users-update", this.pixelBoardService.getUsers(previousRoom));
    }

    if (!this.roomService.roomExists(roomId)) {
      this.roomService.createRoom(roomId, roomId);
    }

    client.join(roomId);
    this.userRooms.set(client.id, roomId);
    this.roomService.incrementUserCount(roomId);

    client.emit("board-state", this.pixelBoardService.getBoard(roomId));
    client.emit("users-update", this.pixelBoardService.getUsers(roomId));
    client.emit("room-joined", {
      roomId,
      room: this.roomService.getRoom(roomId),
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

    const room = this.roomService.createRoom(roomId, roomName);
    this.server.emit("rooms-list", this.roomService.getAllRooms());
    client.emit("room-created", room);
  }

  @SubscribeMessage("get-rooms")
  handleGetRooms(@ConnectedSocket() client: Socket) {
    client.emit("rooms-list", this.roomService.getAllRooms());
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

    this.pixelBoardService.clearBoard(roomId);
    this.server.to(roomId).emit("board-cleared");
  }
}
