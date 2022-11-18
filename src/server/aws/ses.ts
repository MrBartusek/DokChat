import * as AWS from 'aws-sdk';
import { UserJWTData } from '../../types/jwt';
import db from '../db';
import EmailBlacklistManager from '../managers/emailBlacklistManager';
import JWTManager from '../managers/JWTManager';
import Utils from '../utils/utils';
import sql from 'sql-template-strings';
import { User } from '../../types/common';

const region = process.env.AWS_REGION;

const EMAIL_SENDER = 'DokChat <no-reply@dokurno.dev>';

class EmailClient {
	private client: AWS.SES;

	constructor() {
		this.client = new AWS.SES({
			region: region
		});
	}

	private async sendTemplatedEmail(template: string, templateData: string, destination: string) {
		if(await EmailBlacklistManager.isEmailBlacklisted(destination)) {
			return Promise.reject('This e-mail address is blacklisted. Please contact support.');
		}

		const params: AWS.SES.SendTemplatedEmailRequest = {
			Source: EMAIL_SENDER,
			ConfigurationSetName: 'dokchat-config-set',
			Destination: {
				ToAddresses: [ destination ]
			},
			Template: template,
			TemplateData: templateData
		};

		return this.client.sendTemplatedEmail(params).promise();
	}

	public async sendEmailConfirmEmail(user: UserJWTData | User, email: string) {
		const confirmToken = await JWTManager.generateEmailConfirmToken(user.id, email);
		const confirmUrl = `https://dokchat.dokurno.dev/email-confirm/${confirmToken}`;

		// eslint-disable-next-line no-useless-escape
		const templateData = `{ \"username\":\"${Utils.userDiscriminator(user)}\", \"confirmation-url\": \"${confirmUrl}\"  }`;
		return this.sendTemplatedEmail('dokchat-confirm-email', templateData, email);
	}

	public async sendPasswordResetEmail(email: string) {
		const query = await db.query(sql`SELECT id, password_hash as "passwordHash" FROM users WHERE email = $1;`, [ email ]);
		const passwordHash = query.rows[0].passwordHash;
		const id = query.rows[0].id;
		const resetToken = await JWTManager.generatePassResetToken(id, email, passwordHash);
		const resetUrl = `https://dokchat.dokurno.dev/forgot-password/${resetToken}`;

		// eslint-disable-next-line no-useless-escape
		const templateData = `{ \"email\":\"${email}\", \"reset-url\": \"${resetUrl}\"  }`;
		return this.sendTemplatedEmail('dokchat-password-reset', templateData, email);
	}
}

const client = new EmailClient();
export default client;
