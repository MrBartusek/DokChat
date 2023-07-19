import * as dotenv from 'dotenv';
dotenv.config();

import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as http from 'http';
import * as morgan from 'morgan';
import * as schedule from 'node-schedule';
import * as path from 'path';
import * as s3Client from './aws/s3';
import { Server } from 'socket.io';
import { ATTACHMENT_MAX_SIZE } from '../types/const';
import { createDatabaseStructure } from './db/structure';
import registerMessageHandler from './handlers/chatHandler';
import processEmailBounces from './jobs/processBounces';
import processEmailComplaints from './jobs/processComplaints';
import ensureAuthenticatedSocket from './middlewares/ensureAuthenticatedSocket';
import apiRouter from './routes';
import registerOnlineStatusHandler from './handlers/onlineStatusHandler';
import { systemMessageHandler } from './handlers/systemMessageHandler';
import helmet from 'helmet';

const isProduction = (process.env['NODE' + '_ENV'] || 'development') == 'production';

async function initializeDatabase() {
	let retries = 5;
	while (retries) {
		try {
			await createDatabaseStructure();
			break;
		}
		catch (error) {
			console.log('Failed to initialize database, retry in 5 seconds...');
			console.log(error);
			retries -= 1;
			await new Promise(res => setTimeout(res, 5000));
		}
	}
	console.log('[OK] Database connected!');
}

async function main() {
	console.log('\r\nStarting DokChat...');

	await initializeDatabase();

	// Setup web and websocket server
	const app = express();
	const server = http.createServer(app);
	const io = new Server(server, { maxHttpBufferSize: ATTACHMENT_MAX_SIZE });

	// Register middleware
	const helmetEnabled = process.env.ENABLE_HELMET === 'true';
	if (helmetEnabled) {
		app.use(helmet({
			contentSecurityPolicy: {
				useDefaults: true,
				directives: {
					'script-src': [
						'\'self\'',
						'https://www.google.com/recaptcha/', // reCAPTCHA
						'https://www.gstatic.com/recaptcha/', // reCAPTCHA
						'https://accounts.google.com/gsi/', // Google Sign-In
						'https://connect.facebook.net/', // Facebook SDK
						'https://*.googletagmanager.com' // Google Analytics
					],
					'frame-src': [
						'\'self\'',
						'https://www.google.com/recaptcha/', // reCAPTCHA
						'https://recaptcha.google.com/recaptcha/', // reCAPTCHA
						'https://accounts.google.com/gsi/' // Google Sign-In
					],
					'connect-src': [
						'\'self\'',
						'https://www.facebook.com/', // Facebook SDK
						'https://*.google-analytics.com', // Google Analytics
						'https://*.analytics.google.com', // Google Analytics
						'https://*.googletagmanager.com', // Google Analytics
						'https://tenor.googleapis.com/' // Tenor
					],
					'media-src': [
						'\'self\'',
						`https://${s3Client.bucketName}.s3.eu-central-1.amazonaws.com`,
						'https://media.tenor.com/'
					],
					'img-src': [
						'\'self\'',
						'data:', // In-line base 64 SVGs
						`https://${s3Client.bucketName}.s3.eu-central-1.amazonaws.com`, // S3 Bucket
						'https://*.google-analytics.com', // Google Analytics
						'https://*.googletagmanager.com' // Google Analytics
					]
				}
			},
			referrerPolicy: {
				policy: 'strict-origin-when-cross-origin' //  Google Sign-In - https://stackoverflow.com/a/70739451
			},
			crossOriginOpenerPolicy: {
				policy: 'same-origin-allow-popups'
			}
		}));
	}
	app.use(express.json());
	app.use(morgan('dev'));
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, '/../public')));

	// Server API, frontend and
	app.use('/api', apiRouter);
	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname + '/../public/index.html'));
	});

	// Setup websocket
	io.use(ensureAuthenticatedSocket());
	io.on('connection', (socket) => {
		registerMessageHandler(io, socket);
		registerOnlineStatusHandler(io, socket);
		systemMessageHandler.connect(io, socket);
	});

	// Schedule jobs
	const enableBouncesHandling = process.env.ENABLE_SNS_BOUNCES_HANDLING === 'true';
	if (isProduction && enableBouncesHandling) {
		schedule.scheduleJob('Handle SES Bounces', '*/10 * * * *', processEmailBounces).invoke();
		schedule.scheduleJob('Handle SES Complaints', '*/10 * * * *', processEmailComplaints).invoke();
		console.info('[OK] Bounces/Complains processing module - enabled');
	}
	else if (enableBouncesHandling) {
		console.info('[!] Bounces/Complains processing module - app is running in development mode');
	}
	else {
		console.info('[!] Bounces/Complains processing module - disabled by ENABLE_SNS_BOUNCES_HANDLING');
	}

	// Start the server
	const port = process.env.PORT || 3000;
	server.listen(port, () => console.log(`\r\nDokChat Server is listening on http://localhost:${port}/`));
}

main();

