import { SES, SNS, SQS } from 'aws-sdk';
import sqsClient, { complaintsQueueUrl } from '../aws/sqs';
import EmailBlacklistManager from '../managers/emailBlacklistManager';

export default async function processEmailComplaints() {
	const params: SQS.ReceiveMessageRequest = {
		MaxNumberOfMessages: 10,
		QueueUrl: complaintsQueueUrl,
		VisibilityTimeout: 20,
		WaitTimeSeconds: 20
	};

	const response = await sqsClient.receiveMessage(params).promise();
	if(!response.Messages) return;
	for(const msg of response.Messages) {
		const body = JSON.parse(msg.Body);
		const complaint = JSON.parse(body.Message);
		const email = complaint.mail.destination[0];

		await EmailBlacklistManager.blacklistEmail(email);
		console.log(`Processed Complaint - '${email}' is now blacklisted!`);

		const deleteParams: SQS.DeleteMessageRequest = {
			QueueUrl: complaintsQueueUrl,
			ReceiptHandle: msg.ReceiptHandle
		};
		await sqsClient.deleteMessage(deleteParams).promise();
	}
}
