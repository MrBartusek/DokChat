import * as AWS from 'aws-sdk';

const region = process.env.AWS_REGION;

const EMAIL_SENDER = 'DokChat <no-reply@dokurno.dev>';

export default class EmailClient {
	private client: AWS.SES;

	constructor() {
		this.client = new AWS.SES({
			region: region
		});
	}

	public async sendEmail(destination: string, title: string, content: string) {
		const params: AWS.SES.SendEmailRequest = {
			Destination: {
				ToAddresses: [ destination ]
			},
			Source: EMAIL_SENDER,
			ConfigurationSetName: 'dokchat-config-set',
			Message: {
				Body: {
					Text: { Data: content }
				},
				Subject: { Data: title }
			}
		};

		return this.client.sendEmail(params).promise();
	}

	public async sendConfirmEmail(email: string, username: string, confirmUrl: string) {
		const params: AWS.SES.SendTemplatedEmailRequest = {
			Source: EMAIL_SENDER,
			ConfigurationSetName: 'dokchat-config-set',
			Destination: {
				ToAddresses: [ email ]
			},
			Template: 'dokchat-confirm-email',
			//eslint-disable-next-line
			TemplateData: `{ \"username\":\"${username}\", \"confirmation-url\": \"${confirmUrl}\"  }`
		};

		return this.client.sendTemplatedEmail(params).promise();
	}
}
