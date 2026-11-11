import { sql } from "drizzle-orm";
import { db } from "../src/db";

async function main() {
  const result = await db.execute(sql`select current_database() as database, 1 as ok`);
  console.log(result.rows[0]);

  const tables = await db.execute(
    sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`,
  );
  console.log(tables.rows.map((row) => row.table_name));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
