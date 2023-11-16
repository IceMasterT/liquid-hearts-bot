import { ObjectId } from "mongodb";

export type DBUser = {
  _id?: ObjectId;
  telegramId: number;
  addressPublicKey: string;
  addressPrivateKey: string;
  username: string;
  firstName: string;
  lastName: string;
  image: string;
  bio: string;
  referredUsers: number;
  chatId?: number;
};
