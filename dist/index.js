"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var controller_1 = require("./controller");
require("dotenv").config();
var express = require("express");
var axios = require("axios");
var hm = require("../old_js/handleMessages");
var app = express();
var port = 3000;
app.use(express.json());
var VERIFYTOKEN = process.env.VERIFYTOKEN;
var controller = new controller_1.default();
// INICIALIZAÇÃO DE UM BUSINESS TESTE
controller.writeBusinessDB(controller.createBusiness('Marcelo Pizzaria', 'ALTERARTOKEN123', '113343625148900', '15550107122'));
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
    controller.postRequest(req, res);
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