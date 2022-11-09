import * as AWS from 'aws-sdk';
import { UserJWTData } from '../../types/jwt';
import EmailBlacklistManager from '../managers/emailBlacklistManager';
import JWTManager from '../managers/JWTManager';
import Utils from '../utils/utils';

const region = process.env.AWS_REGION;

const EMAIL_SENDER = 'DokChat <no-reply@dokurno.dev>';

export default class EmailClient {
	private client: AWS.SES;

	constructor() {
		this.client = new AWS.SES({
			region: region
		});
	}

	public async sendEmailConfirmEmail(user: UserJWTData) {
		if(await EmailBlacklistManager.isEmailBlacklisted(user.email)) {
			return Promise.reject('This email is blacklisted');
		}

		const confirmToken = await JWTManager.generateEmailConfirmToken(user);
		const confirmUrl = `https://dokchat.dokurno.dev/confirm-email/${confirmToken}`;

		const params: AWS.SES.SendTemplatedEmailRequest = {
			Source: EMAIL_SENDER,
			ConfigurationSetName: 'dokchat-config-set',
			Destination: {
				ToAddresses: [ user.email ]
			},
			Template: 'dokchat-confirm-email',
			//eslint-disable-next-line
			TemplateData: `{ \"username\":\"${Utils.userDiscriminator(user)}\", \"confirmation-url\": \"${confirmUrl}\"  }`
		};

		return this.client.sendTemplatedEmail(params).promise();
	}
}
