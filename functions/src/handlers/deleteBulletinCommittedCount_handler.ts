import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { isNumber } from 'util';

export async function deleteBulletinCommittedCountHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
    const bulletinId = snap.data().bulletinId;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        let counter: number = 0;
        try {
            const bulletinDoc = await t.get(bulletinsDocRef);
            if (bulletinDoc.exists) {
                if (isNumber(bulletinDoc.data().numberOfCommits)) {
                    counter = bulletinDoc.data().numberOfCommits;
                    if (counter > 0) {
                        counter--;
                    }
                }

                await t.update(bulletinsDocRef, {
                    "numberOfCommits": counter
                });
            }

            return Promise.resolve("Success deleteBulletinCommittedCount");
        } catch (error) {
            console.log("ERROR deleteBulletinCommittedCount", error);
            return Promise.reject(error);
        }
    });
}