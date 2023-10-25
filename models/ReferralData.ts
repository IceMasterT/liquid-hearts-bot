import { ObjectId } from "mongodb";

export type ReferralData = {
  // This is the User that follows the Deep Link, the new user
  child: ObjectId;

  // This is the User that the Deep Link contains
  parent: ObjectId;
};
