import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { migrateToLatest } from "./database/migrator";

async function bootstrap() {
  console.log("Running database migrations...");
  await migrateToLatest();
  console.log("Database migrations completed");

  const app = await NestFactory.create(AppModule);

  // Configure CORS
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : "*";

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for: ${Array.isArray(corsOrigins) ? corsOrigins.join(", ") : corsOrigins}`);
}
bootstrap();
