import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const demo = sqliteTable("demo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
});
