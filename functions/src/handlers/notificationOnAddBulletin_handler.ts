import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { Localization } from '../helpers/localization';
import { notificationPayload } from '../helpers/notificationPayload';

export async function notificationOnAddBulletinHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
    const data = snap.data();
    const bulletinId: string = data.id;
    const bulletinType: string = data.type;
    const bulletinBody: string = data.body;
    const authorName: string = data.author.name;
    const authorId: string = data.author.id;
    const payloadType: string = "bulletin";
    
    try {
        if (bulletinId !== "" && bulletinType !== "") {
            const snapshot = await admin.firestore().collection("users_messaging").where("subscriptions", "array-contains", bulletinType).get();
            // console.log("Notification Add Bulletin Snapshot users_messaging count:", snapshot.docs.length);
            if (!snapshot.empty) {
                const listOfDevicesDa: string[] = [];
                const listOfDevicesEn: string[] = [];
                snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
                    const docData = doc.data();
                    const languageCode: string = docData.languageCode;
                    if (docData.userId !== authorId) {
                        languageCode === "da" ? listOfDevicesDa.push(docData.token) : listOfDevicesEn.push(docData.token);
                    }
                });

                if (listOfDevicesDa.length > 0) {
                    const notificationTitle: string = `${authorName} ${Localization.da.string1}`;
                    const payload = notificationPayload(notificationTitle, bulletinBody, payloadType, bulletinType);
                    // console.info("Notification Add Bulleting DA: ", listOfDevicesDa);
                    // console.info("Notification Add Bulleting DA Payload: ", payload);
                    await admin.messaging().sendToDevice(listOfDevicesDa, payload);
                }

                if (listOfDevicesEn.length > 0) {
                    const notificationTitle: string = `${authorName} ${Localization.en.string1}`;
                    const payload = notificationPayload(notificationTitle, bulletinBody, payloadType, bulletinType);
                    // console.info("Notification Add Bulleting EN: ", listOfDevicesEn);
                    // console.info("Notification Add Bulleting EN Payload: ", payload);
                    await admin.messaging().sendToDevice(listOfDevicesEn, payload);
                }
            }
        }

        return Promise.resolve("Succes notificationOnAddBulletin");
    } catch (error) {
        console.log("ERROR notificationOnAddBulletin", error);
        return Promise.reject(error);
    }
}