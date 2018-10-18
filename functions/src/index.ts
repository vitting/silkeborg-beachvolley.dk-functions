import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { isNumber } from 'util';

admin.initializeApp();

//firebase deploy --only functions  or firebase deploy --only functions:notificationOnAddBulletin

export const notificationOnAddBulletin = functions.firestore.document("/bulletins/{documentId}").onCreate(async (snap, context) => {
    const data = snap.data();
    const bulletinId: string = data.id;
    const bulletinType: string = data.type;
    const bulletinBody: string = data.body;
    const authorName: string = data.author.name;
    const authorId: string = data.author.id;
    const creationDate: Date = data.creationDate.toDate();

    try {
        if (bulletinId !== "" && bulletinType !== "") {
            const snapshot = await admin.firestore().collection("users_messaging").where("subscriptions", "array-contains", bulletinType).get();
            if (!snapshot.empty) {
                const listOfDevices: string[] = [];
                snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
                    const docData = doc.data();
                    if (docData.userId !== authorId) {
                        listOfDevices.push(docData.token);
                    }
                });

                if (listOfDevices.length > 0) {
                    const notificationTitle: string = authorName + " har oprettet et nyt opslag";
                    const notificationBody: string = "";

                    const payload: admin.messaging.MessagingPayload = {
                        notification: {
                            title: notificationTitle,
                            body: bulletinBody
                        },
                        data: {
                            "click_action": "FLUTTER_NOTIFICATION_CLICK",
                            "dataType": "bulletin",
                            "bulletinType": bulletinType
                        }
                    };

                    await admin.messaging().sendToDevice(listOfDevices, payload);
                }
            }
        }

        return Promise.resolve("Succes notificationOnAddBulletin");
    } catch (error) {
        console.log("ERROR notificationOnAddBulletin", error);
        return Promise.reject(error);
    }
});

export const addBulletinCommentCount = functions.firestore.document("/bulletins_comments/{documentId}").onCreate((snap, context) => {
    const bulletinId = snap.data().bulletinId;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        let counter: number = 0;
        try {
            const bulletinsDoc = await t.get(bulletinsDocRef);
            if (bulletinsDoc.exists) {
                counter = bulletinsDoc.data().numberOfcomments;
                counter++;
                await t.update(bulletinsDocRef, {
                    "numberOfcomments": counter
                });
            }

            return Promise.resolve("Success addBulletinCommentCount");
        } catch (error) {
            console.log("ERROR addBulletinCommentCount", error);
            return Promise.reject(error);
        }
    });
});

export const deleteBulletinCommentCount = functions.firestore.document("/bulletins_comments/{documentId}").onDelete(async (snap, context) => {
    const bulletinId = snap.data().bulletinId;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        let counter: number = 0;
        try {
            const bulletinsDoc = await t.get(bulletinsDocRef);
            if (bulletinsDoc.exists) {
                counter = bulletinsDoc.data().numberOfcomments;
                if (counter > 0) {
                    counter--;
                }

                await t.update(bulletinsDocRef, {
                    "numberOfcomments": counter
                });
            }

            return Promise.resolve("Success deleteBulletinCommentCount");
        } catch (error) {
            console.log("ERROR deleteBulletinCommentCount", error);
            return Promise.reject(error);
        }
    });
});

export const addBulletinCommittedCount = functions.firestore.document("/bulletins_commits/{documentId}").onCreate(async (snap, context) => {
    const bulletinId = snap.data().bulletinId;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        let counter: number = 0;
        try {
            const bulletinDoc = await t.get(bulletinsDocRef);
            if (bulletinDoc.exists) {
                if (isNumber(bulletinDoc.data().numberOfCommits)) {
                    counter = bulletinDoc.data().numberOfCommits;
                    counter++;
                }

                await t.update(bulletinsDocRef, {
                    "numberOfCommits": counter
                });
            }

            return Promise.resolve("Success addBulletinCommittedCount");
        } catch (error) {
            console.log("ERROR addBulletinCommittedCount", error);
            return Promise.reject(error);
        }
    });
});

export const deleteBulletinCommittedCount = functions.firestore.document("/bulletins_commits/{documentId}").onDelete(async (snap, context) => {
    const bulletinId = snap.data().bulletinId;
    const bulletinsDocRef = admin.firestore().collection("bulletins").doc(bulletinId);

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        let counter: number = 0;
        try {
            const bulletinDoc = await t.get(bulletinsDocRef);
            if (bulletinDoc.exists) {
                if (isNumber(bulletinDoc.data().numberOfCommits)) {
                    counter = bulletinDoc.data().numberOfCommits;
                    if (counter > 0) {
                        counter--;
                    }
                }

                await t.update(bulletinsDocRef, {
                    "numberOfCommits": counter
                });
            }

            return Promise.resolve("Success deleteBulletinCommittedCount");
        } catch (error) {
            console.log("ERROR deleteBulletinCommittedCount", error);
            return Promise.reject(error);
        }
    });
});

export const onMatchDeleteUpdatePlayers = functions.firestore.document("/ranking_matches/{documentId}").onDelete(async (snap, context) => {
    const match = snap.data();
    const matchId = match.id;
    const matchWinner1Id: string = match.winner1.id;
    const matchWinner2Id: string = match.winner2.id;
    const matchLoser1Id: string = match.loser1.id;
    const matchLoser2Id: string = match.loser2.id;
    const matchWinner1Points: number = <number>match.winner1.points;
    const matchWinner2Points: number = <number>match.winner2.points;
    const matchLoser1Points: number = <number>match.loser1.points;
    const matchLoser2Points: number = <number>match.loser2.points;
    const playerWinner1Ref = admin.firestore().collection("ranking_players").doc(matchWinner1Id);
    const playerWinner2Ref = admin.firestore().collection("ranking_players").doc(matchWinner2Id);
    const playerLoser1Ref = admin.firestore().collection("ranking_players").doc(matchLoser1Id);
    const playerLoser2Ref = admin.firestore().collection("ranking_players").doc(matchLoser2Id);

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        try {
            const playerWinner1Doc = await t.get(playerWinner1Ref);
            const playerWinner2Doc = await t.get(playerWinner2Ref);
            const playerLoser1Doc = await t.get(playerLoser1Ref);
            const playerLoser2Doc = await t.get(playerLoser2Ref);

            //Winner1
            const playerWinner1PointsTotal: number = <number>playerWinner1Doc.data().points.total;
            const playerWinner1PointsWon: number = <number>playerWinner1Doc.data().points.won;
            const playerWinner1NumberOfMatchesTotal: number = <number>playerWinner1Doc.data().numberOfPlayedMatches.total;
            const playerWinner1NumberOfMatchesWon: number = <number>playerWinner1Doc.data().numberOfPlayedMatches.won;
            //Winner2
            const playerWinner2PointsTotal: number = <number>playerWinner2Doc.data().points.total;
            const playerWinner2PointsWon: number = <number>playerWinner2Doc.data().points.won;
            const playerWinner2NumberOfMatchesTotal: number = <number>playerWinner2Doc.data().numberOfPlayedMatches.total;
            const playerWinner2NumberOfMatchesWon: number = <number>playerWinner2Doc.data().numberOfPlayedMatches.won;
            //Loser1
            const playerLoser1PointsTotal: number = <number>playerLoser1Doc.data().points.total;
            const playerLoser1PointsLost: number = <number>playerLoser1Doc.data().points.lost;
            const playerLoser1NumberOfMatchesTotal: number = <number>playerLoser1Doc.data().numberOfPlayedMatches.total;
            const playerLoser1NumberOfMatchesLost: number = <number>playerLoser1Doc.data().numberOfPlayedMatches.lost;
            //Loser2
            const playerLoser2PointsTotal: number = <number>playerLoser2Doc.data().points.total;
            const playerLoser2PointsLost: number = <number>playerLoser2Doc.data().points.lost;
            const playerLoser2NumberOfMatchesTotal: number = <number>playerLoser2Doc.data().numberOfPlayedMatches.total;
            const playerLoser2NumberOfMatchesLost: number = <number>playerLoser2Doc.data().numberOfPlayedMatches.lost;

            await t.update(playerWinner1Ref, {
                "points.won": playerWinner1PointsWon - matchWinner1Points,
                "points.total": playerWinner1PointsTotal - matchWinner1Points,
                "numberOfPlayedMatches.won": playerWinner1NumberOfMatchesWon - 1,
                "numberOfPlayedMatches.total": playerWinner1NumberOfMatchesTotal - 1
            })

            await t.update(playerWinner2Ref, {
                "points.won": playerWinner2PointsWon - matchWinner2Points,
                "points.total": playerWinner2PointsTotal - matchWinner2Points,
                "numberOfPlayedMatches.won": playerWinner2NumberOfMatchesWon - 1,
                "numberOfPlayedMatches.total": playerWinner2NumberOfMatchesTotal - 1
            });

            await t.update(playerLoser1Ref, {
                "points.lost": playerLoser1PointsLost - matchLoser1Points,
                "points.total": playerLoser1PointsTotal - matchLoser1Points,
                "numberOfPlayedMatches.lost": playerLoser1NumberOfMatchesLost - 1,
                "numberOfPlayedMatches.total": playerLoser1NumberOfMatchesTotal - 1
            });

            await t.update(playerLoser2Ref, {
                "points.lost": playerLoser2PointsLost - matchLoser2Points,
                "points.total": playerLoser2PointsTotal - matchLoser2Points,
                "numberOfPlayedMatches.lost": playerLoser2NumberOfMatchesLost - 1,
                "numberOfPlayedMatches.total": playerLoser2NumberOfMatchesTotal - 1
            });

            console.log("Succes onMatchDeleteUpdatePlayers, matchId: " + matchId);
            return Promise.resolve("Succes onMatchDeleteUpdatePlayers, matchId: " + matchId);
        } catch (error) {
            console.log("ERROR onMatchDeleteUpdatePlayers, matchId: " + matchId, error);
            return Promise.reject(error);
        }
    });
});

export const onMatchAddUpdatePointsAndPlayers = functions.firestore.document("/ranking_matches/{documentId}").onCreate(async (snap, context) => {
    const winnerPoints: number = 10;
    const loserPoints: number = 5;
    const data = snap.data();
    const matchDocumentId = context.params.documentId;
    const winner1Id: string = data.winner1.id;
    const winner2Id: string = data.winner2.id;
    const loser1Id: string = data.loser1.id;
    const loser2Id: string = data.loser2.id;
    const playerWinner1Ref = admin.firestore().collection("ranking_players").doc(winner1Id);
    const playerWinner2Ref = admin.firestore().collection("ranking_players").doc(winner2Id);
    const playerLoser1Ref = admin.firestore().collection("ranking_players").doc(loser1Id);
    const playerLoser2Ref = admin.firestore().collection("ranking_players").doc(loser2Id);
    const matchRef = snap.ref;

    return admin.firestore().runTransaction(async (t: FirebaseFirestore.Transaction) => {
        try {
            const playerWinner1Doc = await t.get(playerWinner1Ref);
            const playerWinner2Doc = await t.get(playerWinner2Ref);
            const playerLoser1Doc = await t.get(playerLoser1Ref);
            const playerLoser2Doc = await t.get(playerLoser2Ref);

            let playerWinner1PointTotal = <number>playerWinner1Doc.data().points.total;
            let playerWinner1PointWon = <number>playerWinner1Doc.data().points.won;
            let playerWinner2PointTotal = <number>playerWinner2Doc.data().points.total;
            let playerWinner2PointWon = <number>playerWinner2Doc.data().points.won;
            let playerLoser1PointTotal = <number>playerLoser1Doc.data().points.total;
            let playerLoser1PointLost = <number>playerLoser1Doc.data().points.lost;
            let playerLoser2PointTotal = <number>playerLoser2Doc.data().points.total;
            let playerLoser2PointLost = <number>playerLoser2Doc.data().points.lost;
            let playerWinner1NumberOfMatchesWon = <number>playerWinner1Doc.data().numberOfPlayedMatches.won;
            let playerWinner1NumberOfMatchesTotal = <number>playerWinner1Doc.data().numberOfPlayedMatches.total;
            let playerWinner2NumberOfMatchesWon = <number>playerWinner2Doc.data().numberOfPlayedMatches.won;
            let playerWinner2NumberOfMatchesTotal = <number>playerWinner2Doc.data().numberOfPlayedMatches.total;
            let playerLoser1NumberOfMatchesLost = <number>playerLoser1Doc.data().numberOfPlayedMatches.lost;
            let playerLoser1NumberOfMatchesTotal = <number>playerLoser1Doc.data().numberOfPlayedMatches.total;
            let playerLoser2NumberOfMatchesLost = <number>playerLoser2Doc.data().numberOfPlayedMatches.lost;
            let playerLoser2NumberOfMatchesTotal = <number>playerLoser2Doc.data().numberOfPlayedMatches.total;
            //Winner1
            playerWinner1PointTotal = playerWinner1PointTotal + winnerPoints;
            playerWinner1PointWon = playerWinner1PointWon + winnerPoints;
            playerWinner1NumberOfMatchesTotal++;
            playerWinner1NumberOfMatchesWon++;

            //Winner2
            playerWinner2PointTotal = playerWinner2PointTotal + winnerPoints;
            playerWinner2PointWon = playerWinner2PointWon + winnerPoints;
            playerWinner2NumberOfMatchesTotal++;
            playerWinner2NumberOfMatchesWon++;

            //Loser1
            playerLoser1PointTotal = playerLoser1PointTotal + loserPoints;
            playerLoser1PointLost = playerLoser1PointLost + loserPoints;
            playerLoser1NumberOfMatchesTotal++;
            playerLoser1NumberOfMatchesLost++;

            //Loser2
            playerLoser2PointTotal = playerLoser2PointTotal + loserPoints;
            playerLoser2PointLost = playerLoser2PointLost + loserPoints;
            playerLoser2NumberOfMatchesTotal++;
            playerLoser2NumberOfMatchesLost++;

            await t.update(matchRef, {
                "winner1.points": winnerPoints,
                "winner2.points": winnerPoints,
                "loser1.points": loserPoints,
                "loser2.points": loserPoints
            });

            await t.update(playerWinner1Ref, {
                "numberOfPlayedMatches.total": playerWinner1NumberOfMatchesTotal,
                "numberOfPlayedMatches.won": playerWinner1NumberOfMatchesWon,
                "points.total": playerWinner1PointTotal,
                "points.won": playerWinner1PointWon
            });

            await t.update(playerWinner2Ref, {
                "numberOfPlayedMatches.total": playerWinner2NumberOfMatchesTotal,
                "numberOfPlayedMatches.won": playerWinner2NumberOfMatchesWon,
                "points.total": playerWinner2PointTotal,
                "points.won": playerWinner2PointWon
            });

            await t.update(playerLoser1Ref, {
                "numberOfPlayedMatches.total": playerLoser1NumberOfMatchesTotal,
                "numberOfPlayedMatches.lost": playerLoser1NumberOfMatchesLost,
                "points.total": playerLoser1PointTotal,
                "points.lost": playerLoser1PointLost
            });

            await t.update(playerLoser2Ref, {
                "numberOfPlayedMatches.total": playerLoser2NumberOfMatchesTotal,
                "numberOfPlayedMatches.lost": playerLoser2NumberOfMatchesLost,
                "points.total": playerLoser2PointTotal,
                "points.lost": playerLoser2PointLost
            });

            console.log("Succes onNewsMatchUpdatePointsAndPlayers, matchId: " + matchDocumentId);
            return Promise.resolve("Succes onNewsMatchUpdatePointsAndPlayers, matchId: " + matchDocumentId);
        } catch (error) {
            console.log("ERROR onNewsMatchUpdatePointsAndPlayers, matchId: " + matchDocumentId, error);
            return Promise.reject(error);
        }
    });
});

export const getBulletinsCount = functions.https.onCall(async (data, context) => {
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
});

export const resetRanking = functions.https.onCall(async (data, context) => {
    try {
        const collectionMatchesName: string = "ranking_matches";
        const collectionPlayersName: string = "ranking_players";
        const collectionPlayersArchiveName: string = "ranking_players_archive";
        const matchesQuerySnapshot = await admin.firestore().collection(collectionMatchesName).where("enabled", "==", true).get();
        const playersQuerySnapshot = await admin.firestore().collection(collectionPlayersName).get();
        const playersArchiveRef = await admin.firestore().collection(collectionPlayersArchiveName);
        const promiseListMatches = [];
        const promiseListPlayersArchive = [];
        const promiseListPlayers = [];

        await saveToLog(context.auth.uid, "resetRanking");

        matchesQuerySnapshot.docs.forEach(async (snapshot, index) => {
            promiseListMatches.push(snapshot.ref.update({ "enabled": false }));
        });

        await Promise.all(promiseListMatches);

        playersQuerySnapshot.docs.forEach(async (player, index) => {
            promiseListPlayersArchive.push(playersArchiveRef.add(player.data()));
            promiseListPlayers.push(player.ref.update({
                "numberOfPlayedMatches.total": 0,
                "numberOfPlayedMatches.won": 0,
                "numberOfPlayedMatches.lost": 0,
                "points.total": 0,
                "points.won": 0,
                "points.lost": 0
            }));
        });

        await Promise.all(promiseListPlayersArchive);
        await Promise.all(promiseListPlayers);

        return {
            "result": "ok"
        };
    } catch (error) {
        console.log("ERROR resetRanking", error);

        return {
            "result": "error",
            "error": error
        };
    }
});

function saveToLog(userId: string, command: string) {
    const admin_log_collection = "admin_logs";
    return admin.firestore().collection(admin_log_collection).add({
        "userId": userId,
        "date": admin.firestore.FieldValue.serverTimestamp(),
        "command": command
    });
}