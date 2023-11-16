import { ObjectId } from "mongodb";
import { db } from "../config/mongoConfig";
import { DBUser } from "../models/DBUser";

export async function updateChatId(id: number, userId: ObjectId) {
  await db.collection<DBUser>("users").updateOne(
    {
      _id: userId,
    },
    {
      $set: {
        chatId: id,
      },
    },
  );
}
