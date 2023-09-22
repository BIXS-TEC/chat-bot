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
            const response = await axios.get(`http://lojas.vlks.com.br/api/BotBusiness/113343625148900`) //correto: http://lojas.vlks.com.br/api/BotBusiness/${this.IdFilial}

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
                this.initializeIntents()

                if (Object.values(this.productList).length) {
                    console.log('name: ', this.name, '\nFBTOKEN: ', this.FBTOKEN, '\nbotNumberID: ', this.botNumberID, '\nbotNumber: ', this.botNumber, '\nclientList: ', this.clientList, '\nshowPrepTime: ', this.showPrepTime)
                    console.log('productList: ')
                    console.table(this.productList)
                    console.info(`Dados '${this.name}' carregados do banco (${Object.keys(this.productList).length} produtos)`)
                    console.info(`Aguardando clientes...`)
                } else {
                    console.error("\x1b[31m%s\x1b[0m", 'Não foi possivel carregar os produtos do banco.')
                    console.error("\x1b[33m%s\x1b[0m", 'Por favor, reinicie o servidor!')
                }
            } else {
                console.error("\x1b[31m%s\x1b[0m", `Initializer reponse status: ${response.status}  ${response.statusText}`)
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", `Erro GET dados:\n${error}`)
        }
    }

    private async initializeProducts(): Promise<Record<string, BotProduct>> {
        try {
            const url = `http://lojas.vlks.com.br/api/BotFood/${this.IdFilial}`;
            const response = await axios.get(url);

            if (response.status === 200) {
                const productMap: Record<string, BotProduct> = {};
                // Excluir tempRecProducts após incluir parametros produtoRecomendado em BotProducts
                const tempRecProducts = ['740651', '1229618', '845031', '1272635', '845028', '845030', '1229516', '2311415', '1807348', '2165481', '2311795', '3717285', '699951']

                await Promise.all(response.data.map(async (item) => {
                    const botProduct: BotProduct = {
                        codeProd: item.codigo,
                        nameProd: item.name,
                        priceProd: parseFloat(item.price),
                        categoryProd: item.category,
                        descriptionProd: item.description,
                        recommendedProductCode: tempRecProducts[Math.floor(parseFloat(item.price) / 8)], // Alterar após incluir preço recomendado nos produtos no BD
                        imageProdUrl: item.imagem,
                        AdditionalList: {},
                    };

                    const modifiersUrl = `http://printweb.vlks.com.br/LoginAPI/Modificadores/${botProduct.codeProd}`;
                    const modifiersResponse = await axios.get(modifiersUrl);

                    if (modifiersResponse.status === 200) {
                        if (Array.isArray(modifiersResponse.data) && modifiersResponse.data.length > 0) {
                            botProduct.AdditionalList = modifiersResponse.data.reduce((acc, modifier) => {
                                if (modifier.categoria === "Adicionais") {
                                    acc[modifier.IdModificador] = {
                                        ProductCode: modifier.codproduto,
                                        AddCode: modifier.IdModificador,
                                        nameAdd: modifier.nome,
                                        priceAdd: modifier.preco,
                                        categoryAdd: modifier.categoria,
                                        enabledAdd: modifier.ativo,
                                        qtdMinAdd: modifier.qtdMinima,
                                        qtdMaxAdd: modifier.qtdMaxima,
                                    };
                                }
                                return acc;
                            }, {});
                        }
                    } else {
                        console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar modificadores para o produto ${botProduct.nameProd}: ${modifiersResponse.status} - ${modifiersResponse.statusText}`);
                    }
                    productMap[botProduct.codeProd.toString()] = botProduct;
                }));

                return productMap;
            } else {
                console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar produtos: ${response.status} - ${response.statusText}`);
                return {};
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar produtos: ${error}`);
            return {};
        }
    }

    private initializeIntents() {
        this.addContext('nenhum', (clientRequest: ClientReq) => {
            try {
                const orderListData = this.extractProductOrdersFromMessage(clientRequest.textMessage)
                if (orderListData.products?.length) {
                    this.clientList[clientRequest.costumerWAId].orderMessageId = 'salvar'
                    console.log('orderListData', orderListData)
                    this.askAdditional(clientRequest, orderListData)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
                } else {
                    this.greatingsMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em nenhum', error)
            }
        });
        this.addContext('escolher_adicionais', (clientRequest: ClientReq) => {
            try {
                const BotClient = this.clientList[clientRequest.costumerWAId]
                if (clientRequest.textMessage === '0') {
                    this.reviewOrder(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido'
                } else if (BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]?.AddCode) {
                    this.includeAdditional(clientRequest)
                } else if (BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]?.observation === '') {
                    this.includeObservation(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'observacao'
                } else if (parseInt(clientRequest.textMessage) === BotClient.fullAdditionalList.length + 1) {
                    this.includeRecommendedProduct(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'quantidade_recomendado'
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em escolher_adicionais', error)
            }
        });
        this.addContext('observacao', (clientRequest: ClientReq) => {
            try {
                this.confirmObservation(clientRequest)
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em observacao', error)
            }
        });
        this.addContext('qtd_adicionais', (clientRequest: ClientReq) => {
            try {
                this.quantityAdditional(clientRequest)
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em qtd_adicionais', error)
            }
        });
        this.addContext('quantidade_recomendado', (clientRequest: ClientReq) => {
            try {
                this.quantityRecommendedProduct(clientRequest)
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em observacao', error)
            }
        });
        this.addContext('revisar_pedido', (clientRequest: ClientReq) => {
            try {
                if (clientRequest.textMessage === '0') {
                    this.checkClientRegistration(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'cadastro'
                } else if (clientRequest.textMessage === '1') {
                    this.askProductForEdit(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'editar_pedido'
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em revisar_pedido', error)
            }
        });
        this.addContext('editar_pedido', (clientRequest: ClientReq) => {
            try {
                if (clientRequest.textMessage === '0') {
                    this.checkClientRegistration(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'cadastro'
                } else if (parseInt(clientRequest.textMessage) <= this.clientList[clientRequest.costumerWAId].productListClient.length) {
                    this.editOrder(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em revisar_pedido', error)
            }
        });
        this.addContext('cadastro', (clientRequest: ClientReq) => {
            try {
                if (clientRequest.textMessage === '0') {
                    this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido'
                    this.sendToPreparation(clientRequest)
                } else if (clientRequest.textMessage === '1') {
                    this.checkClientRegistration(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'cadastro'
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em cadastro', error)
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
                        // Tratar mensagens com botões
                    }
                }

            } else if (this.clientRequest.statusesObject) {
                if (!this.clientList[this.clientRequest.recipientId]) {
                    if (this.clientRequest.messageStatus === "delivered") {
                        if (this.clientList[this.clientRequest.recipientId].orderMessageId === 'salvar')
                            this.clientList[this.clientRequest.recipientId].orderMessageId = this.clientRequest.sentMessageId
                        console.log(this.clientRequest.messageStatus)
                    }
                }
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
            console.error("\x1b[31m%s\x1b[0m", `Contexto ${contextClient} não encontrado`)
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
                                console.error("\x1b[31m%s\x1b[0m", 'error in PUT');
                            });
                        console.log(`Business '${this.botNumberID}' alterado com sucesso!`)
                    } catch (error) {
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição POST:');
                    }
                } else {
                    try {
                        axios.post('http://lojas.vlks.com.br/api/BotBusiness', data)
                            .then(response => {
                                console.log(response.data);
                            })
                            .catch(error => {
                                console.error("\x1b[31m%s\x1b[0m", 'error in POST');
                            });
                        console.log(`Business '${this.botNumberID}' criado com sucesso!`)
                    } catch (error) {
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição PUT:');
                    }
                }
            } else {
                console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do negocio.');
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
                console.error("\x1b[31m%s\x1b[0m", `Erro ao tentar ler dados de '${botNumberID}'`, error.response.status, error.response.statusText);
            } else {
                console.error("\x1b[31m%s\x1b[0m", `Erro ao tentar ler dados`, error.response);
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
            orderCodeClient: this.uuidOrderCodeGenerator(),
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
                "orderCode": botClient.orderCodeClient,             // "orderCodeClient": this.uuidOrderCodeGenerator,
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
                            console.error("\x1b[31m%s\x1b[0m", `Erro PUT ao salvar o cliente '${botClient.phoneNumberClient}' no banco\n${error.status}  ${error.statusText}`);
                        });
                } else if (clientData === undefined) {
                    await axios.post('http://lojas.vlks.com.br/api/BotClient', data)
                        .then(response => {
                            console.log(`Dados Client '${botClient.phoneNumberClient}' criados no banco`)
                        })
                        .catch(error => {
                            console.error("\x1b[31m%s\x1b[0m", `Erro POST ao salvar o cliente '${botClient.phoneNumberClient}' no banco\n${error.status}  ${error.statusText}`);
                        });
                }
            } else {
                console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do cliente.');
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
            console.error("\x1b[31m%s\x1b[0m", `Erro GET BotClient '${phoneNumberClient}'`, error.response.status, error.response.statusText);
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
                    console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do cliente.');
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
            console.error("\x1b[31m%s\x1b[0m", `Erro GET Cupom '${id}'`, error.response.status, error.response.statusText);
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
            console.error("\x1b[31m%s\x1b[0m", `Erro GET Token Tabletcloud`, error.response.status, error.response.statusText);
            return null;
        }
    }

    private addProductsToClientProductsList(clientRequest: ClientReq, productList: BotProduct[]): void {
        try {
            const productClient = this.clientList[clientRequest.costumerWAId].productListClient;
            for (const prod of productList) {
                for (let qtd = 0; qtd < prod.orderQtdProd; qtd++) {
                    const productCopy = { ...this.productList[prod.codeProd] };
                    productCopy.AdditionalList = {}
                    productCopy.orderQtdProd = 1
                    productClient.push(productCopy)
                }
            }
            console.log('addProductsToClientProductsList, productListClient')
            console.table(this.clientList[clientRequest.costumerWAId].productListClient)
        } catch (error) {
            if (!this.clientList[clientRequest.costumerWAId]) {
                console.log(`Cliente ${clientRequest.costumerWAId} não existe!`)
            }
            console.log(`\nError: ${error.response.data}`);
        }
    }

    private addAdditionalsToFullAdditionalList(clientRequest: ClientReq): void {
        try {
            const fullAdditionalList = []
            const productClient = this.clientList[clientRequest.costumerWAId].productListClient
            const product = this.productList
            for (let prod of productClient) {
                for (let add of Object.values(product[prod.codeProd].AdditionalList)) {
                    fullAdditionalList.push(add)
                }
                fullAdditionalList.push({ "observation": "" })
            }
            this.clientList[clientRequest.costumerWAId].fullAdditionalList = fullAdditionalList
            console.log('addAdditionalsToFullAdditionalList, fullAdditionalList')
            console.table(this.clientList[clientRequest.costumerWAId].fullAdditionalList)
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em addAdditionalsToFullAdditionalList', error)
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
                                console.error("\x1b[31m%s\x1b[0m", 'error on PUT writeClientOrderToDB', error.response.data);
                            });
                    } catch (error) {
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição POST:');
                    }
                } else if (clientData === undefined) {
                    try {
                        await axios.post('http://lojas.vlks.com.br/api/BotProduct', data)
                            .then(response => {
                                console.log(response.data);
                                console.log(`Pedido de '${botClient.phoneNumberClient}' criado com sucesso!`)
                            })
                            .catch(error => {
                                console.error("\x1b[31m%s\x1b[0m", 'error on POST writeClientOrderToDB');
                            });
                    } catch (error) {
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição PUT:');
                    }
                }
            } else {
                console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do cliente.');
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
            console.error("\x1b[31m%s\x1b[0m", `Erro ao tentar ler dados de '${phoneNumberClient}'`, error.response.status, error.response.statusText);
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
            console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar o modificador do produto '${codigoProduto}'\n`, error.response.status, error.response.statusText);
            return null;
        }
    }

    /**
     * 
     * @param message Param text['body'] must be at most 4096 characters long.
     * @param costumerWAId 
     * @param functionName 
     * @param message_id 
     * @returns 
     */
    private sendWATextMessage(message: string, costumerWAId: string, functionName: string = "", message_id: string = ''): Promise<void> {
        let messageList = [message]
        if (message.length > 4096) {
            messageList = this.treatLongMessage(message)
        }
        return new Promise<void>((resolve, reject) => {
            for (let msg of messageList) {
                let data = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": costumerWAId,
                    "type": "text",
                    "text": {
                        "preview_url": false,
                        "body": msg
                    }
                }
                if (message_id) {
                    data["context"] = {
                        "message_id": message_id
                    };
                    console.log(JSON.stringify(data, null, 2))
                }

                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `https://graph.facebook.com/v17.0/${this.botNumberID}/messages`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.FBTOKEN}`
                    },
                    data: JSON.stringify(data)
                };

                axios.request(config)
                    .then((response) => {
                        // console.log(JSON.stringify(response.data));
                        resolve();
                    })
                    .catch((error) => {
                        console.error("\x1b[31m%s\x1b[0m", `Erro ao enviar mensagem em '${functionName}'\n${error.message}`);
                        reject(error);
                    });
            }
        });
    }

    private treatLongMessage(message: string): string[] {
        const maxIndex = 4096
        let NLindex = 0
        let messageList: string[] = []
        const times = message.length / maxIndex
        for (let j = 0; j < times; j++) {
            for (let i = maxIndex; i > 0; i--) {
                if (message[i] === '\n') {
                    NLindex = i
                    break
                }
            }
            messageList.push(message.slice(0, NLindex))
            message = message.slice(NLindex)
        }
        return messageList
    }

    private sendWAImageMessage(imageUrl: string) {
        let data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": "554791025923",
            "type": "image",
            "image": {
                "link": imageUrl
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
                console.log(error);
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
                    const addList: Record<string, BotAdditional> = {}
                    if (line.match(regexSabores)) {
                        ++i;
                        do {
                            line = lines[++i].trim();
                            const [, qtdSabor, codSabor] = line.match(regexQtdSabores)
                            addList[codSabor] = {
                                ProductCode: codigo,
                                AddCode: codSabor,
                                orderQtdAdd: qtdSabor
                            }
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

    private async mostRecommendProduct(clientRequest: ClientReq) {
        try {
            interface RecommendProduct {
                count: number;
                recCodeProd: string;
                codeProd: string;
            }

            const productListClient = this.clientList[clientRequest.costumerWAId].productListClient
            const productList = this.productList
            let recProducts: Record<string, RecommendProduct> = {}
            let mostRec: RecommendProduct

            for (let i = 0; i < productListClient.length; i++) {
                if (productList[productListClient[i].codeProd].recommendedProductCode) {
                    mostRec = {
                        count: 0,
                        recCodeProd: productList[productListClient[i].codeProd].recommendedProductCode,
                        codeProd: productList[productListClient[i].codeProd].codeProd
                    }
                    break
                }
            }
            if (mostRec) {
                for (let prod of productListClient) {
                    if (this.productList[prod.codeProd]?.recommendedProductCode) {
                        const currentCode = this.productList[prod.codeProd].recommendedProductCode
                        if (!recProducts[currentCode]) {
                            recProducts[currentCode] = {
                                count: 1,
                                recCodeProd: currentCode,
                                codeProd: prod.codeProd
                            }
                        } else {
                            recProducts[currentCode].count++
                        }
                        if (recProducts[currentCode].count > mostRec.count) {
                            mostRec = recProducts[currentCode]
                        }
                    }
                }
                console.log('Recommended Products')
                console.table(recProducts)
                console.log('Most Recommended Product')
                console.table(mostRec)
                this.clientList[clientRequest.costumerWAId].recomendedProduct = mostRec

                let message = `_*${clientRequest.costumerName}!*_ Sabe o que vai super bem com _*${this.productList[mostRec.codeProd].nameProd}*_?\n\n`
                message += `_*${this.productList[mostRec.recCodeProd].nameProd}*_ !!!🤩\n\n`
                message += `Por apenas R$ _*${(this.productList[mostRec.recCodeProd].priceProd).toFixed(2).replace('.', ',')}*_\n`
                message += `*Aproveite!!!*\n\n`
                message += `_*${this.clientList[clientRequest.costumerWAId].fullAdditionalList.length + 1}*_ • Quero incluir _*${this.productList[mostRec.recCodeProd].nameProd}*_ com certeza! 😋`
                await this.sendWATextMessage(message, clientRequest.costumerWAId, 'mostRecommendProduct')
                await this.sendWAImageMessage(this.productList[mostRec.recCodeProd].imageProdUrl)
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em mostRecommendProduct', error)
        }
    }

    private largestPrepTime(clientRequest: ClientReq) {
        const productList = this.clientList[clientRequest.costumerWAId].productListClient
        let largestPrepTime = 0
        for (let product of Object.values(productList)) {
            if (product.preparationTime > largestPrepTime)
                largestPrepTime = product.preparationTime
        }
        return largestPrepTime
    }

    private categoryEmoji(category: string): String {
        switch (category.toUpperCase()) {
            case 'VESTUARIO':
                return '👕'
            case 'BEBIDAS':
                return '🥤'
            case 'COMIDAS':
                return '🍽️'
            case 'OUTROS':
                return '📦'
            case 'SORVETERIA':
                return '🍦'
            case 'SERVICOS':
                return '👩‍💼'
            case 'CONSUMACAO':
                return '💳'
            case 'PIZZA':
                return '🍕'
            case 'HORTIFRUTI':
                return '🥦'
            case 'FICHAS':
                return '🎟️'
            case 'BATATA':
                return '🥔'
            case 'ACAI':
                return '🍨'

            default:
                return '🛍️'
        }
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
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'greatingsMessage')
    }

    private async askAdditional(clientRequest: ClientReq, orderListData: any = {}) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId]
            if (orderListData.products?.length) {
                BotClient.tableClient = orderListData.table
                BotClient.totalOrderPrice = orderListData.totalCost
                console.log(`Pedido de ${clientRequest.costumerName}:`)
                console.table(orderListData.products)
                this.addProductsToClientProductsList(clientRequest, orderListData.products)
                this.addAdditionalsToFullAdditionalList(clientRequest)
            }
            try {
                let i = 0
                let message = `Já anotei! 😊 \nEnvie *um número por vez* e o *adicional* será incluido ao seu pedido!\n`
                message += `Você também pode incluir uma *observação especial* para cada produto. ✨`
                const productListClient = Object.values(BotClient.productListClient)

                for (let j = 0; j < productListClient.length; j++) {
                    let numProd = 0
                    for (let k = 0; k <= j; k++)
                        if (productListClient[j].nameProd === productListClient[k].nameProd) ++numProd;
                    let emoji = this.categoryEmoji(productListClient[j].categoryProd)
                    message += `\n\n ${emoji} Adicionais ${numProd}º _*${productListClient[j].nameProd}*_:`;
                    for (let add of Object.values(this.productList[productListClient[j].codeProd].AdditionalList)) {
                        message += `\n _*${++i}*_ • ${add.nameAdd} - ${add.priceAdd.toFixed(2).replace('.', ',')}`
                    }
                    message += `\n_*${++i}*_ • Incluir observação.`;
                }
                message += `\n\n_*0*_ • *Concluir* e *revisar* pedido. 🛒✅`;

                if (!BotClient.chatHistory) {
                    this.clientList[clientRequest.costumerWAId].chatHistory = []
                }
                this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
                await this.sendWATextMessage(message, clientRequest.costumerWAId, 'askAdditional')
                if (!BotClient.recomendedProduct)
                    await this.mostRecommendProduct(clientRequest)
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro ao criar a mensagem em askAdditional', error)
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro askAdditional')
        }
    }

    private includeAdditional(clientRequest: ClientReq) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId]
            const additionalClient = BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]
            console.log('additionalClient')
            console.table(additionalClient)
            let prodIndex = 0
            for (let i = 0; i < BotClient.fullAdditionalList.length; i++) {
                if ("observation" in BotClient.fullAdditionalList[i]) ++prodIndex;
                if (i === parseInt(clientRequest.textMessage) - 1) break;
            }
            const productClient = BotClient.productListClient[prodIndex]
            console.log('productClient:\n', productClient)
            const product = this.productList[productClient.codeProd]
            const additional = product.AdditionalList[additionalClient.AddCode]
            console.log('additional:\n', additional)

            let message: string

            if (!product.qtdMaxAdditionals ||
                Object.values(productClient.AdditionalList).length < product.qtdMaxAdditionals ||
                Object.values(productClient.AdditionalList).length === product.AdditionalList.length) {
                if (Object.values(productClient.AdditionalList).some(add => add.AddCode === additional.AddCode)) {
                    message = `Opa, _*${additional.nameAdd}*_ já foi incluído.\n`
                } else {
                    message = `Ok, _*${additional.nameAdd}*_.`
                    productClient.AdditionalList[additional.AddCode] = ({ ...additional })
                    console.log('includeAdditional, productClient')
                    console.table(productClient)
                    if (additional.qtdMaxAdd) {
                        message += `\n\nQual a *quantidade* desejada?\nVocê pode adicionar até um máximo de ${additional.qtdMaxAdd}!`
                        this.clientList[clientRequest.costumerWAId].contextClient = 'qtd_adicionais'
                    } else {
                        message += `\nMais alguma coisa?`
                    }
                }

            }
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeAdditional')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em includeAdditional', error)
        }
    }

    private quantityAdditional(clientRequest: ClientReq) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId]
            BotClient.errorQtdAdd = BotClient.errorQtdAdd ? BotClient.errorQtdAdd : 1
            const additionalClient = BotClient.fullAdditionalList[parseInt(BotClient.chatHistory[BotClient.chatHistory.length - 1]) - 1 * BotClient.errorQtdAdd]
            const additional = this.productList[additionalClient.ProductCode].AdditionalList[additionalClient.AddCode]

            let message: string
            if (parseInt(clientRequest.textMessage) > additional.qtdMaxAdd) {
                message = `Não é possivel adicionar ${clientRequest.textMessage} ${additional.nameAdd}!\nEscolha uma quantidade de no *máximo* ${additional.qtdMaxAdd}.`
                BotClient.errorQtdAdd += 1
            } else {
                message = `Ok, então fica *${clientRequest.textMessage} ${additional.nameAdd}*, no total de +R$ ${(parseInt(clientRequest.textMessage) * additional.priceAdd).toFixed(2).replace('.', ',')}`
                message = `\n\nDigite o numero do adicional para continuar incluindo.`
                message = `\n\n*_0_* • Voltar para a lista de pedidos.`
            }

            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'quantityAdditional')

        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao quantityAdditional')
        }
    }

    private includeObservation(clientRequest: ClientReq) {
        try {
            let message = `Por favor, *descreva* a *observação* desejada.\n\nEx: Sem cebola, guardanapo extra`

            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)

            this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeObservation')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao includeObservation')
        }
    }

    private confirmObservation(clientRequest: ClientReq) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId]
            BotClient.chatHistory.push(clientRequest.textMessage)
            let prodIndex = 0
            for (let i = 0; i < BotClient.fullAdditionalList.length; i++) {
                if ("observation" in BotClient.fullAdditionalList[i]) ++prodIndex;
                if (i === parseInt(BotClient.chatHistory[BotClient.chatHistory.length - 2])) break;
            }

            const productClient = BotClient.productListClient[prodIndex]
            if (typeof productClient.observationClient === 'undefined') productClient.observationClient = '';
            productClient.observationClient = clientRequest.textMessage

            let message = `Certo, *observação anotada*!\n"${productClient.observationClient}"`
            message += `\n\nDeseja incluir mais algum adicional ou observação?\n\`\`\`Digite o numero do item\`\`\``

            console.log('observationClient', this.clientList[clientRequest.costumerWAId].productListClient[prodIndex].observationClient)

            this.sendWATextMessage(message, clientRequest.costumerWAId, 'confirmObservation')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao confirmObservation', error)
        }
    }

    private includeRecommendedProduct(clientRequest: ClientReq) {
        const BotClient = this.clientList[clientRequest.costumerWAId]
        const product = { ...this.productList[BotClient.recomendedProduct.recCodeProd] }
        product.AdditionalList = {}
        product.orderQtdProd = 1
        console.log('includeRecommendedProduct, recommendedProduct', this.productList[BotClient.recomendedProduct.recCodeProd])
        BotClient.productListClient.push(product)
        let message = `Incrível!!!`
        message += `\nQuantos _*${product.nameProd}*_ você gostaria de acrescentar a sua lista de pedidos?`
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeRecommendedProduct')
    }

    private quantityRecommendedProduct(clientRequest: ClientReq) {
        const BotClient = this.clientList[clientRequest.costumerWAId]
        const productClient = BotClient.productListClient[BotClient.productListClient.length - 1]
        let orderListData = {
            table: BotClient.tableClient,
            products: [{
                codeProd: productClient.codeProd,
                nameProd: productClient.nameProd,
                priceProd: productClient.priceProd,
                orderQtdProd: parseInt(clientRequest.textMessage),
                AdditionalList: {}
            }],
            totalCost: BotClient.totalOrderPrice
        }
        this.askAdditional(clientRequest, orderListData)
    }

    private noContextMessage(clientRequest: ClientReq) {
        try {
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

            this.sendWATextMessage(message, clientRequest.costumerWAId, 'noContextMessage')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao noContextMessage')
        }
    }

    private reviewOrder(clientRequest: ClientReq) {
        try {
            const productListClient = this.clientList[clientRequest.costumerWAId].productListClient
            let totalOrderPrice = this.clientList[clientRequest.costumerWAId].totalOrderPrice
            totalOrderPrice = 0
            let message = `Seu pedido:`
            for (let product of productListClient) {
                let orderQtdProd = product.orderQtdProd ? product.orderQtdProd : 1
                totalOrderPrice += orderQtdProd * product.priceProd
                message += `\n• ${orderQtdProd} ${product.nameProd} - R$ ${(orderQtdProd * product.priceProd).toFixed(2).replace('.', ',')}`
                for (let add of Object.values(product.AdditionalList)) {
                    let orderQtdAdd = add.orderQtdAdd ? add.orderQtdAdd : 1
                    totalOrderPrice += orderQtdAdd * add.priceAdd
                    message += `\n\t${orderQtdAdd} ${add.nameAdd} + R$ ${(orderQtdAdd * add.priceAdd).toFixed(2).replace('.', ',')}`
                }
                if (product.observationClient) message += `\n\tObservação: "${product.observationClient}"`
                message += `\n`
            }
            message += `\nTotal do pedido: ${totalOrderPrice.toFixed(2).replace('.', ',')}`
            message += `\n____________________________________`
            message += `\n\n_*1*_ • Editar pedido ✏️`
            message += `\n\n_*0*_ • Finalizar pedido ✅`

            this.sendWATextMessage(message, clientRequest.costumerWAId, 'reviewOrder')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao reviewOrder')
        }
    }

    private askProductForEdit(clientRequest: ClientReq) {
        try {
            const productClient = this.clientList[clientRequest.costumerWAId].productListClient
            let message = `Qual produto você deseja editar?`
            for (let i = 0; i < productClient.length; i++) {
                message += `\n\n_*${i + 1}*_ • ${productClient[i].nameProd}`
            }
            message += `\n\n_*0*_ • Deixa pra lá. Finalizar pedido 🛒`

            this.clientList[clientRequest.costumerWAId].editingOrder = true
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'askProductForEdit')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao editOrder')
        }
    }

    private editOrder(clientRequest: ClientReq) {
        const productClient = this.clientList[clientRequest.costumerWAId].productListClient[parseInt(clientRequest.textMessage) - 1]
        productClient.AdditionalList = {}
        productClient.observationClient = ''
        let message = `Certo! Deletei as inclusões de _*${productClient.nameProd}*_.\n\n`
        message += `Digite o numero para incluir novos adicionais da lista.\n\n`
        message += `\`\`\`Os *outros produtos* continuam com os adicionais escolhidos anteriormente\`\`\``
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'editOrder', this.clientList[clientRequest.costumerWAId].orderMessageId)
    }

    private checkClientRegistration(clientRequest: ClientReq) {
        try {
            const clientData = false
            // const clientData = this.readClientFromCupomDB()
            if (!clientData) {
                let message = `Verificiamos que você ainda não possui cadastro conosco!\n\n`
                message += `Para deixar seu atendimento mais rápido e prático, gostaria de cadastrar seus dados?\n É rapidinho! `
                message += `\n\n_*1*_ Sim, por favor!`
                message += `\n\n_*0*_ Não, obrigado!`

                this.sendWATextMessage(message, clientRequest.costumerWAId, 'checkClientRegistration')
            } else {
                this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido'
                this.sendToPreparation(clientRequest)
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao checkClientRegistration')
        }
    }

    private sendToPreparation(clientRequest: ClientReq): void {
        try {
            const prepTime = this.largestPrepTime(clientRequest)
            let message = `Ótimo!! seu pedido já esta sendo preparado! 🙌`
            if (this.showPrepTime) {
                message += `\nTempo de espera é de aproximadamente *${prepTime}* minutos 😉`
            }

            this.sendWATextMessage(message, clientRequest.costumerWAId, 'sendToPreparation')

            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
            console.log(`Pedido ${clientRequest.costumerName} :`)
            console.table(this.clientList[clientRequest.costumerWAId].productListClient)
            // fs.writeFileSync(`./clientObject/${clientRequest.costumerName}.json`, JSON.stringify(this.clientList[clientRequest.costumerWAId], null, 2))
            delete this.clientList[clientRequest.costumerWAId]

            console.log('Token:', this.getTokenTabletcloud())
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao sendToPreparation', error)
        }
    }
}