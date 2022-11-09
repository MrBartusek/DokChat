import * as AWS from 'aws-sdk';

const region = process.env.AWS_REGION;

const sqsClient = new AWS.SQS({ region });

export default sqsClient;
export const complaintsQueueUrl = process.env.SQS_COMPLAINTS_URL;
export const bouncesQueueUrl = process.env.SQS_BOUNCES_URL;
