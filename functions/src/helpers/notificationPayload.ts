import * as admin from "firebase-admin";

export function notificationPayload(title: string, body: string, type: string, subType: string) : admin.messaging.MessagingPayload {
    // tslint:disable-next-line:prefer-const
    let payload: admin.messaging.MessagingPayload = {
        notification: {
            title: title,
            body: body
        },
        data: {
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
            "dataType": type,
            "subType": subType
        }
    };

    return payload;
}