import { DeleteObjectCommand, DeleteObjectCommandInput, GetObjectCommand, GetObjectCommandInput, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import * as crypto from 'crypto';
import * as sharp from 'sharp';

export const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const SINGED_URL_EXPIRE = 60 * 60;

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
	public async getSingedUrl(key: string): Promise<string> {
		const getParams: GetObjectCommandInput = {
			Bucket: bucketName,
			Key: key
		};
		const getCommand = new GetObjectCommand(getParams);
		return await getSignedUrl(
			this.client, getCommand, { expiresIn: SINGED_URL_EXPIRE }
		);
	}

	/**
	 * Fetch and get buffer of s3 object content
	 * @param key Resource key
	 * @returns Buffer
	 */
	public async fetchBuffer(key: string) {
		const avatarUrl = await this.getSingedUrl(key);

		const response = await axios.get(avatarUrl, {
			responseType: 'arraybuffer'
		});

		return Buffer.from(response.data);
	}

	/**
	 * Format and upload user avatar to S3
	 * @param avatar Raw avatar sent by user
	 * @returns Resource key
	 */
	public async uploadAvatar(avatar: Express.Multer.File | Buffer): Promise<string> {
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

	private async imageToBuffer(file: Express.Multer.File | File | Buffer): Promise<Buffer> {
		if (file instanceof Buffer) {
			return file;
		}
		if ((file as any).buffer) {
			return (file as Express.Multer.File).buffer;
		}
		else {
			const arrBuffer = await (file as File).arrayBuffer();
			const buffer = Buffer.from(arrBuffer);
			return buffer;
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
