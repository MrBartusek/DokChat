import { User } from '../../types/common';
import { UserJWTData } from '../../types/jwt';

export default class Utils {
	public static userDiscriminator(user: UserJWTData | User) {
		return `${user.username}#${user.tag}`;
	}
}
