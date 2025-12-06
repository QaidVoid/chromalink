import { promises as fs } from "node:fs";
import path from "node:path";
import { FileMigrationProvider, Migrator } from "kysely";
import { db } from "./connection";

export async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  for (const result of results ?? []) {
    if (result.status === "Success") {
      console.log(
        `Migration "${result.migrationName}" was executed successfully`,
      );
    } else if (result.status === "Error") {
      console.error(`Failed to execute migration "${result.migrationName}"`);
    }
  }

  if (error) {
    console.error("Failed to migrate");
    console.error(error);
    process.exit(1);
  }
}

export async function migrateDown() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  const { error, results } = await migrator.migrateDown();

  for (const result of results ?? []) {
    if (result.status === "Success") {
      console.log(
        `Migration "${result.migrationName}" was reverted successfully`,
      );
    } else if (result.status === "Error") {
      console.error(`Failed to revert migration "${result.migrationName}"`);
    }
  }

  if (error) {
    console.error("Failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}
