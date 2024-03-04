export class Semaphore {
    private key: boolean;
    private waiting: Function[];
  
    constructor() {
      this.key = true;
      this.waiting = [];
    }
  
    async acquire(): Promise<void> {
      return new Promise((resolve) => {
        if (this.key) {
          this.key = false;
          resolve();
        } else {
          this.waiting.push(resolve);
        }
      });
    }
  
    release(): void {
      this.key = true;
      const waiter = this.waiting.shift();
      if (waiter) {
        waiter();
      }
    }
  }