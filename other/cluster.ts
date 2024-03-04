import { Request, Response } from 'express';
import * as os from 'os';
import Controller from './controller';

const cluster = require("node:cluster")
const express = require("express")
const app = express();
const numCPUs = os.cpus().length;
const controller: Controller = new Controller()

const VERIFYTOKEN = process.env.VERIFYTOKEN;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    console.log(`Worker ${process.pid} started`);

    app.use(express.json());

    app.get("/webhook", (req, res) => {
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];
        if (mode && token) {
            if (mode === "subscribe" && token === VERIFYTOKEN) {
                console.log("Webhook connected!")
                res.status(200).send(challenge);
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        }
    });

    app.post('/webhook', (req: Request, res: Response) => {
        console.log(`Worker ${process.pid} processing request`);
        controller.accessBusiness(req, res);
        res.status(200);
    });

    app.listen(3000, () => {
        console.log(`Worker ${process.pid} listening on port 3000`);
    });
}
