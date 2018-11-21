import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { Localization } from '../helpers/localization';
import { notificationPayload } from '../helpers/notificationPayload';
import { NotificationData } from '../helpers/notificationData';

export async function notificationWriteToRepliesHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
    const writeToData = snap.data();
    const docId = writeToData.id;
    const type: string = writeToData.type;
    const subType: string = writeToData.subType;
    const collectionName: string = "users_messaging";
    const tokensDa: string[] = [];
    const tokensEn: string[] = [];
    const senderName: string = writeToData.fromName;
    const message: string = writeToData.message;
    let titleDa: string;
    let titleEn: string;
    let messageType: string;
    const payloadType = "writeto";
    let notificationToSave: NotificationData = null;
    const notificationsUserIds: string[] = [];

    try {
        // Send notification to Admin 
        if (type === "public" && subType === "reply") {
            const snapshot = await admin.firestore().collection(collectionName).where("isAdmin2", "==", true).get();
            console.info("Notification WriteToReply Admin");
            console.info("Notification WriteToReply Admin Count:", snapshot.docs.length);
            if (!snapshot.empty) {
                titleDa = `${senderName} ${Localization.da.string4}`;
                titleEn = `${senderName} ${Localization.en.string4}`;
                messageType = "message_reply_from_public";
                snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
                    const subscriptions: string[] =  <string[]>doc.data().subscriptions;
                    const indexSubscription: number = subscriptions.indexOf("writeToAdmin");

                    if (doc.data().userId !== writeToData.fromUserId && indexSubscription !== -1) {
                        const languageCode: string = doc.data().languageCode;
                        const token: string = doc.data().token;
                        languageCode === "da" ? tokensDa.push(token) : tokensEn.push(token);
                        notificationsUserIds.push(doc.data().userId);
                    }
                });

                notificationToSave = new NotificationData(payloadType, messageType, writeToData.fromUserId, writeToData.fromName, writeToData.fromPhotoUrl, notificationsUserIds, docId);
            } 
        }
        
        if (type === "admin" && subType === "reply_message") {
            const snapshot = await admin.firestore().collection(collectionName).doc(writeToData.sendToUserId).get();
            console.info("Notification WriteToReply User");
            console.info("Notification WriteToReply User Exists:", snapshot.exists);
            messageType = "message_reply_from_sbv";
            if (snapshot.exists) {
                titleDa = Localization.da.string5;
                titleEn = Localization.en.string5;
                const languageCode: string = snapshot.data().languageCode;
                const token: string = snapshot.data().token;
                const subscriptions: string[] =  <string[]>snapshot.data().subscriptions;
                const indexSubscription: number = subscriptions.indexOf("writeTo");
                if (indexSubscription !== -1) {
                    languageCode === "da" ? tokensDa.push(token) : tokensEn.push(token);
                    notificationsUserIds.push(snapshot.data().userId);
                }
            }

            notificationToSave = new NotificationData(payloadType, messageType, writeToData.fromUserId, writeToData.fromName, writeToData.fromPhotoUrl, notificationsUserIds, docId);
        }

        console.info("Notification WriteToReply TokensDa:", tokensDa.length);
        console.info("Notification WriteToReply TokensEn:", tokensEn.length);

        if (notificationsUserIds.length > 0) {
            console.log("Notification WriteToReply Data", notificationToSave.toData());
            admin.firestore().collection("notifications").add(notificationToSave.toData());
        }

        if (tokensDa.length > 0) {
            const payload = notificationPayload(titleDa, message, payloadType, messageType);
            console.info("Notification WriteToReply TokensDa Payload:", payload);
            await admin.messaging().sendToDevice(tokensDa, payload);
        }

        if (tokensEn.length > 0) {
            const payload = notificationPayload(titleEn, message, payloadType, messageType);
            console.info("Notification WriteToReply TokensEn Payload:", payload);
            await admin.messaging().sendToDevice(tokensEn, payload);
        }
        
        return Promise.resolve("Succes notificationWriteToReplies");
    } catch (error) {
        console.log("ERROR notificationWriteToReplies", error);
        return Promise.reject(error);
    }
}