import { Module } from "@nestjs/common";
import { PixelBoardModule } from "src/pixel-board/pixel-board.module";

@Module({
  imports: [PixelBoardModule],
})
export class AppModule {}
