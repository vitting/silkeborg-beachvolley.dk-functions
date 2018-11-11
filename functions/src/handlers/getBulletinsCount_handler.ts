import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

export async function getBulletinsCountHandler(data: any, context: functions.https.CallableContext) {
    const date: Date = new Date(data.date);
    console.log("Date", date.toDateString());
    let newsCount: number = 0;
    let eventCount: number = 0;
    let playCount: number = 0;
    const collectionName: string = "bulletins";
    const newsDocs = await admin.firestore().collection(collectionName).where("type", "==", "news").where("creationDate", ">", date).get();
    const eventDocs = await admin.firestore().collection(collectionName).where("type", "==", "event").where("creationDate", ">", date).get();
    const playDocs = await admin.firestore().collection(collectionName).where("type", "==", "play").where("creationDate", ">", date).get();

    if (!newsDocs.empty) {
        newsCount = newsDocs.docs.length;
    }

    if (!eventDocs.empty) {
        eventCount = eventDocs.docs.length;
    }

    if (!playDocs.empty) {
        playCount = playDocs.docs.length;
    }

    return {
        newsCount: newsCount,
        eventCount: eventCount,
        playCount: playCount
    };
}