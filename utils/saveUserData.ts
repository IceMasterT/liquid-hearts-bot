import { ObjectId } from "mongodb";
import { db } from "../config/mongoConfig";
import { DBUser } from "../models/DBUser";

export async function saveUserData(data: DBUser): Promise<ObjectId> {
  const result = await db.collection("users").insertOne(data);

  return result.insertedId;
}
