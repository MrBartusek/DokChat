import { SES, SNS, SQS } from 'aws-sdk';
import sqsClient, { bouncesQueueUrl } from '../aws/sqs';
import EmailBlacklistManager from '../managers/emailBlacklistManager';

export default async function processEmailBounces() {
	const params: SQS.ReceiveMessageRequest = {
		MaxNumberOfMessages: 10,
		QueueUrl: bouncesQueueUrl,
		VisibilityTimeout: 20,
		WaitTimeSeconds: 20
	};

	const response = await sqsClient.receiveMessage(params).promise();
	if(!response.Messages) return;
	for(const msg of response.Messages) {
		const body = JSON.parse(msg.Body);
		const bounce = JSON.parse(body.Message);
		const email = bounce.mail.destination[0];

		if(bounce.bounce.bounceType == 'Permanent') {
			await EmailBlacklistManager.blacklistEmail(email);
			console.log(`Processed Hard Bounce - '${email}' is now blacklisted!`);
		}
		else{
			console.log(`Processed Soft Bounce - '${email}' no action taken.`);
		}

		const deleteParams: SQS.DeleteMessageRequest = {
			QueueUrl: bouncesQueueUrl,
			ReceiptHandle: msg.ReceiptHandle
		};
		await sqsClient.deleteMessage(deleteParams).promise();
	}
}
