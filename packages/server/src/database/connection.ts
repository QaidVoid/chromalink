import * as path from "node:path";
import { Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-worker/normal";
import type { Database } from "./types";

const dbPath = path.join(process.cwd(), "chromalink.db");

const dialect = new BunSqliteDialect({
  url: dbPath,
});

export const db = new Kysely<Database>({
  dialect,
});
