import express from 'express';
import message from './routes/client-msg.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/', message);

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
  console.log(`URL: https://7e42-2804-4d98-25e-5400-f48a-92a4-490b-225d.ngrok-free.app/message`);
});

// node_modules\@wppconnect\server\dist\util\createSessionUtil.js