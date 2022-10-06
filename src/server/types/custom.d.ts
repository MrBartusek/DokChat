import { UserJWTData } from '../../types/jwt';
declare global {
	namespace Express {
		export interface Request {
			auth: UserJWTData
		}
	}
}

declare module 'socket.io' {
	interface Socket {
		auth: UserJWTData
	}
}
