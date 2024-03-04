const { Worker, isMainThread, parentPort } = require('node:worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on('message', (message) => {
    console.log(worker.threadId)
    console.log(message+'bb');  // Prints 'Hello, world!'.
  });
  worker.postMessage('Hello, world!');
  setTimeout(()=> {
    worker.postMessage('Hello, world!');
  }, 500)
} else {
  // When a message from the parent thread is received, send it back:
  parentPort.on('message', (message) => {
    console.log(message)
    let j=0
    for(let i=0; i<2; i++){
      j++
    }
    parentPort.postMessage(message+'aa');
  });
}