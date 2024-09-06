import express from 'express';
import message from './routes/message.js';
import auth from './routes/auth.js';
import config from './routes/config.js';
import cors from 'cors';


const id = 'localhost' //'54.227.229.46' // IP do endereço do servidor
const path = id + ':5001'; // Porta do wppconnect-server

const app = express();
const port = 5002;

const corsOptions = {
  origin: '*', // Permitir todas as origens
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());
// Endpoint para envio de requisições de mensagens para o chatbot
app.use('/message', message);
// Endpoint não implementado para processo de authenticação para requisições do chatbot
app.use('/auth', auth);
// Endpoint para alterações de dados do chatbot
app.use('/config', config);

app.get('/', (req, res) => {
  res.status(200).json('Home!');
});

app.listen(port, () => {
  console.log(`Path to chatbot-server: https://${id}:5002/message`);
});

// importando em src\APIs\wppconnect-server\wpp-sender.js
export default path;