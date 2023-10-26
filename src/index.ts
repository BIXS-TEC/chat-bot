import Business from "./business";

require("dotenv").config();

const express = require("express");
const axios = require("axios");
const { AsyncLocalStorage } = require("node:async_hooks");
const asyncLocalStorage = new AsyncLocalStorage();

const app = express();
const port = 3000;

app.use(express.json());

const VERIFYTOKEN = process.env.VERIFYTOKEN;
let business: Business = new Business('113343625148900');


app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === VERIFYTOKEN) {
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  business.postRequest(req, res)
});

app.use((error, req, res, next) => {
  res.status(500);
  res.send({ error: error });
  console.error(error.stack);
  next(error);
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
