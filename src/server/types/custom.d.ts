import { UserJWTData } from '../../types/jwt';
declare global {
	namespace Express {
		export interface Request {
			auth: UserJWTData
		}
	}
}
