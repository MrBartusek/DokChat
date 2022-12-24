import db from '../db';
import sql from 'sql-template-strings';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import * as DateFns from 'date-fns';
import { ChatInvite } from '../../types/common';
import * as crypto from 'crypto';

const INVITE_BASE_URL = 'https://dokchat.dokurno.dev/i/';
const INVITE_TIME_DAYS = 7;

class InviteManager {
	public static async createOrGetInvite(chatId: string, participantId: string): Promise<ChatInvite> {
		const invite = await this.getInvite(chatId, participantId);
		let tooOld = false;
		if(invite) {
			const createdAt =  DateFns.fromUnixTime(Number(invite.createdAt));
			const createdAgo = DateFns.differenceInHours(new Date(), createdAt);
			tooOld = createdAgo >= 5;
		}
		if(invite && !tooOld) return invite;
		await this.pruneOldInvites();
		return await this.generateInvite(chatId, participantId);
	}

	private static async getInvite(chatId: string, participantId: string): Promise<ChatInvite | null> {
		const inviteQuery = await db.query(sql`
			SELECT
				id, chat_id as "chatId", author_id as "authorId", created_at as "createdAt", invite_key as "key"
			FROM
				invites
			WHERE
				chat_id = $1 AND author_id = $2;
		`, [ chatId, participantId ]);

		if(inviteQuery.rowCount == 0) return null;
		const invite = inviteQuery.rows[0];
		const created = DateFns.fromUnixTime(invite.createdAt);
		const expire = DateFns.getUnixTime(DateFns.addDays(created, INVITE_TIME_DAYS));
		return {
			id: invite.id,
			chatId: invite.chatId,
			invite: this.generateInviteFromKey(invite.key),
			createdAt: invite.createdAt.toString(),
			expireAt: expire.toString()
		};
	}

	private static async generateInvite(chatId: string, participantId: string): Promise<ChatInvite> {
		const id = snowflakeGenerator.getUniqueID().toString();
		const created = new Date();
		const timestamp = DateFns.getUnixTime(created).toString();
		const key = this.generateInviteKey();
		await db.query(sql`
			INSERT INTO
				invites (id, chat_id, author_id, created_at, invite_key)
			VALUES
				($1, $2, $3, $4, $5)
		`, [ id, chatId, participantId, timestamp.toString(), key ]);

		const expire = DateFns.getUnixTime(DateFns.addDays(created, INVITE_TIME_DAYS));

		return {
			id: id.toString(),
			chatId: chatId,
			invite: this.generateInviteFromKey(key),
			createdAt: timestamp,
			expireAt: expire.toString()
		};
	}

	private static async pruneOldInvites(): Promise<number> {
		const tooOld =  DateFns.getUnixTime(DateFns.subDays(new Date(), INVITE_TIME_DAYS));
		console.log(tooOld);
		const query = await db.query(sql`
			DELETE FROM
				invites
			WHERE created_at < $1
		`, [ tooOld ]);
		if(query.rowCount > 0) {
			console.log(`Deleted ${query.rowCount} invites older than ${INVITE_TIME_DAYS} days`);
		}
		return query.rowCount;
	}

	private static generateInviteFromKey(key: string): string {
		return INVITE_BASE_URL + key;
	}

	private static generateInviteKey(): string {
		return crypto.randomBytes(6).toString('base64url');
	}
}

export default InviteManager;
