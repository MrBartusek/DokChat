import * as dotenv from 'dotenv';
dotenv.config();

import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as http from 'http';
import * as morgan from 'morgan';
import * as schedule from 'node-schedule';
import * as path from 'path';
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

const isProduction = (process.env['NODE' + '_ENV'] || 'development') == 'production';

async function main() {
	// Initialize database
	await initializeDB();

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
	server.listen(port, () => console.log(`DokChat Server is listening on port: ${port}`));
}

main();

