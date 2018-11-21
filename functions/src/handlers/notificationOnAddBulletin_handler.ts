import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { Localization } from '../helpers/localization';
import { notificationPayload } from '../helpers/notificationPayload';
import { NotificationData } from '../helpers/notificationData';

export async function notificationOnAddBulletinHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
    const data = snap.data();
    const bulletinId: string = data.id;
    const bulletinType: string = data.type;
    const bulletinBody: string = data.body;
    const authorName: string = data.author.name;
    const authorId: string = data.author.id;
    const authorPhotoUrl: string = data.author.photoUrl;
    const payloadType: string = "bulletin";
    let notificationToSave: NotificationData = null;
    const notificationsUserIds: string[] = [];
    
    try {
        if (bulletinId !== "" && bulletinType !== "") {
            const snapshot = await admin.firestore().collection("users_messaging").where("subscriptions", "array-contains", bulletinType).get();
            if (!snapshot.empty) {
                const listOfDevicesDa: string[] = [];
                const listOfDevicesEn: string[] = [];
                snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
                    const docData = doc.data();
                    const languageCode: string = docData.languageCode;
                    if (docData.userId !== authorId) {
                        languageCode === "da" ? listOfDevicesDa.push(docData.token) : listOfDevicesEn.push(docData.token);
                        notificationsUserIds.push(docData.userId);
                    }
                });

                notificationToSave = new NotificationData(payloadType, bulletinType, authorId, authorName, authorPhotoUrl, notificationsUserIds, bulletinId);
                console.log("Notification Bulletin Data", notificationToSave.toData());
                admin.firestore().collection("notifications").add(notificationToSave.toData());

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