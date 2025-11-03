import { Module } from "@nestjs/common";
import { PixelBoardGateway } from "src/pixel-board/pixel-board.gateway";
import { PixelBoardService } from "src/pixel-board/pixel-board.service";
import { RoomService } from "src/pixel-board/room.service";

@Module({
  providers: [PixelBoardGateway, PixelBoardService, RoomService],
})
export class PixelBoardModule {}
