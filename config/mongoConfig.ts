import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI!;

const client = new MongoClient(uri);

export const db = client.db("moral_panic_bot");
