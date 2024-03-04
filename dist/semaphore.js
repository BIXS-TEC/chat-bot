var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Semaphore {
    constructor() {
        this.key = true;
        this.waiting = [];
    }
    acquire() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (this.key) {
                    this.key = false;
                    resolve();
                }
                else {
                    this.waiting.push(resolve);
                }
            });
        });
    }
    release() {
        this.key = true;
        const waiter = this.waiting.shift();
        if (waiter) {
            waiter();
        }
    }
}
//# sourceMappingURL=semaphore.js.map