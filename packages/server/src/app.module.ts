import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { DatabaseModule } from "src/database/database.module";
import { GatewayModule } from "src/gateway/gateway.module";

@Module({
  imports: [CommonModule, DatabaseModule, GatewayModule],
})
export class AppModule {}
