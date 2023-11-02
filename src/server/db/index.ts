import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "~/env.mjs";
import * as schema from "./schema";

export const db = drizzle(
  new Client({
    url: env.DATABASE_URL,
  }).connection(),
  { schema },
);
