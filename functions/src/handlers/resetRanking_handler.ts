import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { saveToLog } from '../helpers/saveToLog';

export async function resetRankingHandler(data: any, context: functions.https.CallableContext) {
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
}