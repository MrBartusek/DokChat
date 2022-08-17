import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';

export default class JWT {
	async generateJWT(userData: UserJWTData) {
		const key = new Uint8Array([1]);
		const token = await new jose.SignJWT(userData)
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('2h')
			.sign(key);
		return token;
	}
}
