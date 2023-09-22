"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var business_1 = require("./business");
require("dotenv").config();
var express = require("express");
var axios = require("axios");
var app = express();
var port = 3000;
app.use(express.json());
var VERIFYTOKEN = process.env.VERIFYTOKEN;
var business = new business_1.default(3264);
app.get("/webhook", function (req, res) {
    var mode = req.query["hub.mode"];
    var token = req.query["hub.verify_token"];
    var challenge = req.query["hub.challenge"];
    if (mode && token) {
        if (mode === "subscribe" && token === VERIFYTOKEN) {
            res.status(200).send(challenge);
        }
        else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});
app.post("/webhook", function (req, res) {
    business.postRequest(req, res);
});
app.post("/business", function (req, res) {
    // Criar business a partir do request
    // controller.postRequest(req, res)
});
app.use(function (error, req, res, next) {
    res.status(500);
    res.send({ error: error });
    console.error(error.stack);
    next(error);
});
app.listen(port, function () { return console.log("Listening at http://localhost:".concat(port)); });
//# sourceMappingURL=index.js.map