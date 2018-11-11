import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

export function matchAddUpdatePointsAndPlayersHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
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
}