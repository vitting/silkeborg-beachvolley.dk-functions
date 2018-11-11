import * as admin from "firebase-admin";

export function notificationPayload(title: string, body: string, type: string, bulletinType: string = "") : admin.messaging.MessagingPayload {
    // tslint:disable-next-line:prefer-const
    let payload = {
        notification: {
            title: title,
            body: body
        },
        data: {
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
            "dataType": type
        }
    };

    if (bulletinType !== "") {
        payload["data"]["bulletinType"] = bulletinType;
    }

    return payload;
}