var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const axios = require('axios');
require("dotenv").config();
const ACCESS_TOKEN = String(process.env.ACCESS_TOKEN);
const TWO_STEP_PIN = String(process.env.TWO_STEP_PIN);
export function buildIntegration(WHATSAPP_BUSINESS_ACCOUNT_ID) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message = yield registerWABA(WHATSAPP_BUSINESS_ACCOUNT_ID);
                console.log('message', message);
                if (isSuccessMsg(message)) {
                    const data = yield getPhoneNumberID(WHATSAPP_BUSINESS_ACCOUNT_ID);
                    if (isWABAData(data)) {
                        const FROM_PHONE_NUMBER_ID = data.data[0].id;
                        const msg = yield registerPhoneNumber(FROM_PHONE_NUMBER_ID, TWO_STEP_PIN);
                        if (isSuccessMsg(msg)) {
                            console.log('Numero de celular registrado com sucesso!');
                        }
                        else {
                            reject(new Error('isSuccessMsg false'));
                        }
                    }
                    else {
                        reject(new Error('isWABAData false'));
                    }
                }
                else {
                    reject(new Error('isSuccessMsg false'));
                }
                resolve('Numero de celular registrado com sucesso!');
            }
            catch (error) {
                reject(error);
            }
        }));
    });
}
function isSuccessMsg(obj) {
    return 'success' in obj && obj.success === true;
}
function isWABAData(obj) {
    return ('data' in obj &&
        Array.isArray(obj.data) &&
        obj.data.length > 0 &&
        typeof obj.data[0].id === 'string');
}
function registerWABA(WHATSAPP_BUSINESS_ACCOUNT_ID) {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/subscribed_apps`;
    return new Promise((resolve, reject) => {
        axios.post(url, null, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        })
            .then((response) => {
            console.log('Assinatura concluída.');
            // console.log(response.data);
            resolve(response.data);
        })
            .catch((error) => {
            console.error('Erro ao assinar o aplicativo:', error.response.data);
            reject(error.response.data);
        });
    });
}
function getPhoneNumberID(WHATSAPP_BUSINESS_ACCOUNT_ID) {
    return new Promise((resolve, reject) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v18.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/phone_numbers`,
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        };
        axios.request(config)
            .then((response) => {
            console.log('Dados da WABA obtidos.');
            // console.log(response.data);
            resolve(response.data);
        })
            .catch((error) => {
            console.error('Erro ao obter dados:', error.response.data);
            reject(error.response.data);
        });
    });
}
function registerPhoneNumber(FROM_PHONE_NUMBER_ID, TWO_STEP_PIN) {
    return new Promise((resolve, reject) => {
        let data = JSON.stringify({
            "messaging_product": "whatsapp",
            "pin": TWO_STEP_PIN
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${FROM_PHONE_NUMBER_ID}/register`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            data: data
        };
        axios.request(config)
            .then((response) => {
            console.log('Registro concluído com sucesso:');
            // console.log(response.data);
            resolve(response.data);
        })
            .catch((error) => {
            console.error('Erro ao registrar o numero:', error.response.data);
            reject(error.response.data);
        });
    });
}
//# sourceMappingURL=graphapi.js.map