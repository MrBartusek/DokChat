import * as DateFns from 'date-fns';
import { QueryResult } from 'pg';
import sql from 'sql-template-strings';
import { DokChatServer, DokChatSocket, OnlineStatusResponse } from '../../types/websocket';
import { ApiResponse } from '../apiResponse';
import db from '../db';

export default function registerOnlineStatusHandler(io: DokChatServer, socket: DokChatSocket) {
	socket.on('onlineStatus', async (callback) => {
		const onlineUsers = await queryOnline(socket.auth.id);
		const onlineStatus: OnlineStatusResponse = onlineUsers.rows.map((user) => {
			const lastSeen = DateFns.fromUnixTime(user.lastSeen);
			const lastSeenDiff = DateFns.differenceInMinutes(new Date(), lastSeen);
			const isOnline = lastSeenDiff <= 5;
			const lastSeenFormatted = DateFns.formatDistance(lastSeen, new Date(), { addSuffix: true });
			return {
				id: user.userId,
				isOnline: isOnline,
				lastSeen: isOnline ? null : lastSeenFormatted
			};
		});
		new ApiResponse({} as any, callback).success(onlineStatus);
	});
}

type OnlineQuery = QueryResult<{
	userId: string,
	lastSeen: number
}>

/**
 * Query list of ids and last online of users which are connected
 * with specified user via param
 * @param as User id to display online users for
 */
async function queryOnline(as: string ): Promise<OnlineQuery> {
	return db.query(sql`
		SELECT
			p.user_id as "userId",
			users.last_seen as "lastSeen"
		FROM
			participants
		-- Join all other chat participants
		LEFT JOIN
			participants AS p
		ON
			p.chat_id = participants.chat_id
		-- Join user info
		INNER JOIN
			users
		ON
			users.id = p.user_id
		WHERE
			participants.user_id = $1
    `, [ as ]);
}
