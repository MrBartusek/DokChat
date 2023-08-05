import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';
import { EmailConfirmJWTData, PasswordResetJWTData } from '../types/jwt';
import Utils from '../utils/utils';
import { IncomingMessage } from 'http';

const USER_TOKEN_SECRET = process.env.JWT_USER_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const PASS_RESET_TOKEN_SECRET = process.env.JWT_PASS_RESET_TOKEN_SECRET;
const EMAIL_CONFIRM_TOKEN_SECRET = process.env.JWT_EMAIL_CONFIRM_TOKEN_SECRET;

export enum TokenType {
	USER_TOKEN = 'user-token',
	REFRESH_TOKEN = 'refresh-token',
	PASS_RESET_TOKEN = 'pass-reset-token',
	EMAIL_CONFIRM_TOKEN = 'email-confirm-token'
}

export enum TokenAudience {
	WEB_CLIENT = 'web-client',
	DESKTOP_APP = 'desktop-app'
}

export default class jwtManager {
	private static async signJWT(
		data: jose.JWTPayload,
		tokenType: TokenType,
		audience: TokenAudience,
		passwordHash = ''
	) {
		const token = await new jose.SignJWT(data)
			.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
			.setExpirationTime(this.getTokenExpirationTime(tokenType))
			.setIssuedAt()
			.setIssuer(`dokchat:auth:${tokenType}`)
			.setAudience(`dokchat:auth:${audience}`)
			.sign(Buffer.from(this.getTokenSecret(tokenType) + passwordHash));
		return token;
	}

	private static decodeJWT<T = jose.JWTPayload>(token: string): T | null {
		try {
			const data = jose.decodeJwt(token) as any as T;
			return data;
		}
		catch (error) {
			return null;
		}
	}

	private static async verifyJWT<T = jose.JWTPayload>(
		token: string,
		tokenType: TokenType,
		audience: TokenAudience,
		passwordHash = ''
	): Promise<T> {
		const secret = Buffer.from(this.getTokenSecret(tokenType) + passwordHash);
		const data = await jose.jwtVerify(token, secret, {
			algorithms: [ 'HS256' ],
			typ: 'JWT',
			issuer: `dokchat:auth:${tokenType}`,
			audience: `dokchat:auth:${audience}`
		});

		if(!this.allowedAudiences(tokenType).includes(audience)) {
			throw new Error(`${audience} audience is not allowed to use ${tokenType} token`);
		}

		return data.payload as any as T;
	}

	private static getTokenSecret(tokenType: TokenType): string {
		switch (tokenType) {
			default:
			case TokenType.USER_TOKEN:
				return USER_TOKEN_SECRET;
			case TokenType.REFRESH_TOKEN:
				return REFRESH_TOKEN_SECRET;
			case TokenType.PASS_RESET_TOKEN:
				return PASS_RESET_TOKEN_SECRET;
			case TokenType.EMAIL_CONFIRM_TOKEN:
				return EMAIL_CONFIRM_TOKEN_SECRET;
		}
	}

	private static allowedAudiences(tokenType: TokenType): TokenAudience[] {
		switch (tokenType) {
			default:
			case TokenType.USER_TOKEN:
				return [ TokenAudience.WEB_CLIENT, TokenAudience.DESKTOP_APP ];
			case TokenType.REFRESH_TOKEN:
				return [ TokenAudience.WEB_CLIENT, TokenAudience.DESKTOP_APP ];
			case TokenType.PASS_RESET_TOKEN:
				return [ TokenAudience.WEB_CLIENT ];
			case TokenType.EMAIL_CONFIRM_TOKEN:
				return [ TokenAudience.WEB_CLIENT ];
		}
	}

	private static getTokenExpirationTime(tokenType: TokenType): string {
		switch (tokenType) {
			default:
			case TokenType.USER_TOKEN:
				return '5m';
			case TokenType.REFRESH_TOKEN:
				return '30d';
			case TokenType.PASS_RESET_TOKEN:
			case TokenType.EMAIL_CONFIRM_TOKEN:
				return '24h';
		}
	}

	// --------------------------
	// GENERATE
	// --------------------------

	public static async generateUserToken(data: UserJWTData, audience: TokenAudience): Promise<string> {
		return this.signJWT(data, TokenType.USER_TOKEN, audience);
	}

	public static async generateRefreshToken(id: string, audience: TokenAudience, passwordHash: string): Promise<string> {
		return this.signJWT({ id }, TokenType.REFRESH_TOKEN, audience, passwordHash);
	}

	public static async generatePassResetToken(id: string, email: string, audience: TokenAudience, passwordHash: string): Promise<string> {
		const data: PasswordResetJWTData = { id, email };
		return this.signJWT(data, TokenType.PASS_RESET_TOKEN, audience, passwordHash);
	}

	public static async generateEmailConfirmToken(id: string, email: string, audience: TokenAudience): Promise<string> {
		const data: EmailConfirmJWTData = { id, email };
		return this.signJWT(data, TokenType.EMAIL_CONFIRM_TOKEN, audience);
	}

	// --------------------------
	// DECODE
	// --------------------------

	public static decodeRefreshToken(token: string): string | null {
		const data = this.decodeJWT<{ id: string }>(token);
		return data ? data.id : null;
	}

	public static decodePassResetToken(token: string): string | null {
		const data = this.decodeJWT<{ id: string }>(token);
		return data ? data.id : null;
	}

	// --------------------------
	// VERIFY
	// --------------------------

	public static async verifyUserToken(token: string, audience: TokenAudience): Promise<UserJWTData> {
		return this.verifyJWT<UserJWTData>(token, TokenType.USER_TOKEN, audience);
	}

	public static async verifyRefreshToken(token: string, audience: TokenAudience, passwordHash: string): Promise<string> {
		const data = await this.verifyJWT<{ id: string }>(token, TokenType.REFRESH_TOKEN, audience, passwordHash);
		return data.id;
	}

	public static async verifyPassResetToken(token: string, email: string, audience: TokenAudience, passwordHash: string): Promise<string> {
		const data = await this.verifyJWT<{ id: string, email: string }>(token, TokenType.PASS_RESET_TOKEN, audience, passwordHash);
		if (data.email != email) throw new Error('JWT email does not match account email');
		return data.id;
	}

	public static async verifyEmailConfirmToken(token: string, audience: TokenAudience): Promise<EmailConfirmJWTData> {
		const data = await this.verifyJWT<EmailConfirmJWTData>(token,  TokenType.EMAIL_CONFIRM_TOKEN, audience);
		return data;
	}

	// --------------------------
	// HELPERS
	// --------------------------

	public static getAudienceFromRequest(req: Express.Request | IncomingMessage): TokenAudience {
		return Utils.requestedFromElectron(req) ? TokenAudience.DESKTOP_APP : TokenAudience.WEB_CLIENT;
	}
}
