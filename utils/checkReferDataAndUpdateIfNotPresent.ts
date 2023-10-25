import { db } from "../config/mongoConfig";
import { DBUser } from "../models/DBUser";
import { ReferralData } from "../models/ReferralData";
import { getUserFromDB } from "./getUserFromDB";

export async function checkReferDataAndUpdateIfNotPresent(
  deepLinkId: number,
  currentUserId: number
): Promise<string | undefined> {
  const userCollection = db.collection<DBUser>("users");
  const referrerLinksRelationCollection =
    db.collection<ReferralData>("referral_data");

  const [deepLinkUser, currentUser] = await Promise.all([
    getUserFromDB(deepLinkId),
    getUserFromDB(currentUserId),
  ]);

  const referralData = await referrerLinksRelationCollection.findOne({
    referredId: deepLinkUser?._id,
    referringId: currentUser?._id,
  });

  if (!referralData) {
    await referrerLinksRelationCollection.insertOne({
      parent: deepLinkUser?._id!,
      child: currentUser?._id!,
    });

    await userCollection.updateOne(
      { _id: deepLinkUser?._id },
      {
        $inc: { referredUsers: 1 },
      }
    );
    return deepLinkUser?.firstName;
  }
}
