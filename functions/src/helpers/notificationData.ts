import * as admin from "firebase-admin";

export class NotificationData {
    constructor(public type: string, public subType: string, public fromUserId: string, public userId: string, public creationDate: admin.firestore.Timestamp = admin.firestore.Timestamp.now(), public shown = false) {}

    toData() {
        return {
            "type": this.type,
            "subType": this.subType,
            "fromUserId": this.fromUserId,
            "userId": this.userId,
            "creationDate": this.creationDate,
            "shown": this.shown
        };
    }
}