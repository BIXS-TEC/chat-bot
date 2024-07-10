import express from "express";
import { config as cfg } from "../controllers/system/selector.js";

const config = express.Router();

config.get("/", (req, res) => {
  res.status(200).json({ mensagem: "Rota GET exemplo, tudo OK!"});
});

config.post("/", async (req, res) => {
  try {
    console.log('\x1b[33m%s\x1b[0m', 'handleConfigRequest req: ', req);
    const response = await cfg.handleConfigRequest(req.body);
    console.log('\x1b[33m%s\x1b[0m', 'handleConfigRequest response: ', response);
    res.status(200).json('OK');
  } catch (error) {
    res.status(500).json("Erro ao enviar a resposta!");
    console.log('\x1b[31m%s\x1b[0m',error);
  }
});

config.post("/createChatbot", async (req, res) => {
  try {
    console.log('\x1b[33m%s\x1b[0m', 'createChatbot req: ', req.body);
    const response = await cfg.createChatbot(req.body);
    res.status(200).json('OK');
  } catch (error) {
    res.status(500).json("Erro ao enviar a resposta!");
    console.log('\x1b[31m%s\x1b[0m', error);
  }
});

export default config;