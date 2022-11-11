import { JWTPayload } from 'jose';

export interface UserJWTData extends JWTPayload {
    id: string,
    username: string,
    tag: string,
    email: string,
    isBanned: boolean,
    isEmailConfirmed: boolean
}
