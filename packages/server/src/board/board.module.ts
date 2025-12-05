import { Module } from "@nestjs/common";
import { BoardService } from "src/board/board.service";

@Module({
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
