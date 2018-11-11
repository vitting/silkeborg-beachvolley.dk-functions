import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

export async function deleteBulletinCommentCountHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
    const bulletinId = snap.data().bulletinId;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        let counter: number = 0;
        try {
            const bulletinsDoc = await t.get(bulletinsDocRef);
            if (bulletinsDoc.exists) {
                counter = bulletinsDoc.data().numberOfcomments;
                if (counter > 0) {
                    counter--;
                }

                await t.update(bulletinsDocRef, {
                    "numberOfcomments": counter
                });
            }

            return Promise.resolve("Success deleteBulletinCommentCount");
        } catch (error) {
            console.log("ERROR deleteBulletinCommentCount", error);
            return Promise.reject(error);
        }
    });
}