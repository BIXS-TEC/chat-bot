import express from 'express';
import message from './routes/message.js';
import auth from './routes/auth.js';
import config from './routes/config.js';
import { systemSetup } from './controllers/system/selector.js';

systemSetup();
const app = express();
const port = 5002;

app.use(express.json());

app.use('/message', message);

app.use('/auth', auth);

app.use('/config', config);

app.get('/', (req, res) => {
  res.status(200).json('Home!');
})

app.listen(port, () => {
  console.log(`Path to chatbot: http://54.227.229.46:5002/message`);
});

// node_modules\@wppconnect\server\dist\util\createSessionUtil.js