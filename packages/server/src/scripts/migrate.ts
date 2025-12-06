import { migrateToLatest, migrateDown } from "../database/migrator";
import { db } from "../database/connection";

const command = process.argv[2];

async function main() {
  if (command === "up" || command === "latest") {
    console.log("Running migrations...");
    await migrateToLatest();
    console.log("Migrations completed!");
  } else if (command === "down") {
    console.log("Reverting last migration...");
    await migrateDown();
    console.log("Migration reverted!");
  } else {
    console.log("Usage: bun run migrate [up|down|latest]");
    process.exit(1);
  }

  await db.destroy();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
