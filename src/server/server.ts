import * as express from 'express';
import apiRouter from './routes';
import * as path from 'path';
import { initializeDB } from './db/initalize';
import * as morgan from 'morgan';

const app = express();

initializeDB();

app.use(express.static('public'));
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.get('*', (req,res) =>{
	res.sendFile(path.join(__dirname + '/../public/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port: ${port}`));
