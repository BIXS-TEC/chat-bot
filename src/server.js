import express from 'express';
import message from './routes/client-msg.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/', message);

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
  console.log(`Path: https://8577-200-225-115-74.ngrok-free.app/message`);
});

// node_modules\@wppconnect\server\dist\util\createSessionUtil.js