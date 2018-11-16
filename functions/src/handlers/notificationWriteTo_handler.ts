import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { Localization } from '../helpers/localization';
import { notificationPayload } from '../helpers/notificationPayload';

export async function notificationWriteToHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
    const writeToData = snap.data();
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

    try {
        // Send notification to Admin 
        if (type === "public" && (subType === "message" || subType === "mail")) {
            const snapshot = await admin.firestore().collection(collectionName).where("isAdmin2", "==", true).get();
            if (!snapshot.empty) {
                titleDa = `${senderName} ${Localization.da.string2}`;
                titleEn = `${senderName} ${Localization.en.string2}`;
                messageType = "message_from_public";
                snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
                    const subscriptions: string[] =  <string[]>doc.data().subscriptions;
                    const indexSubscription: number = subscriptions.indexOf("writeToAdmin");

                    if (doc.data().userId !== writeToData.fromUserId && indexSubscription !== -1) {
                        const languageCode: string = doc.data().languageCode;
                        const token: string = doc.data().token;
                        languageCode === "da" ? tokensDa.push(token) : tokensEn.push(token);
                    }
                });
            } 
        }
    
        // Send notification to user
        if (type === "admin" && subType === "message") {
            const snapshot = await admin.firestore().collection(collectionName).doc(writeToData.sendToUserId).get();
            messageType = "message_from_sbv";
            if (snapshot.exists) {
                titleDa = Localization.da.string3;
                titleEn = Localization.en.string3;
                const languageCode: string = snapshot.data().languageCode;
                const token: string = snapshot.data().token;
                const subscriptions: string[] =  <string[]>snapshot.data().subscriptions;
                const indexSubscription: number = subscriptions.indexOf("writeTo");
                if (indexSubscription !== -1) {
                    languageCode === "da" ? tokensDa.push(token) : tokensEn.push(token);
                }
            }
        }
    
        if (tokensDa.length > 0) {
            const payload = notificationPayload(titleDa, message, payloadType, messageType);
            await admin.messaging().sendToDevice(tokensDa, payload);
        }

        if (tokensEn.length > 0) {
            const payload = notificationPayload(titleEn, message, payloadType, messageType);
            await admin.messaging().sendToDevice(tokensEn, payload);
        }
        
        return Promise.resolve("Succes notificationWriteTo");
    } catch (error) {
        console.log("ERROR notificationWriteTo", error);
        return Promise.reject(error);   
    }
}