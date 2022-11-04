import { S3Client } from '@aws-sdk/client-s3';

export const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;

const s3Client = new S3Client({ region });

export default s3Client;
