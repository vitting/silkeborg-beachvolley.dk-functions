import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { notificationWriteToHandler } from './handlers/notificationWriteTo_handler';
import { notificationWriteToRepliesHandler } from './handlers/notificationWriteToReplies_handler';
import { notificationOnAddBulletinHandler } from './handlers/notificationOnAddBulletin_handler';
import { addBulletinCommentCountHandler } from './handlers/addBulletinCommentCount_handler';
import { deleteBulletinCommentCountHandler } from './handlers/deleteBulletinCommentCount_handler';
import { addBulletinCommittedCountHandler } from './handlers/addBulletinCommittedCount_handler';
import { deleteBulletinCommittedCountHandler } from './handlers/deleteBulletinCommittedCount_handler';
import { matchDeleteUpdatePlayersHandler } from './handlers/matchDeleteUpdatePlayers_handler';
import { matchAddUpdatePointsAndPlayersHandler } from './handlers/matchAddUpdatePointsAndPlayers_handler';
import { getBulletinsCountHandler } from './handlers/getBulletinsCount_handler';
import { resetRankingHandler } from './handlers/resetRanking_handler';

admin.initializeApp();
admin.firestore().settings( { timestampsInSnapshots: true });
//firebase deploy --only functions  or firebase deploy --only functions:notificationOnAddBulletin

/**
 * When user sends a message to SBV or SBV-admin sends a message to user
 * send notification
 */
export const notificationWriteTo = functions.firestore.document("/write_to_sbv/{documentId}").onCreate(notificationWriteToHandler);

/**
 * When user sends a reply message to SBV or SBV-admin sends a reply message to user
 * send notification
 */
export const notificationWriteToReplies = functions.firestore.document("/write_to_replies_sbv/{documentId}").onCreate(notificationWriteToRepliesHandler);

/**
 * When a user creates a new bulletin send notification to the other users
 */
export const notificationOnAddBulletin = functions.firestore.document("/bulletins/{documentId}").onCreate(notificationOnAddBulletinHandler);

/**
 * When a user comments a bulletin increase counter
 */
export const addBulletinCommentCount = functions.firestore.document("/bulletins_comments/{documentId}").onCreate(addBulletinCommentCountHandler);

/**
 * When a user deletes a bulletin comment decrease counter
 */
export const deleteBulletinCommentCount = functions.firestore.document("/bulletins_comments/{documentId}").onDelete(deleteBulletinCommentCountHandler);

/**
 * When a user commits to a event or play increate committed counter
 */
export const addBulletinCommittedCount = functions.firestore.document("/bulletins_commits/{documentId}").onCreate(addBulletinCommittedCountHandler);

/**
 * When a user un commits to a event or play decreate committed counter
 */
export const deleteBulletinCommittedCount = functions.firestore.document("/bulletins_commits/{documentId}").onDelete(deleteBulletinCommittedCountHandler);

/**
 * When a match is deleted subtract points and play matches from player
 */
export const onMatchDeleteUpdatePlayers = functions.firestore.document("/ranking_matches/{documentId}").onDelete(matchDeleteUpdatePlayersHandler);

/**
 * When a match is added add points and play matches to player
 */
export const onMatchAddUpdatePointsAndPlayers = functions.firestore.document("/ranking_matches/{documentId}").onCreate(matchAddUpdatePointsAndPlayersHandler);

/**
 * Get count of bulletin types
 */
export const getBulletinsCount = functions.https.onCall(getBulletinsCountHandler);

/**
 * Backup ranking data and reset ranking for a new season
 */
export const resetRanking = functions.https.onCall(resetRankingHandler);