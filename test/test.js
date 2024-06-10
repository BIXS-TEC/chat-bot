// Importa os módulos necessários
import express from 'express';
import os from 'os';

// Cria uma aplicação Express
const app = express();

// Define a porta em que o servidor irá escutar
const port = 5001;

// Função para obter o endereço IP da máquina
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Pula interfaces internas (loopback) e IPv6
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Caso nenhum IP externo seja encontrado
};

// Define a rota para /home que responde com "Server running!"
app.get('/home', (req, res) => {
  res.send('Server running!');
});

// Inicia o servidor
app.listen(port, () => {
  const ipAddress = getLocalIpAddress();
  console.log(`Server running at http://${ipAddress}:${port}/`);
});