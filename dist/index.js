var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Controller } from "./controller";
import { buildIntegration } from "./graphapi";
require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const VERIFYTOKEN = String(process.env.VERIFYTOKEN);
const WHATSAPP_BUSINESS_ACCOUNT_ID = String(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID);
const controller = new Controller();
app.use(express.json());
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
    if (mode && token) {
        if (mode === "subscribe" && token === VERIFYTOKEN) {
            console.log("Webhook connected!");
            res.status(200).send(challenge);
        }
        else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});
app.post("/webhook", (req, res) => {
    controller.accessBusiness(req, res);
});
app.get("/integration", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield buildIntegration(WHATSAPP_BUSINESS_ACCOUNT_ID);
        res.status(200).send('message');
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
app.get("/update", (req, res) => {
    try {
        if (req.body.business.id && controller.businessExist(req.body.business.id)) {
            controller.updateBusinessData(req.body.business);
        }
        else {
            res.sendStatus(400).send('Business ID does not match or does not exist!');
        }
    }
    catch (error) {
        res.sendStatus(500).send('Invalid request format.');
    }
});
app.use((error, req, res, next) => {
    res.status(500);
    res.send({ error: error });
    console.error(error.stack);
    next(error);
});
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
//# sourceMappingURL=index.js.map