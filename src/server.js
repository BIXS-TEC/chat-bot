import express from 'express';
import message from './routes/client-msg.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/', message);

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
  console.log(`URL: https://0810-2804-4d98-25e-5400-459b-e786-94ec-5ce3.ngrok-free.app/message`);
});
