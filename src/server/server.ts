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
import { initializeDB } from './db/initalize';
import registerMessageHandler from './handlers/chatHandler';
import processEmailBounces from './jobs/processBounces';
import processEmailComplaints from './jobs/processComplaints';
import ensureAuthenticatedSocket from './middlewares/ensureAuthenticatedSocket';
import apiRouter from './routes';
import registerOnlineStatusHandler from './handlers/onlineStatusHandler';
import { systemMessageHandler } from './handlers/systemMessageHandler';
import helmet from 'helmet';

const isProduction = (process.env['NODE' + '_ENV'] || 'development') == 'production';

async function main() {
	console.log('Starting DokChat...');

	// Initialize database
	await initializeDB()
		.catch((error) => {
			console.log('Failed to initialize database, program will now close');
			console.log(error);
			process.exit(1);
		});

	// Setup web and websocket server
	const app = express();
	const server = http.createServer(app);
	const io = new Server(server, { maxHttpBufferSize: ATTACHMENT_MAX_SIZE});

	// Register middleware
	app.use(express.json());
	app.use(morgan('dev'));
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, '/../public')));
	if(isProduction) {
		app.use(helmet({
			contentSecurityPolicy: {
				useDefaults: true,
				directives: {
					'script-src': [
						'\'self\'',
						'https://www.google.com/recaptcha/', // reCAPTCHA
						'https://www.gstatic.com/recaptcha/', // reCAPTCHA
						'https://accounts.google.com/gsi/', // Google Sign-In
						'https://connect.facebook.net/' // Facebook SDK
					],
					'frame-src': [
						'\'self\'',
						'https://www.google.com/recaptcha/', // reCAPTCHA
						'https://recaptcha.google.com/recaptcha/', // reCAPTCHA
						'https://accounts.google.com/gsi/' // Google Sign-In
					],
					'connect-src': [
						'\'self\'',
						'https://www.facebook.com/' // Facebook SDK
					],
					'media-src': [
						'\'self\'',
						`https://${s3Client.bucketName}.s3.eu-central-1.amazonaws.com`
					],
					'img-src': [
						'\'self\'',
						`https://${s3Client.bucketName}.s3.eu-central-1.amazonaws.com`
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

	// Server API, frontend and
	app.use('/api', apiRouter);
	app.get('*', (req,res) =>{
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
	if(isProduction) {
		schedule.scheduleJob('Handle SES Bounces', '*/10 * * * *', processEmailBounces).invoke();
		schedule.scheduleJob('Handle SES Complaints', '*/10 * * * *', processEmailComplaints).invoke();
	}
	else {
		console.info('Not processing Bounces/Complains - app is running in development mode');
	}

	// Start the server
	const port = process.env.SERVER_PORT || 3000;
	server.listen(port, () => console.log(`DokChat Server is listening on http://localhost:${port}/`));
}

main();

