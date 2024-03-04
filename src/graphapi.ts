const axios = require('axios');
require("dotenv").config();

const ACCESS_TOKEN = String(process.env.ACCESS_TOKEN);
const TWO_STEP_PIN = String(process.env.TWO_STEP_PIN);

interface Message {
    success: true;
}

interface WABAData {
    data: [
        {
            verified_name: string,
            code_verification_status: string,
            display_phone_number: string,
            quality_rating: string,
            platform_type: string,
            throughput: any,
            id: string
        }
    ],
    paging: {
        cursors: {
            before: string,
            after: string
        }
    }
}

export async function buildIntegration(WHATSAPP_BUSINESS_ACCOUNT_ID: string): Promise<any> {
    return new Promise(async (resolve, reject) => {

        try {
            const message = await registerWABA(WHATSAPP_BUSINESS_ACCOUNT_ID);
            console.log('message', message);
            if (isSuccessMsg(message)) {
                const data = await getPhoneNumberID(WHATSAPP_BUSINESS_ACCOUNT_ID);
                if (isWABAData(data)) {
                    const FROM_PHONE_NUMBER_ID = data.data[0].id;
                    const msg = await registerPhoneNumber(FROM_PHONE_NUMBER_ID, TWO_STEP_PIN);
                    if (isSuccessMsg(msg)) {
                        console.log('Numero de celular registrado com sucesso!')
                    } else {
                        reject(new Error('isSuccessMsg false'))
                    }
                } else {
                    reject(new Error('isWABAData false'))
                }
            } else {
                reject(new Error('isSuccessMsg false'))
            }
            resolve('Numero de celular registrado com sucesso!');
        } catch (error) {
            reject(error);
        }
    })
}

function isSuccessMsg(obj: any): obj is Message {
    return 'success' in obj && obj.success === true;
}

function isWABAData(obj: any): obj is WABAData {
    return (
        'data' in obj &&
        Array.isArray(obj.data) &&
        obj.data.length > 0 &&
        typeof obj.data[0].id === 'string'
    );
}

function registerWABA(WHATSAPP_BUSINESS_ACCOUNT_ID: string) {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/subscribed_apps`;

    return new Promise((resolve, reject) => {

        axios.post(url, null, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        })
            .then((response: any) => {
                console.log('Assinatura concluída.');
                // console.log(response.data);
                resolve(response.data);
            })
            .catch((error: any) => {
                console.error('Erro ao assinar o aplicativo:', error.response.data);
                reject(error.response.data);
            });
    });
}

function getPhoneNumberID(WHATSAPP_BUSINESS_ACCOUNT_ID: string) {

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
            .then((response: any) => {
                console.log('Dados da WABA obtidos.');
                // console.log(response.data);
                resolve(response.data);
            })
            .catch((error: any) => {
                console.error('Erro ao obter dados:', error.response.data);
                reject(error.response.data);
            });
    })
}

function registerPhoneNumber(FROM_PHONE_NUMBER_ID: string, TWO_STEP_PIN: string) {

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
            .then((response: any) => {
                console.log('Registro concluído com sucesso:');
                // console.log(response.data);
                resolve(response.data);
            })
            .catch((error: any) => {
                console.error('Erro ao registrar o numero:', error.response.data);
                reject(error.response.data);
            });
    })
}