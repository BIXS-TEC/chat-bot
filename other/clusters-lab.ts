import { Request, Response } from 'express';
import Controller from './controller';

const os = require("os")
const cluster = require('node:cluster');
const express = require("express")
const app = express();
const numCPUs = os.cpus().length;
const controller: Controller = new Controller()

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

    app.get('/setvar', (req: Request, res: Response) => {
        console.log(`Worker ${process.pid} processing request`);
    });

    app.get('/getvar', (req: Request, res: Response) => {
        console.log(`Worker ${process.pid} processing request`);
        let j = 0
        for (let i=0; i<10000000000; i++){
            j++
        }
        console.log(j)
    });

    app.listen(3000, () => {
        console.log(`Worker ${process.pid} listening on port 3000`);
    });
}
