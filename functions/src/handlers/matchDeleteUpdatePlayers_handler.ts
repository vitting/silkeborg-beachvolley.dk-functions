import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

export function matchDeleteUpdatePlayersHandler(snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
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
}