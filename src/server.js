import express from 'express';
import message from './routes/message.js';
import auth from './routes/auth.js';
import data from './routes/data.js';
import { systemSetup } from './controllers/system/selector.js';

systemSetup();
const app = express();
const port = 5002;

app.use(express.json());

app.use('/message', message);

app.use('/auth', auth);

app.use('/data', data);

app.get('/', (req, res) => {
  res.status(200).json('Home!');
})

app.listen(port, () => {
  console.log(`Path to chatbot: http://54.152.116.180:5002/message`);
});

// node_modules\@wppconnect\server\dist\util\createSessionUtil.js