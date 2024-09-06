import express from "express";
import { message as msg } from "../controllers/system/selector.js";

const message = express.Router();

message.get("/", (req, res) => {
  res.status(200).json({ mensagem: "Rota GET para exemplo", comando: "continua" });
});

// Middleware para POST; requisições de mensagens (atuamente enviadas do wppconnect-server node_modules\@wppconnect\server\dist\util\createSessionUtil.js)
message.post("/", async (req, res) => {
  try {
    // console.log('\x1b[33m%s\x1b[0m', 'handleMessageRequest req.body: ', JSON.stringify(req.body, null, 2));
    const response = await msg.handleMessageRequest(req.body);
    console.log('\x1b[33m%s\x1b[0m', 'Message response: ', response);
    res.status(200).json('OK');
  } catch (error) {
    res.status(500).json("Erro ao enviar a resposta!");
    console.log('\x1b[31m', error);
  }
});

export default message;
