import os from 'os';
import { Semaphore } from './semaphore';
import { Controller } from './controller';
import express, { Request, Response } from 'express';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';

const requestQueue: { req: Request, res: Response }[] = [];
const workerQueue: Worker[] = [];

const semaphore = new Semaphore();
const controller = new Controller();

if (isMainThread) {
  const app = express();
  const numCPUs = os.cpus().length;
  
  const busyWorkerQueue: Worker[] = [];

  // Inicia as worker_threads
  for (let i = 0; i < numCPUs; i++) {
    const worker = new Worker(__filename);
    workerQueue.push(worker);
  }

  app.use(express.json());

  app.get("/webhook", (req, res) => {
    const VERIFYTOKEN = process.env.VERIFYTOKEN;
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
    // Adiciona a requisição à fila de requisições
    requestQueue.push({ req, res });

    // Notifica a primeira thread da fila de threads disponíveis, se houver
    const worker = workerQueue.shift();
    if (worker) {
      busyWorkerQueue.push(worker);
      worker.postMessage('get_request');
    }

    // Retorna uma resposta temporária ao cliente
    res.status(202).send('Requisição recebida e está sendo processada.');
  });

  app.post('/update ', (req: Request, res: Response) => {
    // Adiciona a requisição à fila de requisições
    requestQueue.push({ req, res });

    // Notifica a primeira thread da fila de threads disponíveis, se houver
    const worker = workerQueue.shift();
    if (worker) {
      busyWorkerQueue.push(worker);
      worker.postMessage('get_request');
    }

    // Retorna uma resposta temporária ao cliente
    res.status(202).send('Requisição recebida e está sendo processada.');
  });

  // Listener para mensagens da worker_thread
  parentPort?.on('message', (id) => {

    // Coloca a worker_thread que avisou que estava disponível no final da fila
    busyWorkerQueue.forEach((worker, index) => {
      if (worker.threadId === id) {
        busyWorkerQueue.splice(index, 1);
        workerQueue.push(worker)
      }
    });
  });

  app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).send('Erro interno do servidor.');
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });

} else {
  parentPort.on('message', (message) => {
    if (message === 'get_request') {
      do{
      semaphore.acquire();
      const {req, res} = requestQueue.shift();
      semaphore.release();
      controller.accessBusiness(req, res)
      } while (requestQueue.length && !workerQueue.length);
    }
    parentPort.postMessage('finished');
  });
}