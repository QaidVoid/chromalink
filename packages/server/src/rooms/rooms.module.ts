import { Module } from "@nestjs/common";
import { RoomsService } from "src/rooms/rooms.service";

@Module({
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
