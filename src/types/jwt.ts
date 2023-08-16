import { JWTPayload } from 'jose';

export interface UserJWTData extends JWTPayload {
    id: string,
    username: string,
    tag: string,
    email: string,
    avatar: string,
    isBanned: boolean,
    isEmailConfirmed: boolean,
    isDemo: boolean,
    is2FAEnabled: boolean,
    hasPassword: boolean
}
