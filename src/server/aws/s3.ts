import { DeleteObjectCommand, DeleteObjectCommandInput, GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import sharp from 'sharp';

export const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const SINGED_URL_EXPIRE = 600;

class DokChatS3Client {
	private client: S3Client;

	constructor() {
		this.client = new S3Client({
			region: region
		});
	}

	/**
     * Get temporary url for publicly accessing s3 object
     * @param key Resource key
     * @returns Url
     */
	async getSingedUrl(key: string): Promise<string> {
		const getParams = {
			Bucket: bucketName,
			Key: key
		};
		const getCommand = new GetObjectCommand(getParams);
		return await getSignedUrl(
			this.client, getCommand, { expiresIn: SINGED_URL_EXPIRE }
		);
	}

	/**
     * Format and upload user avatar to S3
     * @param avatar Raw avatar sent by user
     * @returns Resource key
     */
	public async uploadAvatar(avatar: Express.Multer.File): Promise<string> {
		const buffer = await this.imageToBuffer(avatar);
		const formatted = await this.formatAvatar(buffer);
		return await this.uploadBuffer(formatted, 'image/png');
	}

	/**
     * Format and upload chat attachment to S3
     * @param attachment Raw attachment sent by user
     * @returns Resource key
     */
	public async uploadAttachment(buffer: Buffer, contentType: string): Promise<string> {
		return await this.uploadBuffer(buffer, contentType);
	}

	/**
     * Upload buffer to S3
     * @param buffer Buffer to upload
     * @param contentType Content-Type for this object
     * @returns Object key
     */
	async uploadBuffer(buffer: Buffer, contentType: string): Promise<string> {
		const fileName = this.generateFileKey();
		const uploadParams: PutObjectCommandInput = {
			Bucket: bucketName,
			Body: buffer,
			Key: fileName,
			ContentType: contentType
		};
		await this.client.send(new PutObjectCommand(uploadParams));
		return fileName;
	}

	/**
     * Delete object from s3
     * @param key Resource key
     */
	async deleteFile(key: string): Promise<void> {
		const deleteParams: DeleteObjectCommandInput = {
			Bucket: bucketName,
			Key: key
		};
		await this.client.send(new DeleteObjectCommand(deleteParams));
	}

	private async imageToBuffer(file: Express.Multer.File | File): Promise<Buffer> {
		if(file instanceof File) {
			const arrBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrBuffer);
			return buffer;
		}
		else {
			return file.buffer;
		}
	}

	private async formatAvatar(avatar: Buffer): Promise<Buffer> {
		return await sharp(avatar)
			.resize({ height: 256, width: 256, fit: 'cover' })
			.toFormat('png')
			.toBuffer();
	}

	private generateFileKey(bytes = 32) {
		return crypto.randomBytes(bytes).toString('hex');
	}
}

const client = new DokChatS3Client();
export default client;
