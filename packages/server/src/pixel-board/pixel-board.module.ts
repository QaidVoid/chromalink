import { Module } from "@nestjs/common";
import { PixelBoardGateway } from "src/pixel-board/pixel-board.gateway";
import { PixelBoardService } from "src/pixel-board/pixel-board.service";

@Module({
  providers: [PixelBoardGateway, PixelBoardService],
})
export class PixelBoardModule {}
