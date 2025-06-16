import 'dotenv/config';
import { drizzle } from "drizzle-orm/postgres-js";
import pkg from "postgres";
const postgres = pkg;
import * as schema from "../shared/schema";

// Connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export all schema for convenience
export * from "../shared/schema";

(async () => {
  const result = await db.select().from(schema.leads);
  console.log(result);
})();