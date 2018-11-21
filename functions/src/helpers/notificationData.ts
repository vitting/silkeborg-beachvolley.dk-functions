import * as admin from "firebase-admin";

export class NotificationData {
    constructor(
        public type: string, 
        public subType: string, 
        public fromUserId: string, 
        public fromName: string, 
        public fromDisplayUrl: string, 
        public userIds: string[] = [], 
        public subjectId: string,
        public creationDate: admin.firestore.Timestamp = admin.firestore.Timestamp.now()
        ) { }

    toData() {
        return {
            "type": this.type,
            "subType": this.subType,
            "fromUserId": this.fromUserId,
            "fromName": this.fromName,
            "fromDisplayUrl": this.fromDisplayUrl,
            "userIds": this.userIds,
            "subjectId": this.subjectId,
            "creationDate": this.creationDate
        };
    }
}