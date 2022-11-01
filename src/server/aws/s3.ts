import { S3Client } from '@aws-sdk/client-s3';

export const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3Client = new S3Client({
	region,
	credentials: {
		accessKeyId,
		secretAccessKey
	}
});

export default s3Client;
