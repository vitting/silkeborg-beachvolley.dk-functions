import * as admin from "firebase-admin";

export function saveToLog(userId: string, command: string) {
    const admin_log_collection = "admin_logs";
    return admin.firestore().collection(admin_log_collection).add({
        "userId": userId,
        "date": admin.firestore.FieldValue.serverTimestamp(),
        "command": command
    });
}