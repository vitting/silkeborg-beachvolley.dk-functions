import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

export async function addBulletinCommentCountHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
    const bulletinId = snap.data().bulletinId;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        let counter: number = 0;
        try {
            const bulletinsDoc = await t.get(bulletinsDocRef);
            if (bulletinsDoc.exists) {
                counter = bulletinsDoc.data().numberOfcomments;
                counter++;
                await t.update(bulletinsDocRef, {
                    "numberOfcomments": counter
                });
            }

            return Promise.resolve("Success addBulletinCommentCount");
        } catch (error) {
            console.log("ERROR addBulletinCommentCount", error);
            return Promise.reject(error);
        }
    });
}