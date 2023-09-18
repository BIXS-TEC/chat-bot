const axios = require("axios");
const fs = require('fs');
const qs = require('qs');
import * as uuid from 'uuid';
import { Request, Response } from 'express';
import ClientReq from './client';
import { BotAdditional, BotProduct, BotClient } from './interfaces';

export default class Business {

    private IdFilial: number
    private name: string
    private FBTOKEN: string
    private botNumberID: string
    private botNumber: string
    private botName: string
    private productList: Record<string, BotProduct>
    private clientList: Record<string, BotClient>
    private clientRequest: ClientReq
    private orderCodeList: Set<string> = new Set<string>()
    private contexts: Record<string, (clientRequest: ClientReq) => void> = {};
    private secondsToTimeOut: number
    private showPrepTime: boolean

    constructor(IdFilial: number) {
        this.IdFilial = IdFilial
        this.initializeBusinessData()
    }

    private async initializeBusinessData() {
        try {
            const response = await axios.get(`http://lojas.vlks.com.br/api/BotBusiness/${this.IdFilial}`)

            if (response.status === 200) {
                const businessData = response.data

                this.name = businessData.name
                this.FBTOKEN = businessData.FBTOKEN
                this.botNumberID = businessData.botNumberID
                this.botNumber = businessData.botNumber
                this.botName = businessData.botName ? businessData.botName : 'o Chat BOT'
                this.productList = await this.initializeProducts()
                this.clientList = businessData.clientList ? businessData.clientList : {}
                this.showPrepTime = businessData.showPrepTime ? businessData.showPrepTime : true
                this.secondsToTimeOut = 50

                console.info(`Dados '${this.name}' carregados do banco (${Object.keys(this.productList).length} produtos)`)

                this.initializeIntents()
                console.info(`Aguardando clientes...`)
                // console.log('name: ', this.name,'\nFBTOKEN: ', this.FBTOKEN,'\nbotNumberID: ', this.botNumberID,'\nbotNumber: ', this.botNumber,'\nproductList: ', this.productList,'\nclientList: ', this.clientList,'\nshowPrepTime: ', this.showPrepTime)
            } else {
                console.error(`Initializer reponse status: ${response.status}  ${response.statusText}`)
            }
        } catch (error) {
            console.error(`Erro GET dados:\n${error}`)
        }
    }

    private async initializeProducts(): Promise<Record<string, BotProduct>> {
        try {
            const url = `http://lojas.vlks.com.br/api/BotFood/3264/36077`;
            const response = await axios.get(url);

            if (response.status === 200) {
                const productMap: Record<string, BotProduct> = {};

                await Promise.all(response.data.map(async (item) => {
                    const botProduct: BotProduct = {
                        codeProd: item.codigo,
                        nameProd: item.name,
                        priceProd: parseFloat(item.price),
                        categoryProd: item.category,
                        descriptionProd: item.description,
                        previewAdditionals: item.previewAdditionals ? item.previewAdditionals : false,
                        AdditionalList: [],
                    };

                    const modifiersUrl = `http://printweb.vlks.com.br/LoginAPI/Modificadores/${botProduct.codeProd}`;
                    const modifiersResponse = await axios.get(modifiersUrl);

                    if (modifiersResponse.status === 200) {
                        if (Array.isArray(modifiersResponse.data) && modifiersResponse.data.length > 0) {
                            botProduct.AdditionalList = modifiersResponse.data.map((modifier) => ({
                                ProductCode: modifier.codproduto,
                                AddCode: modifier.IdModificador,
                                nameAdd: modifier.nome,
                                priceAdd: modifier.preco,
                                categoryAdd: modifier.categoria,
                                enabledAdd: modifier.ativo,
                                qtdMinAdd: modifier.qtdMinima,
                                qtdMaxAdd: modifier.qtdMaxima,
                            }));
                        }
                    } else {
                        console.error(`Erro ao buscar modificadores para o produto ${botProduct.nameProd}: ${modifiersResponse.status} - ${modifiersResponse.statusText}`);
                    }
                    productMap[botProduct.codeProd.toString()] = botProduct;
                }));

                return productMap;
            } else {
                console.error(`Erro ao buscar produtos: ${response.status} - ${response.statusText}`);
                return {};
            }
        } catch (error) {
            console.error(`Erro ao buscar produtos: ${error}`);
            return {};
        }
    }

    private initializeIntents() {
        this.addContext('nenhum', (clientRequest: ClientReq) => {
            try {
                const orderListData = this.extractProductOrdersFromMessage(clientRequest.textMessage)
                if (orderListData.products?.length) {
                    this.askAdditional(clientRequest, orderListData)
                } else {
                    this.greatingsMessage(clientRequest)
                }
            } catch (error) {
                console.error('Erro em nenhum', error)
            }
        });
        this.addContext('ver_adicionais', (clientRequest: ClientReq) => {
            try {
                const BotClient = this.clientList[clientRequest.costumerWAId]
                if (clientRequest.textMessage === '0') {
                    this.reviewOrder(clientRequest)
                } else if (BotClient.productListClient.length && parseInt(clientRequest.textMessage) <= BotClient.productListClient.length) {
                    this.chooseModifier(clientRequest)
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error('Erro em ver_adicionais', error)
            }
        });
        this.addContext('escolher_adicionais', (clientRequest: ClientReq) => {
            try {
                const BotClient = this.clientList[clientRequest.costumerWAId]
                const currentProductCode = BotClient.productListClient[BotClient.currentProductIndex].codeProd
                const AdditionalList = this.productList[currentProductCode].AdditionalList
                if (clientRequest.textMessage === '0') {
                    this.askAdditional(clientRequest)
                } else if (AdditionalList && parseInt(clientRequest.textMessage) <= AdditionalList.length) {
                    this.includeAdditional(clientRequest)
                } else if (AdditionalList && parseInt(clientRequest.textMessage) === AdditionalList.length + 1) {
                    this.includeObservation(clientRequest)
                } else if (AdditionalList && parseInt(clientRequest.textMessage) === AdditionalList.length + 2 && BotClient.productListClient[BotClient.currentProductIndex].orderQtdProd > 1) {
                    this.splitProductForUniqueAdditional(clientRequest)
                    this.chooseModifier(clientRequest, false)
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error('Erro em escolher_adicionais', error)
            }
        });
        this.addContext('observacao', (clientRequest: ClientReq) => {
            try {
                this.confirmObservation(clientRequest)
            } catch (error) {
                console.error('Erro em observacao', error)
            }
        });
        this.addContext('qtd_adicionais', (clientRequest: ClientReq) => {
            try {
                this.quantityAdditional(clientRequest)
            } catch (error) {
                console.error('Erro em qtd_adicionais', error)
            }
        });
        this.addContext('revisar_pedido', (clientRequest: ClientReq) => {
            try {
                if (clientRequest.textMessage === '0') {
                    this.checkClientRegistration(clientRequest)
                } else if (clientRequest.textMessage === '1') {
                    this.editOrder(clientRequest)
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error('Erro em revisar_pedido', error)
            }
        });
        this.addContext('cadastro', (clientRequest: ClientReq) => {
            try {
                if (clientRequest.textMessage === '0') {
                    this.sendToPreparation(clientRequest)
                } else if (clientRequest.textMessage === '1') {
                    this.checkClientRegistration(clientRequest)
                }
            } catch (error) {
                console.error('Erro em cadastro', error)
            }
        });
    }

    // 1º Timestamp dif : 38
    // 2º Timestamp dif : 41
    // 3º Timestamp dif : 38
    // 4º Timestamp dif : 38
    public async postRequest(req: Request, res: Response) {
        this.clientRequest = new ClientReq(req, res)

        try {
            if (this.clientRequest.messagesObject) {

                const currentTimestamp = Math.floor(Date.now() / 1000)
                if (currentTimestamp - parseInt(this.clientRequest.timestampCostumer) < this.secondsToTimeOut) {

                    if (!this.clientList[this.clientRequest.costumerWAId]) {
                        await this.writeClientToBusinessClientListDB(this.createClient(this.clientRequest.costumerName, this.clientRequest.costumerWAId))
                    }
                    if (this.clientRequest.typeMessage === "text") {
                        this.handleIntent(this.clientRequest)
                    } else if (this.clientRequest.typeMessage === "interactive") {
                    }
                }

            } else if (this.clientRequest.statusesObject) {
                console.log(this.clientRequest.messageStatus)
            }

            res.sendStatus(200);

        } catch (error) {
            if (!this.clientList) {
                console.log(`Business não iniciado, aguarde!`)
            } else if (!this.clientList[this.clientRequest.costumerWAId]) {
                console.log(`Cliente ${this.clientList[this.clientRequest.costumerWAId]} nao existe`, error)
            }
            res.sendStatus(500);
        }
    }

    private addContext(name: string, handlerFunction: (clientRequest: ClientReq) => void) {
        this.contexts[name] = handlerFunction;
    }

    private handleIntent(clientRequest: ClientReq): void {
        const contextClient = this.clientList[clientRequest.costumerWAId] ? this.clientList[clientRequest.costumerWAId].contextClient : 'nenhum'
        if (this.contexts[contextClient] && typeof this.contexts[contextClient] === 'function') {
            console.log('context client: ', contextClient)
            this.contexts[contextClient](clientRequest)
        } else {
            console.error(`Contexto ${contextClient} não encontrado`)
        }
    }

    private uuidOrderCodeGenerator(): string {
        let orderCode: string;
        do {
            orderCode = uuid.v4();
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Os meses começam em zero
            const year = today.getFullYear();

            orderCode += `-${day}${month}${year}`;
        } while (this.orderCodeList.has(orderCode));

        this.orderCodeList.add(orderCode);

        return orderCode;
    }

    private deleteOrderCode(client: BotClient): void {
        if (client.orderCodeClient) {
            this.orderCodeList.delete(client.orderCodeClient);
        }
    }

    /**
     * Adiciona um objeto business do tipo BotBusiness com o nome definidor por name, na _businessList do controller
     * @param phone_number_id 
     * @param business 
    */
    private writeBusinessDB(): void {
        this.productList ? null : console.log(`${this.botNumberID} created with empty products list`);
        (async () => {
            let businessData = await this.readBusinessDB(this.botNumberID);
            let data = {
                "name": this.name,
                "FBTOKEN": this.FBTOKEN,
                "botNumberID": this.botNumberID,
                "botNumber": this.botNumber,
                "IdFilial": 3264
            };

            if (businessData !== null) {
                if (businessData && businessData.find(obj => obj.botNumberID === this.botNumberID)) {
                    try {
                        axios.put(`http://lojas.vlks.com.br/api/BotBusiness/${this.botNumberID}`, data)
                            .then(response => {
                                console.log(response.data);
                            })
                            .catch(error => {
                                console.error('error in PUT');
                            });
                        console.log(`Business '${this.botNumberID}' alterado com sucesso!`)
                    } catch (error) {
                        console.error('Erro na requisição POST:');
                    }
                } else {
                    try {
                        axios.post('http://lojas.vlks.com.br/api/BotBusiness', data)
                            .then(response => {
                                console.log(response.data);
                            })
                            .catch(error => {
                                console.error('error in POST');
                            });
                        console.log(`Business '${this.botNumberID}' criado com sucesso!`)
                    } catch (error) {
                        console.error('Erro na requisição PUT:');
                    }
                }
            } else {
                console.error('Erro na obtenção dos dados do negocio.');
            }
        })();
    }

    private async readBusinessDB(botNumberID: string = ""): Promise<any> {
        const url = botNumberID
            ? `http://lojas.vlks.com.br/api/BotBusiness?botNumberID=${botNumberID}`
            : `http://lojas.vlks.com.br/api/BotBusiness`;
        try {
            const response = await axios.get(url);
            return response.data.length === 0 ? undefined : response.data;
        } catch (error) {
            if (error.response.status && error.response.statusText) {
                console.error(`Erro ao tentar ler dados de '${botNumberID}'`, error.response.status, error.response.statusText);
            } else {
                console.error(`Erro ao tentar ler dados`, error.response);
            }
            return null;
        }
    }

    private deleteBusinessDB(botNumberID: string) {
        let config = {

            method: 'delete',
            maxBodyLength: Infinity,
            url: 'http://lojas.vlks.com.br/api/BotClient',
            headers: {}
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
        return
    }

    private getBusinessObject(): Record<string, any> {
        return {
            IdFilial: this.IdFilial,
            name: this.name,
            FBTOKEN: this.FBTOKEN,
            botNumberID: this.botNumberID,
            botNumber: this.botNumber,
            productList: this.productList,
            clientList: this.clientList,
            clientRequest: this.clientRequest
        };
    }

    private createClient(name: string, phoneNumberClient: string, addressClient: string = "", chatHistory: string[] = [], contextClient: string = 'nenhum', table: number = 0, BotProductList: BotProduct[] = []): BotClient {
        const client: BotClient = {
            nameClient: name,
            orderCodeClient: Math.random().toString(36).substring(2, 7).toUpperCase(), //Criar metodo de tratamento de codigo pseudo aleatorio,
            phoneNumberClient: phoneNumberClient,
            tableClient: table,
            addressClient: addressClient,
            chatHistory: chatHistory,
            contextClient: contextClient,
            productListClient: BotProductList
        }
        return client
    }

    /**
     * Criar ou modificar o dado de um cliente no banco de dados BotProdutoPedido
     * @param botNumberID Numero ID do bot do estabelecimento
     * @param clientID Numero do WA do cliente
     */
    private async writeClientToBusinessClientListDB(botClient: BotClient): Promise<void> {
        try {
            if (!this.clientList) { // Deprecated
                console.warn('clientList inicializada (Lembre-se de inicializar clientList ao instanciar um novo negocio!)')
                this.clientList = {}
            }
            botClient.editingOrder = false
            this.clientList[botClient.phoneNumberClient] = botClient;
            let clientData = await this.readClientFromBusinessDB(botClient.phoneNumberClient);  // Alterar para orderCode
            const data = {
                "numberClient": botClient.phoneNumberClient,        // "phoneNumberClient": botClient.phoneNumberClient,
                "name": botClient.nameClient,                       // "name": botClient.nameClient,
                "orderCode": this.uuidOrderCodeGenerator,           // "orderCodeClient": this.uuidOrderCodeGenerator,
                "conversationContext": botClient.contextClient,     // "contextClient": botClient.contextClient,
                "addressClient": botClient.addressClient,           // "addressClient": botClient.addressClient,
                "botNumberID": this.botNumberID                     // "botNumberID": this.botNumberID
                // "chatHistory": botClient.chatHistory,            // "chatHistory": botClient.chatHistory,
            };

            if (clientData !== null) {
                if (clientData) {
                    await axios.put(`http://lojas.vlks.com.br/api/BotClient/${this.botNumberID}/${botClient.phoneNumberClient}`, data)
                        .then(response => {
                            console.log(`Dados Client '${botClient.phoneNumberClient}' alterados no banco`)
                        })
                        .catch(error => {
                            console.error(`Erro PUT ao salvar o cliente '${botClient.phoneNumberClient}' no banco\n${error.status}  ${error.statusText}`);
                        });
                } else if (clientData === undefined) {
                    await axios.post('http://lojas.vlks.com.br/api/BotClient', data)
                        .then(response => {
                            console.log(`Dados Client '${botClient.phoneNumberClient}' criados no banco`)
                        })
                        .catch(error => {
                            console.error(`Erro POST ao salvar o cliente '${botClient.phoneNumberClient}' no banco\n${error.status}  ${error.statusText}`);
                        });
                }
            } else {
                console.error('Erro na obtenção dos dados do cliente.');
            }
        } catch (error) {
            console.log(`Não foi possivel adionar o cliente [${botClient.phoneNumberClient}] a clientList.\nError: ${error.response.data}`);
        }
    }

    private async readClientFromBusinessDB(phoneNumberClient: string = ""): Promise<any> {
        const url = phoneNumberClient
            ? `http://lojas.vlks.com.br/api/BotClient/${this.botNumberID}/${phoneNumberClient}`
            : `http://lojas.vlks.com.br/api/BotClient/${this.botNumberID}`;

        try {
            const response = await axios.get(url);
            return response.data.length === 0 ? undefined : response.data;
        } catch (error) {
            console.error(`Erro GET BotClient '${phoneNumberClient}'`, error.response.status, error.response.statusText);
            return null;
        }
    }

    private async writeClientToCupomDB(botClient: BotClient): Promise<void> {
        try {
            let clientData = await this.readClientFromCupomDB(botClient.phoneNumberClient);
            const TOKEN = await this.getTokenTabletcloud()
            const data = {

                // Dados do pedido do cliente

                // ID?: number; // Primary Key autoincrement
                // botNumberID?: string; // Buscador 1
                // orderCodeClient: string; // Buscador 2
                // phoneNumberClient: string; 
                // nameClient: string;
                // contextClient: string;
                // addressClient?: string;
                // currentProductIndex?: number;
                // tableClient?: number;
                // orderMessageId?: string;
                // totalOrderPrice?: number;
                // editingOrder?: boolean;
                // chatHistory: string[];
                // productListClient: BotProduct[];

            };
            const check = false
            if (check) {
                if (clientData !== null) {
                    const config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://api.tabletcloud.com.br/cliente/save',
                        headers: {
                            'Authorization': `Bearer ${TOKEN}`
                        },
                        data: data
                    };
                    if (clientData) {
                        config.method = 'put'
                        config.url = 'https://api.tabletcloud.com.br/cliente/update'
                    }
                    axios.request(config)
                        .then((response) => {
                            // console.log(JSON.stringify(response.data));
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } else {
                    console.error('Erro na obtenção dos dados do cliente.');
                }
            }
        } catch (error) {
            console.log(`Não foi possivel adionar o cliente [${botClient.phoneNumberClient}] a clientList.\nError: ${error.response.data}`);
        }
    }

    private async readClientFromCupomDB(id: string = ""): Promise<any> {
        const url = id
            ? `https://api.tabletcloud.com.br/`
            : `https://api.tabletcloud.com.br/`;

        try {
            const response = await axios.get(url);
            return response.data.length === 0 ? undefined : response.data;
        } catch (error) {
            console.error(`Erro GET Cupom '${id}'`, error.response.status, error.response.statusText);
            return null;
        }
    }

    private async getTokenTabletcloud(): Promise<any> {
        const url = `https://api.tabletcloud.com.br/token`

        try {
            let data = qs.stringify({
                'username': 'marcelo@vlks.com.br',
                'password': 'ozts-9195-5667-7475@5977919',
                'grant_type': 'password',
                'client_id': '2824',
                'client_secret': 'KHDG-7533-5465-0564'
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };

            axios.request(config)
                .then((response) => {
                    // console.log(JSON.stringify(response.data));
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.error(`Erro GET Token Tabletcloud`, error.response.status, error.response.statusText);
            return null;
        }
    }

    private addProductToClientProductsList(clientRequest: ClientReq, productList: BotProduct[]): void {
        try {
            const productClient = this.clientList[clientRequest.costumerWAId].productListClient;
            for (const prod of productList) {
                console.table(this.productList[prod.codeProd])
                const productCopy = { ...this.productList[prod.codeProd] };
                productCopy.AdditionalList = []
                productCopy.orderQtdProd = prod.orderQtdProd
                productCopy.previewAdditionals = productCopy.previewAdditionals ? productCopy.previewAdditionals : false
                productClient.push(productCopy)
            }
        } catch (error) {
            if (!this.clientList[clientRequest.costumerWAId]) {
                console.log(`Cliente ${clientRequest.costumerWAId} não existe!`)
            }
            console.log(`\nError: ${error.response.data}`);
        }
    }

    private async writeClientOrderToDB(botClient: BotClient, produtos: BotProduct[]) {
        try {
            let clientData = await this.readBotProductDB(botClient.phoneNumberClient);
            const data = {
                "numberClient": botClient.phoneNumberClient,        // "phoneNumberClient": botClient.phoneNumberClient,
                "name": botClient.nameClient,                       // "name": botClient.nameClient,
                "orderCode": botClient.orderCodeClient,             // "orderCodeClient": botClient.orderCodeClient,
                "conversationContext": botClient.contextClient,     // "contextClient": botClient.contextClient,
                "addressClient": botClient.addressClient,           // "addressClient": botClient.addressClient,
                "botNumberID": this.botNumberID                     // "botNumberID": this.botNumberID
                // "chatHistory": botClient.chatHistory,            // "chatHistory": botClient.chatHistory,
            };

            if (clientData !== null) {
                if (clientData) {
                    try {
                        await axios.put(`http://lojas.vlks.com.br/api/BotProduct/${this.botNumberID}/${botClient.phoneNumberClient}`, data)
                            .then(response => {
                                console.log(response.data);
                                console.log(`Pedido de '${botClient.phoneNumberClient}' alterado com sucesso!`)
                            })
                            .catch(error => {
                                console.error('error on PUT writeClientOrderToDB', error.response.data);
                            });
                    } catch (error) {
                        console.error('Erro na requisição POST:');
                    }
                } else if (clientData === undefined) {
                    try {
                        await axios.post('http://lojas.vlks.com.br/api/BotProduct', data)
                            .then(response => {
                                console.log(response.data);
                                console.log(`Pedido de '${botClient.phoneNumberClient}' criado com sucesso!`)
                            })
                            .catch(error => {
                                console.error('error on POST writeClientOrderToDB');
                            });
                    } catch (error) {
                        console.error('Erro na requisição PUT:');
                    }
                }
            } else {
                console.error('Erro na obtenção dos dados do cliente.');
            }
            // })();
        } catch (error) {
            console.log(`Não foi possivel adionar o cliente [${botClient.phoneNumberClient}] a clientList.\nError: ${error.response.data}`);
        }
    }

    private async readBotProductDB(phoneNumberClient: string = ""): Promise<any> {
        const url = phoneNumberClient
            ? `http://lojas.vlks.com.br/api/BotProduct/${this.botNumberID}/${phoneNumberClient}`
            : `http://lojas.vlks.com.br/api/BotProduct/${this.botNumberID}`;

        try {
            const response = await axios.get(url);
            return response.data.length === 0 ? undefined : response.data;
        } catch (error) {
            console.error(`Erro ao tentar ler dados de '${phoneNumberClient}'`, error.response.status, error.response.statusText);
            return null;
        }
    }

    private async readProductAdditionalDB(codigoProduto: number): Promise<any[]> {
        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `http://printweb.vlks.com.br/LoginAPI/Modificadores/${codigoProduto}`,
                headers: {}
            };

            const additionals = await axios.request(config);
            return additionals.data

        } catch (error) {
            console.error(`Erro ao buscar o modificador do produto '${codigoProduto}'\n`, error.response.status, error.response.statusText);
            return null;
        }
    }

    private sendWAMessage(message: string, costumerWAId: string, functionName: string = "") {

        let data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": costumerWAId,
            "type": "text",
            "text": {
                "preview_url": false,
                "body": message
            }
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v17.0/${this.botNumberID}/messages`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.FBTOKEN}`
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.error(`Erro ao enviar mensagem em '${functionName}'\n${error.message}`);
            });
    }

    private extractProductOrdersFromMessage(mensagem): { table: string | null; products: BotProduct[]; totalCost: number | null; } {
        const regexMesa = /Mesa: (\d+)/;
        const regexCodigo = /Cod: (\d+)/;
        const regexPedido = /(\d+) - ([^\n]+) \.\.\.\.\.\. R\$ ([\d,]+)/;
        const regexTotal = /Total do pedido: R\$ ([\d,]+)/;
        const regexSabores = /Sabores:/;
        const regexQtdSabores = /(\d+) - (\d+)/;
        const regexVazia = /^\s*\n/gm;

        let mesa: string | null = null;
        let pedidos: BotProduct[] = [];
        let totalPedido: number | null = null;

        const lines = mensagem.split('\n');

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (line.match(regexMesa)) {
                mesa = line.match(regexMesa)[1];
            }
            else if (line.match(regexCodigo)) {
                const codigo = line.match(regexCodigo)[1];
                line = lines[i + 1].trim();
                const [, quantidade, nome, preco] = line.match(regexPedido);
                if (codigo && quantidade && nome && preco) {
                    ++i;
                    line = lines[i + 1].trim();
                    const addList: BotAdditional[] = []
                    if (line.match(regexSabores)) {
                        ++i;
                        do {
                            line = lines[++i].trim();
                            const [, qtdSabor, codSabor] = line.match(regexQtdSabores)
                            addList.push({
                                ProductCode: codigo,
                                AddCode: codSabor,
                                orderQtdAdd: qtdSabor
                            });
                            line = lines[i + 1].trim();
                        } while (line.match(regexQtdSabores))
                    }
                    pedidos.push({
                        codeProd: codigo,
                        nameProd: nome.trim(),
                        priceProd: parseFloat(preco.replace(',', '.')),
                        orderQtdProd: parseInt(quantidade),
                        AdditionalList: addList
                    });
                }
            } else if (line.match(regexTotal)) {
                totalPedido = parseFloat(line.match(regexTotal)[1].replace(',', '.'));
                break;
            }
        }
        return {
            table: mesa,
            products: pedidos,
            totalCost: totalPedido,
        };
    }

    private largestPrepTime(clientRequest: ClientReq) {
        const productList = this.clientList[clientRequest.costumerWAId].productListClient
        let largestPrepTime = 0
        for (let product of productList) {
            if (product.preparationTime > largestPrepTime)
                largestPrepTime = product.preparationTime
        }
        return largestPrepTime
    }

    private splitProductForUniqueAdditional(clientRequest: ClientReq) {
        const BotClient = this.clientList[clientRequest.costumerWAId]
        const productClient = BotClient.productListClient[BotClient.currentProductIndex]
        const product = this.productList[productClient.codeProd]
        this.clientList[clientRequest.costumerWAId].productListClient.push({ ...product })
        this.clientList[clientRequest.costumerWAId].productListClient[BotClient.productListClient.length - 1].orderQtdProd = BotClient.productListClient[BotClient.currentProductIndex].orderQtdProd - 1
        this.clientList[clientRequest.costumerWAId].productListClient[BotClient.currentProductIndex].orderQtdProd = 1
        this.clientList[clientRequest.costumerWAId].currentProductIndex = BotClient.productListClient.length - 1
        this.clientList[clientRequest.costumerWAId].productListClient[BotClient.currentProductIndex].AdditionalList = []
    }

    // ------------------ INTENTS ------------------ //
    /**
     * Envia mensagem de boas vindas
     * @param recipientId 
     * @param botNumberId 
     */
    private greatingsMessage(clientRequest: ClientReq) {
        let message = `Olá! 😄 Eu sou *${this.botName}*, assistente virtual da *${this.name}*!\n🤖 Estou pronto para agilizar e facilitar o seu atendimento. 🚀`
        message += `\n\nUse os números para pedir e, pronto, o pedido está feito! 🌮 Simples assim! 🌟`
        message += `\n\nPara dar uma olhada no nosso *cardápio*, é só clicar no link! 🍔👀 \n\nhttp://printweb.vlks.com.br/Empresas/3264/Cardapio3/Index.html`


        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
        this.sendWAMessage(message, clientRequest.costumerWAId, 'greatingsMessage')
    }

    private async askAdditional(clientRequest: ClientReq, orderListData: any = {}) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId]
            if (orderListData.products?.length) {
                BotClient.tableClient = orderListData.table
                BotClient.totalOrderPrice = orderListData.totalCost
                console.log(`Pedido de ${clientRequest.costumerName}:`)
                console.table(orderListData.products)
                this.addProductToClientProductsList(clientRequest, orderListData.products)
            }
            try {
                let message = `Já anotei! 😊 \nEnvie o número do produto para adicionar *itens extras* ou escrever uma *observação especial*. ✨`
                for (let i = 0; i < BotClient.productListClient.length; i++) {
                    let product = this.productList[BotClient.productListClient[i].codeProd]
                    if (product.previewAdditionals) {
                        message += `\n\n_*${i + 1}*_ • _*${product.nameProd}*_`;
                        if (product.AdditionalList?.length) {
                            for (let j = 0; j < 3 && j < product.AdditionalList.length; j++) {
                                message += `\n\t${product.AdditionalList[j].nameAdd} - R$ ${product.AdditionalList[j].priceAdd.toFixed(2).replace('.', ',')}`
                            }
                        } else {
                            message += `\n\tNão possui`
                        }
                    } else {
                        if (product.AdditionalList) {
                            message += `\n\n_*${i + 1}*_ • _*${product.nameProd}*_`;
                        }
                    }
                }
                message += `\n\n_*0*_ • *Concluir* e *revisar* pedido 🛒✅`;

                if (!BotClient.chatHistory) {
                    this.clientList[clientRequest.costumerWAId].chatHistory = []
                }
                this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
                this.clientList[clientRequest.costumerWAId].contextClient = 'ver_adicionais'
                this.sendWAMessage(message, clientRequest.costumerWAId, 'askAdditional')
            } catch (error) {
                console.error('Erro ao criar a mensagem em askAdditional', error)
            }
        } catch (error) {
            console.error('Erro askAdditional')
        }
    }

    private async chooseModifier(clientRequest: ClientReq, firstPass: boolean = true) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId]
            let productClient: BotProduct
            let product: BotProduct
            let i = 0
            let message = ""

            if (firstPass) {
                productClient = BotClient.productListClient[parseInt(clientRequest.textMessage) - 1]
                product = this.productList[productClient.codeProd]
                BotClient.currentProductIndex = parseInt(clientRequest.textMessage) - 1
            } else {
                productClient = BotClient.productListClient[BotClient.currentProductIndex]
                product = this.productList[productClient.codeProd]
            }

            if (product.AdditionalList && product.AdditionalList.length) {
                if (BotClient.editingOrder) {
                    productClient.AdditionalList = []
                    BotClient.editingOrder = false
                    message += `\`\`\`ADICIONAIS E OBSERVAÇÕES DESTE\`\`\` _*${product.nameProd}*_ \`\`\`EXCLUÍDOS!\`\`\`\n\n`
                }
                message += `🌟 Ótima escolha! Agora, vamos deixar mais gostoso o seu _*${product.nameProd}*_:\n`
                message += `\`\`\`Responda um por mensagem\`\`\`\n\n`
                if (productClient.orderQtdProd > 1 || !firstPass) {
                    const sameCodeAddQtd = BotClient.productListClient.filter(prod => prod.codeProd === productClient.codeProd).length;
                    message += `Para o *${sameCodeAddQtd}º  _${product.nameProd}_*:\n`
                }

                for (let modifier of product.AdditionalList) {
                    message += `_*${++i}*_ • ${modifier.nameAdd} - R$ ${modifier.priceAdd.toFixed(2).replace('.', ',')}\n`;
                }
                message += `\n_*${i + 1}*_ • Escrever observação 📝\n`

            } else {
                message = `Opa, _*${product.nameProd ? product.nameProd : 'este produto'}*_ não possui adicionais.\n\n`
                message += `_*1*_ • Inclua uma *observação*!\n`
            }
            message += `\n_*0*_ • Não quero incluir? Volte para o menu de pedidos 🔄`;

            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)

            this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
            this.sendWAMessage(message, clientRequest.costumerWAId, 'chooseModifier')
        } catch (error) {
            console.error('Erro em chooseModifier', error)
        }
    }

    private includeAdditional(clientRequest: ClientReq) {
        try {
            const currentProductIndex = this.clientList[clientRequest.costumerWAId].currentProductIndex
            const productClient = this.clientList[clientRequest.costumerWAId].productListClient[currentProductIndex]
            const product = this.productList[productClient.codeProd]
            const additional = product.AdditionalList[parseInt(clientRequest.textMessage) - 1]
            let message: string

            if (!product.qtdMaxAdditionals ||
                productClient.AdditionalList.length < product.qtdMaxAdditionals ||
                productClient.AdditionalList.length === product.AdditionalList.length) {

                if (productClient.AdditionalList.some(add => add.AddCode === additional.AddCode)) {
                    message = `Opa, _*${additional.nameAdd}*_ já foi incluído.\n`
                } else {
                    message = `Ok, _*${additional.nameAdd}*_. Mais alguma coisa?\n`
                    this.clientList[clientRequest.costumerWAId].productListClient[currentProductIndex].AdditionalList.push({ ...additional })
                }

                if (additional.qtdMaxAdd) {
                    message += `Qual a *quantidade* desejada?\nVocê pode adicionar até um máximo de ${additional.qtdMaxAdd}!`
                    this.clientList[clientRequest.costumerWAId].contextClient = 'qtd_adicionais'
                } else {
                    if (productClient.orderQtdProd > 1) {
                        message += `\n\n_*${product.AdditionalList.length + 2}*_ • Se você deseja finalizar os adicionais para este produto e selecionar adicionais diferentes para os outros _*${productClient.nameProd}*_`
                        message += `\n\n_*0*_ • Se você prefere incluir os *mesmos adicionais* para *todos os outros _${productClient.nameProd}_* e voltar para lista de pedidos 🚀`
                    } else {
                        message += `\n\n_*0*_ • Voltar para lista de pedidos 🔄`
                    }
                }

            } else {
                message += `Você incluiu o numero maximo de adicionais.`
                message += `\n\n_*${product.AdditionalList.length + 1}*_ • Escrever observação 📝`
                if (productClient.orderQtdProd > 1) {
                    message += `\n\n_*${product.AdditionalList.length + 2}*_ • Se você deseja finalizar os adicionais para este produto e selecionar adicionais diferentes para os outros _*${productClient.nameProd}*_`
                    message += `\n\n_*0*_ • Se você prefere incluir os *mesmos adicionais* para *todos os outros _${productClient.nameProd}_* e voltar para lista de pedidos 🚀`
                } else {
                    message += `\n\n_*0*_ • Voltar para lista de pedidos 🔄`
                }
            }

            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
            this.sendWAMessage(message, clientRequest.costumerWAId, 'includeAdditional')

        } catch (error) {
            console.error('Erro em includeAdditional', error)
        }
    }

    private quantityAdditional(clientRequest: ClientReq) {
        const BotClient = this.clientList[clientRequest.costumerWAId]
        const additional = BotClient.productListClient[BotClient.currentProductIndex].AdditionalList[BotClient.chatHistory[BotClient.chatHistory.length - 1]]
        const productClient = this.clientList[clientRequest.costumerWAId].productListClient[BotClient.currentProductIndex]
        const product = this.productList[productClient.codeProd]
        let message: string
        if (parseInt(clientRequest.textMessage) > additional.qtdMaxima) {
            message = `Não é possivel adicionar ${clientRequest.textMessage} ${additional.nome}!\nEscolha uma quantidade de no *máximo* ${additional.qtdMaxima}.`
        } else {
            message = `Ok, então fica *${clientRequest.textMessage} ${additional.nome}*, no total de +R$ ${(2 * additional.preco).toFixed(2).replace('.', ',')}`
            message = `Deseja incluir mais algum adicional ou observação?\n\`\`\`Digite o numero do item\`\`\``
            message = `\n\n*_0_* • Voltar para a lista de pedidos`
            this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
        }

        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
        this.sendWAMessage(message, clientRequest.costumerWAId, 'quantityAdditional')
    }

    private includeObservation(clientRequest: ClientReq) {
        let message = `Por favor, *descreva* a *observação* desejada.\n\nEx: Sem cebola, guardanapo extra`

        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)

        this.clientList[clientRequest.costumerWAId].contextClient = 'observacao'
        this.sendWAMessage(message, clientRequest.costumerWAId, 'includeObservation')
    }

    private confirmObservation(clientRequest: ClientReq) {
        try {
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
            const BotClient = this.clientList[clientRequest.costumerWAId]
            const productClient = this.clientList[clientRequest.costumerWAId].productListClient[BotClient.currentProductIndex]
            const product = this.productList[productClient.codeProd]

            if (!BotClient.productListClient[BotClient.currentProductIndex].observationProd) {
                this.clientList[clientRequest.costumerWAId].productListClient[BotClient.currentProductIndex].observationProd = BotClient.chatHistory[BotClient.chatHistory.length - 1]
            } else {
                this.clientList[clientRequest.costumerWAId].productListClient[BotClient.currentProductIndex].observationProd += `, ${BotClient.chatHistory[BotClient.chatHistory.length - 1]}`
            }

            let message = `Certo, *observação anotada*!\n"${this.clientList[clientRequest.costumerWAId].productListClient[BotClient.currentProductIndex].observationProd}"`
            if (BotClient.productListClient[BotClient.currentProductIndex].AdditionalList) {
                message += `\n\nDeseja incluir mais algum adicional ou observação?\n\`\`\`Digite o numero do item\`\`\``
            } else {
                message += `\n\n_*${product.AdditionalList.length + 1}*_ • Incluir mais uma observação`
            }
            if (productClient.orderQtdProd > 1) {
                message += `\n\n_*${product.AdditionalList.length + 2}*_ • Finalizar adicionais para este produto e selecionar adicionais diferentes para os outros _*${productClient.nameProd}*_`
                message += `\n\n_*0*_ • Incluir os *_mesmos_ adicionais* para *_todos_ os outros _${productClient.nameProd}_* e voltar para lista de pedidos`
            } else {
                message += `\n\n_*0*_ • Voltar para lista de pedidos`
            }

            this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
            this.sendWAMessage(message, clientRequest.costumerWAId, 'confirmObservation')
        } catch (error) {
            console.error('Erro na funcao confirmObservation')
        }
    }

    private noContextMessage(clientRequest: ClientReq) {
        let message = "Responda com o _numero_ correspondente do item que deseja _selecionar_.\n\nPor favor, envie _um_ valor _por mensagem_ e aguarde a resposta."
        let data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clientRequest.costumerWAId,
            "type": "text",
            "text": {
                "preview_url": false,
                "body": message
            }
        });

        this.sendWAMessage(message, clientRequest.costumerWAId, 'noContextMessage')
    }

    private reviewOrder(clientRequest: ClientReq) {
        const productClient = this.clientList[clientRequest.costumerWAId].productListClient
        let totalOrderPrice = this.clientList[clientRequest.costumerWAId].totalOrderPrice
        totalOrderPrice = 0
        let message = `Seu pedido:`
        for (let product of productClient) {
            let orderQtdProd = product.orderQtdProd ? product.orderQtdProd : 1
            totalOrderPrice += orderQtdProd * product.priceProd
            message += `\n• ${orderQtdProd} ${product.nameProd} - R$ ${(orderQtdProd * product.priceProd).toFixed(2).replace('.', ',')}`
            for (let add of product.AdditionalList) {
                let orderQtdAdd = add.orderQtdAdd ? add.orderQtdAdd : 1
                totalOrderPrice += orderQtdAdd * add.priceAdd
                message += `\n\t${orderQtdAdd} ${add.nameAdd} + R$ ${(orderQtdAdd * add.priceAdd).toFixed(2).replace('.', ',')}`
            }
            message += `\n`
        }
        message += `\nTotal do pedido: ${totalOrderPrice.toFixed(2).replace('.', ',')}`
        message += `\n\n_*1*_ • Editar pedido`
        message += `\n\n_*0*_ • Finalizar pedido`

        this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido'
        this.sendWAMessage(message, clientRequest.costumerWAId, 'reviewOrder')
    }

    private editOrder(clientRequest: ClientReq) {
        const productClient = this.clientList[clientRequest.costumerWAId].productListClient
        let message = `Qual produto você deseja editar?`
        for (let i = 0; i < productClient.length; i++) {
            message += `\n\n_*${i + 1}*_ • ${productClient[i].nameProd}`
        }
        message += `\n\n_*0*_ • Deixa pra lá. Finalizar pedido`

        this.clientList[clientRequest.costumerWAId].editingOrder = true
        this.clientList[clientRequest.costumerWAId].contextClient = 'ver_adicionais'
        this.sendWAMessage(message, clientRequest.costumerWAId, 'editOrder')
    }

    private checkClientRegistration(clientRequest: ClientReq) {
        // if (!this.readClientFromCupomDB) {
        if (false) {
            let message = `Verificiamos que você ainda não possui cadastro conosco!\n\n`
            message += `Para deixar seu atendimento mais rápido e prático, gostaria de cadastrar seus dados?\n É rapidinho! `
            message += `\n\n_*1*_ Sim, por favor!`
            message += `\n\n_*0*_ Não, obrigado!`

            this.clientList[clientRequest.costumerWAId].contextClient = 'cadastro'
            this.sendWAMessage(message, clientRequest.costumerWAId, 'checkClientRegistration')
        } else {
            this.sendToPreparation(clientRequest)
        }
    }

    private sendToPreparation(clientRequest: ClientReq): void {
        try {
            const prepTime = this.largestPrepTime(clientRequest)
            let message = `Ótimo, seu pedido já esta sendo preparado!`
            if (this.showPrepTime) {
                message += `\nTempo de espera é de aproximadamente *${prepTime}* minutos`
            }

            this.sendWAMessage(message, clientRequest.costumerWAId, 'sendToPreparation')

            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
            this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido'
            console.log(`Pedido ${clientRequest.costumerName} :`)
            console.table(this.clientList[clientRequest.costumerWAId].productListClient)
            // fs.writeFileSync(`./clientObject/${clientRequest.costumerName}.json`, JSON.stringify(this.clientList[clientRequest.costumerWAId], null, 2))
            delete this.clientList[clientRequest.costumerWAId]

            console.log('Token:', this.getTokenTabletcloud())
        } catch (error) {
            console.log('Erro em sendToPreparation', error)
        }
    }
}