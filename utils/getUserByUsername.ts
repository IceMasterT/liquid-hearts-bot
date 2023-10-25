import { db } from "../config/mongoConfig";
import { DBUser } from "../models/DBUser";

export async function getUserByUsername(
  username?: string
): Promise<DBUser | null> {
  if (!username) return null;

  const collection = db.collection<DBUser>("users");
  const data = await collection.findOne({ username: username });

  return data;
}
