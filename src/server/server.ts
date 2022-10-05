import * as express from 'express';
import apiRouter from './routes';
import * as path from 'path';
import { initializeDB } from './db/initalize';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import * as http from 'http';
import { DokChatSocket } from '../types/websocket';
import ensureAuthenticated from './middlewares/ensureAuthenticated';
import registerMessageHandler from './handlers/chatHandler';

// Convert express middleware to socket.io one
const wrap = (middleware: any) => (socket: DokChatSocket, next: any) => middleware(socket.request, {}, next);

// Initialize database
initializeDB();

// Setup web and websocket server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Register middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Server API, frontend and
app.use('/api', apiRouter);
app.get('*', (req,res) =>{
	res.sendFile(path.join(__dirname + '/../public/index.html'));
});

// Setup websocket
io.use(wrap(ensureAuthenticated()));
io.on('connection', (socket) => {
	registerMessageHandler(io, socket);
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server listening on port: ${port}`));
