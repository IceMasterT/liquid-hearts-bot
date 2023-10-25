import { db } from "../config/mongoConfig";
import { DBUser } from "../models/DBUser";

export async function getUserFromDB(id: number): Promise<DBUser | null> {
  const collection = db.collection<DBUser>("users");
  const data = await collection.findOne({ telegramId: id });

  return data;
}
