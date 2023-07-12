import { UserJWTData } from '../../types/jwt';
import redisClient from '../redis';

const GLOBAL_RATELIMIT = 60;

export default class RateLimitManager {
	public static async consume(
		user: UserJWTData | string,
		credits = 1
	): Promise<boolean> {
		const userId = typeof user === 'string' ? user : user.id;
		const key = `ratelimit:${userId}`;
		const used = await redisClient.incrby(key, credits);

		if(used >= GLOBAL_RATELIMIT) {
			return false;
		}

		if(used == credits) {
			// New cache key have just been created
			// Set expiration time for it
			await redisClient.expire(key, 60);
		}

		return true;
	}

	public static async getCreditsLeft(user: UserJWTData | string): Promise<number> {
		const userId = typeof user === 'string' ? user : user.id;
		const key = `ratelimit:${userId}`;
		const used = await redisClient.get(key);

		return GLOBAL_RATELIMIT - Number(used);
	}
}
