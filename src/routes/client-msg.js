import express from "express";
import { handleRequest } from "../controllers/system/selector.js";

const message = express.Router();

message.get("/message", (req, res) => {
  res.status(200).json({ mensagem: "Rota GET para exemplo", comando: "continua" });
});

message.post("/message", async (req, res) => {
  // console.log('\nreq.body:', req.body, '\n');
  handleRequest(req.body)
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json("Erro ao enviar a resposta!");
      console.log('\x1b[31m%s\x1b[0m',error);
    });
  res.status(200).json({response: "OK"});
});

export default message;
