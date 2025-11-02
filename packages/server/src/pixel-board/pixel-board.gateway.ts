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

  constructor(private readonly pixelBoardService: PixelBoardService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.emit("board-update", this.pixelBoardService.getBoard());
    client.emit("users-update", this.pixelBoardService.getUsers());
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.pixelBoardService.removeUser(client.id);
    this.server.emit("users-update", this.pixelBoardService.getUsers());
  }

  @SubscribeMessage("draw-pixel")
  handleDrawPixel(
    @MessageBody() data: { x: number; y: number; color: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const pixel = this.pixelBoardService.setPixel(data.x, data.y, data.color);
      this.server.emit("pixel-update", pixel);
    } catch (error) {
      client.emit("error", error.message);
    }
  }

  @SubscribeMessage("cursor-move")
  handleCursorMove(
    @MessageBody() data: { x: number; y: number; color: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.pixelBoardService.updateUserCursor(
      client.id,
      data.x,
      data.y,
      data.color,
    );
    client.broadcast.emit("cursor-update", {
      id: client.id,
      x: data.x,
      y: data.y,
      color: data.color,
    });
  }

  @SubscribeMessage("clear-board")
  handleClearBoard() {
    this.pixelBoardService.clearBoard();
    this.server.emit("board-cleared");
  }
}
