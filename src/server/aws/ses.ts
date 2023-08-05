import * as AWS from 'aws-sdk';
import sql from 'sql-template-strings';
import { User } from '../../types/common';
import { UserJWTData } from '../../types/jwt';
import db from '../db';
import EmailBlacklistManager from '../managers/emailBlacklistManager';
import jwtManager, { TokenAudience, TokenType } from '../managers/jwtManager';
import Utils from '../utils/utils';

const emailServiceEnabled = process.env.ENABLE_EMAIL_SERVICE == 'true';
const region = process.env.AWS_REGION;
const EMAIL_SENDER = process.env.SES_EMAIL_SENDER ?? 'DokChat <no-reply@dokurno.dev>';

class EmailClient {
	private client: AWS.SES;

	constructor() {
		this.client = new AWS.SES({
			region: region
		});
	}

	private async sendTemplatedEmail(template: string, templateData: string, destination: string) {
		if (await EmailBlacklistManager.isEmailBlacklisted(destination)) {
			return Promise.reject('This e-mail address is blacklisted. Please contact support.');
		}
		if(!emailServiceEnabled) return Promise.resolve();

		const params: AWS.SES.SendTemplatedEmailRequest = {
			Source: EMAIL_SENDER,
			ConfigurationSetName: process.env.SES_CONFIGURATION_SET_NAME,
			Destination: {
				ToAddresses: [ destination ]
			},
			Template: template,
			TemplateData: templateData
		};

		return this.client.sendTemplatedEmail(params).promise();
	}

	public async sendEmailConfirmEmail(user: UserJWTData | User, email: string) {
		const confirmToken = await jwtManager.generateEmailConfirmToken(
			user.id, email, TokenAudience.WEB_CLIENT);
		const confirmUrl = `https://dokchat.dokurno.dev/email-confirm/${confirmToken}`;

		// eslint-disable-next-line no-useless-escape
		const templateData = `{ \"username\":\"${Utils.userDiscriminator(user)}\", \"confirmation-url\": \"${confirmUrl}\"  }`;
		return this.sendTemplatedEmail('dokchat-confirm-email', templateData, email);
	}

	public async sendPasswordResetEmail(email: string) {
		const query = await db.query(sql`SELECT id, password_hash as "passwordHash" FROM users WHERE email = $1;`, [ email ]);
		const passwordHash = query.rows[0].passwordHash;
		const id = query.rows[0].id;
		const resetToken = await jwtManager.generatePassResetToken(
			id, email, TokenAudience.WEB_CLIENT, passwordHash);
		const resetUrl = `https://dokchat.dokurno.dev/forgot-password/${resetToken}`;

		// eslint-disable-next-line no-useless-escape
		const templateData = `{ \"email\":\"${email}\", \"reset-url\": \"${resetUrl}\"  }`;
		return this.sendTemplatedEmail('dokchat-password-reset', templateData, email);
	}

	public async sendEmailChangedEmail(user: UserJWTData) {
		return this.sendTemplatedEmail('dokchat-email-changed', '{}', user.email);
	}

	public async sendAccountDeletedEmail(user: UserJWTData) {
		return this.sendTemplatedEmail('dokchat-account-deleted', '{}', user.email);
	}
}

const client = new EmailClient();
export default client;
