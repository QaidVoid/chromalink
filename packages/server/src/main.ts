import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { migrateToLatest } from "./database/migrator";

async function bootstrap() {
  console.log("Running database migrations...");
  await migrateToLatest();
  console.log("Database migrations completed");

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
