import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

admin.initializeApp();

export const addBulletinComment = functions.firestore.document("/bulletins_comments/{documentId}").onCreate((snap, context) => {
    const bulletinId = snap.data().id;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return bulletinsDocRef.get().then((doc) => {
        let count:number = 0;

        if (doc.exists) {
            count = doc.data().numberOfcomments;
            count++;
        }

        return bulletinsDocRef.update({"numberOfcomments": count});
    });
});

export const deleteBulletinComment = functions.firestore.document("/bulletins_comments/{documentId}").onDelete((snap, context) => {
    const bulletinId = snap.data().id;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return bulletinsDocRef.get().then((doc) => {
        let count:number = 0;

        if (doc.exists) {
            count = doc.data().numberOfcomments;
            if (count > 0) {
                count--;    
            }
        }

        return bulletinsDocRef.update({"numberOfcomments": count});
    });
});
