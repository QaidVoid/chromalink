import { Module } from "@nestjs/common";
import { BoardModule } from "src/board/board.module";
import { PixelBoardGateway } from "src/gateway/pixel-board.gateway";
import { RoomsModule } from "src/rooms/rooms.module";

@Module({
  imports: [BoardModule, RoomsModule],
  providers: [PixelBoardGateway],
})
export class GatewayModule {}
