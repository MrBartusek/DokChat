import * as DateFns from 'date-fns';
import sql from 'sql-template-strings';
import db from '../db';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';

class BlockManager {
	public static async setBlockStatus(blockerId: string, targetId: string, shouldBeBlocked: boolean) {
		if (shouldBeBlocked) {
			const id = snowflakeGenerator.getUniqueID();
			const timestamp = DateFns.getUnixTime(new Date()).toString();
			await db.query(sql`
                INSERT INTO blocks (id, blocker_id, target_id, created_at) VALUES ($1, $2, $3, $4)
            `, [id, blockerId, targetId, timestamp]);
		}
		else {
			await db.query(sql`
                DELETE FROM blocks WHERE blocker_id = $1 AND target_id=$2;
            `, [blockerId, targetId]);
		}
	}

	public static async isBlocked(userId: string, blockedById: string): Promise<boolean> {
		const blockQuery = await db.query(sql`
            SELECT EXISTS(SELECT 1 FROM blocks WHERE blocker_id = $1 AND target_id = $2)
        `, [blockedById, userId]);

		return blockQuery.rows[0].exists;
	}

	public static async isBlockedAny(userA: string, userB: string): Promise<boolean> {
		const blockQuery = await db.query(sql`
            SELECT EXISTS(
				SELECT 1 FROM blocks WHERE
				(blocker_id = $1 AND target_id = $2) OR
				(blocker_id = $2 AND target_id = $1)
			)
        `, [userA, userB]);

		return blockQuery.rows[0].exists;
	}
}

export default BlockManager;
