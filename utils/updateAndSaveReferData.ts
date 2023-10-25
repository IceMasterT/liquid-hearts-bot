import { ObjectId } from "mongodb";
import { db } from "../config/mongoConfig";
import { DBUser } from "../models/DBUser";
import { ReferralData } from "../models/ReferralData";

export async function updateAndSaveReferData(
  referredId: ObjectId,
  referringId: ObjectId
): Promise<void> {
  const userCollection = db.collection<DBUser>("users");
  const referrerLinksRelationCollection =
    db.collection<ReferralData>("referral_data");

  await userCollection.updateOne(
    { _id: referredId },
    {
      $inc: { referredUsers: 1 },
    }
  );

  await referrerLinksRelationCollection.insertOne({
    parent: referredId,
    child: referringId,
  });
}
