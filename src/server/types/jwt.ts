import { JWTPayload } from 'jose';

export interface EmailConfirmJWTData extends JWTPayload {
    id: string;
    email: string;
}

export interface PasswordResetJWTData extends EmailConfirmJWTData { }
