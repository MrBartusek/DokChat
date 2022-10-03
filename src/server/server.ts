import * as express from 'express';
import apiRouter from './routes';
import * as path from 'path';
import { initializeDB } from './db/initalize';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import * as http from 'http';

initializeDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static('public'));

io.on('connection', (socket) => {
	console.log('a user connected');
});

app.use('/api', apiRouter);
app.get('*', (req,res) =>{
	res.sendFile(path.join(__dirname + '/../public/index.html'));
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server listening on port: ${port}`));
