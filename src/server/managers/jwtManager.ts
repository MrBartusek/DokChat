import { Response } from 'express';
import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';
import { ApiResponse } from '../apiResponse';
import * as DateFns from 'date-fns';
import { UserLoginResponse } from '../../types/endpoints';
import db from '../db';
import sql from 'sql-template-strings';
import * as bcrypt from 'bcrypt';
import { EmailConfirmJWTData, PasswordResetJWTData } from '../types/jwt';

const USER_TOKEN_SECRET = process.env.JWT_USER_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const PASS_RESET_TOKEN_SECRET = process.env.JWT_PASS_RESET_TOKEN_SECRET;
const EMAIL_CONFIRM_TOKEN_SECRET = process.env.JWT_EMAIL_CONFIRM_TOKEN_SECRET;

export enum TokenType {
	USER_TOKEN,
	REFRESH_TOKEN,
	PASS_RESET_TOKEN,
	EMAIL_CONFIRM_TOKEN
}

export default class JWTManager {
	private static async signJWT(data: jose.JWTPayload, tokenType: TokenType, passwordHash = '') {
		const token = await new jose.SignJWT(data)
			.setProtectedHeader({ alg: 'HS256' })
			.setExpirationTime(this.getTokenExpirationTime(tokenType))
			.setIssuedAt()
			.sign(Buffer.from(this.getTokenSecret(tokenType) + passwordHash));
		return token;
	}

	private static decodeJWT<T = jose.JWTPayload>(token: string): T {
		return jose.decodeJwt(token) as any as T;
	}

	private static async verifyJWT<T = jose.JWTPayload>(token: string, tokenType: TokenType, passwordHash = ''): Promise<T> {
		const data = await jose.jwtVerify(token, Buffer.from(this.getTokenSecret(tokenType) + passwordHash));
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

	public static async generateUserToken(data: UserJWTData): Promise<string> {
		return this.signJWT(data, TokenType.USER_TOKEN);
	}

	public static async generateRefreshToken(userId: string, passwordHash: string): Promise<string> {
		return this.signJWT({ id: userId}, TokenType.REFRESH_TOKEN, passwordHash);
	}

	public static async generatePassResetToken(userData: UserJWTData, passwordHash: string): Promise<string> {
		const data: PasswordResetJWTData = { id: userData.id, email: userData.email };
		return this.signJWT(data, TokenType.PASS_RESET_TOKEN, passwordHash);
	}

	public static async generateEmailConfirmToken(userData: UserJWTData): Promise<string> {
		const data: EmailConfirmJWTData  = { id: userData.id, email: userData.email };
		return this.signJWT(data, TokenType.PASS_RESET_TOKEN);
	}

	// --------------------------
	// DECODE
	// --------------------------

	public static decodeRefreshToken(token: string): string {
		const id = this.decodeJWT(token).id as string;
		return id;
	}

	// --------------------------
	// VERIFY
	// --------------------------

	public static async verifyUserToken(token: string): Promise<UserJWTData> {
		return this.verifyJWT<UserJWTData>(token, TokenType.USER_TOKEN);
	}

	public static async verifyRefreshToken(token: string, passwordHash: string): Promise<string> {
		const data = await this.verifyJWT<{ id: string}>(token, TokenType.USER_TOKEN, passwordHash);
		return data.id;
	}
}
