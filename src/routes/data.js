import express from "express";
import { handleDataRequest } from "../controllers/system/selector.js";

const data = express.Router();

data.get("/", (req, res) => {
  res.status(200).json({ mensagem: "Rota GET exemplo, tudo OK!"});
});

data.post("/", async (req, res) => {
  try {
    console.log('\x1b[33m%s\x1b[0m', 'handleDataRequest req: ', req);
    // const response = await handleDataRequest(req.body);
    // console.log('\x1b[33m%s\x1b[0m', 'handleDataRequest response: ', response);
    res.status(200).json('OK');
  } catch (error) {
    res.status(500).json("Erro ao enviar a resposta!");
    console.log('\x1b[31m%s\x1b[0m',error);
  }
});

export default data;
