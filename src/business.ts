const axios = require("axios");
const fs = require('fs');
const qs = require('qs');

import * as uuid from 'uuid';
import { Request, Response } from 'express';
import ClientReq from './client';
import { BotAdditional, BotProduct, BotClient, RecommendProduct, BotArrayString } from './interfaces';

export default class Business {

    private BotBusinessID: number
    private codFilial: number
    private name: string
    private FBTOKEN: string
    private botNumberID: string
    private botNumber: string
    private botName: string
    private productList: Record<string, BotProduct>
    private clientList: Record<string, BotClient>
    private clientRequestList: Record<string, ClientReq>
    private orderCodeList: Set<string> = new Set<string>()
    private contexts: Record<string, (clientRequest: ClientReq) => void> = {};
    private secondsToTimeOut: number
    private showPrepTime: boolean
    private showPrice: boolean
    private menuLink: string

    /*CONFIGURATION*/

    constructor(botNumberID: string) {
        this.botNumberID = botNumberID
        this.initializeBusinessData()
    }

    private async initializeBusinessData() {
        try {
            const response = await axios.get(`http://lojas.vlks.com.br/api/BotBusiness/botNumberID=${this.botNumberID}`)

            if (response.status === 200) {

                const businessData = response.data

                this.BotBusinessID = businessData.ID ?
                    businessData.ID : (() => { throw new Error("Business ID deve ser inicializado!") })();

                this.name = businessData.nameBs ?
                    businessData.nameBs : (() => { throw new Error("Business name deve ser inicializado!") })();

                this.FBTOKEN = businessData.FBTOKEN ?
                    businessData.FBTOKEN : (() => { throw new Error("Business FBTOKEN deve ser inicializado!") })();

                this.codFilial = businessData.codFilial ?
                    businessData.codFilial : (() => { throw new Error("Business codFilial deve ser inicializado!") })();

                this.botNumber = businessData.botNumber ?
                    businessData.botNumber : (() => { throw new Error("Business botNumber deve ser inicializado!") })();

                this.botName = businessData.botName ?
                    businessData.botName : (() => { console.warn("\x1b[33m%s\x1b[0m", "AVISO! Bot name não inicializado. Usando 'o Chat Bot'."); return 'o Assistente Virtual' })();

                this.clientList = businessData.clientListBs ?
                    businessData.clientListBs : (() => { console.warn("\x1b[33m%s\x1b[0m", 'clientList vazia. Usando {}.'); return {} })();

                this.showPrepTime = businessData.showPrepTime ?
                    businessData.showPrepTime : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! showPrepTime não inicializado. Usando true.'); return true })();

                this.showPrice = businessData.showPrice ?
                    businessData.showPrice : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! showPrice não inicializado. Usando true.'); return true })();

                this.secondsToTimeOut = businessData.secondsToTimeOut ?
                    businessData.secondsToTimeOut : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! secondsToTimeOut não inicializado. Usando 30.'); return 50 })();

                this.productList = Array.isArray(businessData.productListBs) && businessData.productListBs.length ?
                    await this.rebuildProductListToBotProductList(businessData.productListBs) : await this.initializeProducts()

                this.clientRequestList = {}

                this.initializeIntents()

                console.log('name: ', this.name,
                    '\nFBTOKEN: ', this.FBTOKEN,
                    '\nbotNumberID: ', this.botNumberID,
                    '\nbotNumber: ', this.botNumber,
                    '\nclientList: ', this.clientList,
                    '\nshowPrepTime: ', this.showPrepTime,
                    '\nsecondsToTimeOut: ', this.secondsToTimeOut)

                if (Object.values(this.productList).length) {

                    console.log('productList: ')
                    console.table(this.productList)
                    console.info(`Dados '${this.name}' carregados do banco (${Object.keys(this.productList).length} produtos)`)
                    console.info(`Aguardando clientes...`)

                } else {

                    console.error("\x1b[31m%s\x1b[0m", 'Não foi possivel carregar os produtos do banco.')
                    console.error("\x1b[33m%s\x1b[0m", 'Por favor, reinicie o servidor!')

                }

            } else {
                console.error("\x1b[31m%s\x1b[0m", `BotBusiness response status: ${response.status}  ${response.statusText}`)
            }

        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", `Erro GET dados BotBusiness.\n${error}`)
        }
    }

    private async initializeProducts(): Promise<Record<string, BotProduct>> {
        try {
            const url = `http://lojas.vlks.com.br/api/BotProducts/Listbot/${this.botNumberID}`;
            const response = await axios.get(url);

            if (response.status === 200) {
                const productMap: Record<string, BotProduct> = {};

                try {
                    this.rebuildProductListToBotProductList(response.data)

                    return productMap;
                } catch (error) {
                    console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar produtos: ${error}`);
                    if (!response) console.error('response.data: ', response.data)
                }
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
                const orderListData = this.extractProductOrdersFromMessage(clientRequest.textMessage ? clientRequest.textMessage : '')
                if (orderListData.products?.length) {       // Mostrar lista de adicionais
                    this.clientList[clientRequest.costumerWAId].orderMessageId = 'save'
                    this.askAdditional(clientRequest, orderListData)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
                } else {        // Enviar mensagem de boas-vindas com link
                    this.greatingsMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em nenhum', error)
            }
        });

        this.addContext('escolher_adicionais', (clientRequest: ClientReq) => {
            try {
                const BotClient = this.clientList[clientRequest.costumerWAId]
                if (clientRequest.textMessage === '0' || clientRequest.textMessage.toLowerCase() === 'nao' || clientRequest.textMessage.toLowerCase() === 'não') {    // 0 - Revisar e finalizar pedido
                    if (!this.mustIncludeAdditional(clientRequest)) {
                        if (!BotClient.recommendedProduct) {
                            this.mostRecommendProduct(clientRequest)
                            this.clientList[clientRequest.costumerWAId].contextClient = 'produto_recomendado'
                        } else {
                            this.reviewOrder(clientRequest)
                            this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido'
                        }
                    }
                } else if (BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]?.codeAdd) {    // # - Incluir adicional
                    this.includeAdditional(clientRequest)
                } else if (BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]?.observation === '') { // # - Incluir observação 
                    this.includeObservation(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'observacao'
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em escolher_adicionais', error)
            }
        });

        this.addContext('observacao', (clientRequest: ClientReq) => {
            try {
                this.confirmObservation(clientRequest)  // Texto : observação
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em observacao', error)
            }
        });

        this.addContext('qtd_adicionais', (clientRequest: ClientReq) => {
            try {
                this.quantityAdditional(clientRequest)      // Quantidade de adicionais
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em qtd_adicionais', error)
            }
        });

        this.addContext('produto_recomendado', (clientRequest: ClientReq) => {
            try {
                console.log(clientRequest.idButton)
                if (clientRequest.idButton === '1') {    // 1 - Não quero incluir
                    this.reviewOrder(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido'
                } else if (clientRequest.idButton === '0') { // 0 - Quero incluir 
                    this.includeRecommendedProduct(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'quantidade_recomendado'
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em produto_recomendado', error)
            }
        });

        this.addContext('quantidade_recomendado', (clientRequest: ClientReq) => {
            try {
                this.quantityRecommendedProduct(clientRequest)
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em quantidade_recomendado', error)
            }
        });

        this.addContext('revisar_pedido', (clientRequest: ClientReq) => {   // GRANDE FILTRO
            try {
                const botClient = this.clientList[clientRequest.costumerWAId]
                if (clientRequest.idButton === '1') {    // 1 - Finalizar pedido
                    if (botClient.tableClient) {
                        this.sendToPreparation(clientRequest)
                        botClient.contextClient = 'aguardar_pedido'
                    } else if (!botClient.tableClient) {
                        this.checkClientRegistration(clientRequest) // dados_nome, confirmar_dados
                    }
                } else if (clientRequest.idButton === '0') {     // 0 - Editar pedido
                    this.askProductForEdit(clientRequest)
                    botClient.contextClient = 'editar_pedido'
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em revisar_pedido', error)
            }
        });

        this.addContext('editar_pedido', (clientRequest: ClientReq) => {
            try {
                if (clientRequest.textMessage === '0') {    // 0 • Deixa pra lá. Finalizar pedido
                    this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido'
                    this.handleContext(clientRequest)
                } else if (parseInt(clientRequest.textMessage) <= this.clientList[clientRequest.costumerWAId].ProductListClient.length) {
                    this.editOrder(clientRequest)       // Editando produto
                    this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais'
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em editar_pedido', error)
            }
        });

        this.addContext('confirmar_dados', (clientRequest: ClientReq) => {
            try {
                if (clientRequest.idButton === '1') {   // 1 - Cadastrar novos dados
                    this.askClientName(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'dados_nome'
                } else if (clientRequest.idButton === '0') {    //  0 - Usar dados cadastrados
                    this.sendToPreparation(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido'
                    this.quickResaleProduct(clientRequest)
                } else {
                    this.noContextMessage(clientRequest)
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_nome', error)
            }
        });

        this.addContext('dados_nome', (clientRequest: ClientReq) => {
            try {
                if (true) {
                    this.clientList[clientRequest.costumerWAId].nameClient = clientRequest.textMessage
                    this.askClientAddress(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'dados_endereco'
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_nome', error)
            }
        });

        this.addContext('dados_endereco', (clientRequest: ClientReq) => {
            try {
                if (true) {
                    this.clientList[clientRequest.costumerWAId].addressClient = clientRequest.textMessage
                    this.askClientCPF(clientRequest)
                    this.clientList[clientRequest.costumerWAId].contextClient = 'dados_cpf'
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_endereco', error)
            }

        });

        this.addContext('dados_cpf', (clientRequest: ClientReq) => {
            try {
                if (true) {
                    if (this.validateCPF_CNPJ(clientRequest)) {
                        this.sendToPreparation(clientRequest)
                        this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido'
                    }
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_cpf', error)
            }

        });

        this.addContext('aguardar_pedido', (clientRequest: ClientReq) => {
            try {
                if (true) {
                    if (this.validateCPF_CNPJ(clientRequest)) {
                        this.sendToPreparation(clientRequest)
                        this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido'
                    }
                }
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_cpf', error)
            }

        });
    }

    public async postRequest(req: Request, res: Response) {
        try {
            let wa_id: string
            if ('contacts' in req.body.entry[0].changes[0].value) {
                wa_id = req.body.entry[0].changes[0].value.contacts[0].wa_id
            } else if ('statuses' in req.body.entry[0].changes[0].value) {
                wa_id = req.body.entry[0].changes[0].value.statuses[0].recipient_id
            }

            this.clientRequestList[wa_id] = new ClientReq(req, res)
            if (this.clientRequestList[wa_id].messagesObject) {

                const currentTimestamp = Math.floor(Date.now() / 1000)
                if (currentTimestamp - parseInt(this.clientRequestList[wa_id].timestampCostumer) < this.secondsToTimeOut) {

                    if (!this.clientList[wa_id]) {
                        await this.writeClientToBusinessClientListDB(this.createClient(this.clientRequestList[wa_id].costumerName, wa_id))
                    }

                    if (this.clientList[wa_id].timeoutID) {
                        clearTimeout(this.clientList[wa_id].timeoutID)
                    }
                    const clientRequest = this.clientRequestList[wa_id]
                    this.clientList[wa_id].timeoutID = setTimeout(() => {
                        this.endClientSession(clientRequest)
                    }, 300 * 1000);

                    if (this.clientRequestList[wa_id].typeMessage === "text" || this.clientRequestList[wa_id].typeMessage === "interactive") {
                        this.handleContext(this.clientRequestList[wa_id])
                    }
                }

            } else if (this.clientRequestList[wa_id].statusesObject) {

                try {

                    if (this.clientList[wa_id]) {
                        if (this.clientRequestList[wa_id].messageStatus === "delivered") {
                            if (this.clientList[wa_id].orderMessageId === 'save')
                                this.clientList[wa_id].orderMessageId = this.clientRequestList[wa_id].sentMessageId
                            console.error(this.clientRequestList[wa_id].messageStatus)
                        }
                    }

                } catch (error) {

                    if (!this.clientList) {
                        console.error(`Business não iniciado, aguarde!`)
                    } else if (!this.clientList[wa_id]) {
                        console.error(`Cliente ${wa_id} nao existe`, error.TypeError)
                    }
                    res.sendStatus(500);

                }

            }
            res.sendStatus(200);

        } catch (error) {

            if (!this.clientList) {
                console.error(`Business não iniciado, aguarde!`)
            }
            res.sendStatus(500);

        }

    }

    private addContext(name: string, handlerFunction: (clientRequest: ClientReq) => void) {

        this.contexts[name] = handlerFunction;
    }

    private handleContext(clientRequest: ClientReq): void {

        const contextClient = this.clientList[clientRequest.costumerWAId] ? this.clientList[clientRequest.costumerWAId].contextClient : 'nenhum'
        if (this.contexts[contextClient] && typeof this.contexts[contextClient] === 'function') {
            this.contexts[contextClient](clientRequest)
            console.log(`client '${clientRequest.costumerWAId}' context: ${contextClient}`)
        } else {
            console.error("\x1b[31m%s\x1b[0m", `Contexto ${contextClient} não encontrado`)
        }
    }

    private rebuildProductListToBotProductList(products): Record<string, BotProduct> {
        const productList: Record<string, BotProduct> = {}
        try {
            products.map((product) => {

                const AdditionalList: Record<string, BotAdditional> = {}
                if (Array.isArray(product.AdditionalList) && product.AdditionalList.length) {

                    product.AdditionalList.map((additional) => {
                        AdditionalList[additional.AddCode] = {
                            ID: additional.ID,
                            ProductCode: additional.ProductCode,
                            codeAdd: additional.AddCode,
                            nameAdd: additional.nameAdd,
                            priceAdd: additional.priceAdd,
                            categoryAdd: additional.categoryAdd,
                            enabledAdd: additional.enabledAdd,
                            qtdMinAdd: additional.qtdMinAdd,
                            qtdMaxAdd: additional.qtdMaxAdd,
                            orderQtdAdd: additional.orderQtdAdd
                        }
                    });

                } else {
                    product.AdditionalList = {}
                }
                const botProduct: BotProduct = {
                    botNumberID: this.botNumberID,
                    codeProd: product.codeProd,
                    nameProd: product.nameProd,
                    priceProd: product.priceProd,
                    categoryProd: product.categoryProd,
                    qtdStockProd: product.qtdStockProd,
                    descriptionProd: product.descriptionProd,
                    preparationTime: product.preparationTime ? product.preparationTime : 10,
                    qtdMaxAdditionals: product.qtdMaxAdditionals,
                    qtdMinAdditionals: product.qtdMinAdditionals,
                    recommendedProductCode: product.recommendedProductCode ? product.recommendedProductCode : '845031', //products[Math.floor(Math.random() * products.length)].codeProd,
                    imageUrlProd: 'https://docs.lacartadigital.com.br/produtos/dc642675-30b1-440b-9600-cd7e2c3991a6_resize.jpg',// product.imagem
                    AdditionalList: AdditionalList,
                };
                productList[product.codeProd] = botProduct
            });
            return productList
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", `Erro em rebuildProductListToBotProductList ao reconstruir produtos:\n${error}`);
        }
    }

    private createClient(name: string,
        phoneNumberClient: string,
        addressClient: string = "",
        chatHistory: string[] = [],
        contextClient: string = 'nenhum',
        tableClient: number = 0,
        BotProductList: BotProduct[] = [],
        orderMessageId: string = '',
        editingOrder: boolean = false,
        totalOrderPrice: number = 0): BotClient {
        const client: BotClient = {
            ID: undefined,
            nameClient: name,
            orderCodeClient: this.uuidOrderCodeGenerator(),
            phoneNumberClient: phoneNumberClient,
            tableClient: tableClient,
            addressClient: addressClient,
            chatHistory: chatHistory,
            contextClient: contextClient,
            orderMessageId: orderMessageId,
            editingOrder: editingOrder,
            totalOrderPrice: totalOrderPrice,
            ProductListClient: BotProductList
        }
        return client
    }

    /*DATA BASE*/

    private async writeBusinessDB(): Promise<any> {
        return new Promise(async (resolve, reject) => {

            this.productList ? null : console.warn(`${this.botNumberID} created with empty products list`);
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
                                resolve(response);
                            })
                            .catch(error => {
                                console.error("\x1b[31m%s\x1b[0m", 'error in PUT');
                                reject(error);
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
                                resolve(response);
                            })
                            .catch(error => {
                                console.error("\x1b[31m%s\x1b[0m", 'error in POST');
                                reject(error);
                            });
                        console.log(`Business '${this.botNumberID}' criado com sucesso!`)
                    } catch (error) {
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição PUT:');
                    }
                }
            } else {
                console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do negocio.');
            }
        });
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

    private async deleteBusinessDB(botNumberID: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let config = {

                method: 'delete',
                maxBodyLength: Infinity,
                url: 'http://lojas.vlks.com.br/api/BotBusiness',
                headers: {}
            };

            axios.request(config)
                .then((response) => {
                    console.log(JSON.stringify(response.data));
                    resolve(response)
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    }

    private async writeClientToBusinessClientListDB(botClient: BotClient): Promise<any> {
        return new Promise(async (resolve, reject) => {

            try {
                this.clientList[botClient.phoneNumberClient] = botClient;
                console.log('writeClientToBusinessClientListDB\n  totalOrderPrice', botClient.totalOrderPrice)

                const data = {
                    ID: botClient.ID ? botClient.ID : undefined,
                    orderCodeClient: botClient.orderCodeClient ? botClient.orderCodeClient : (() => { console.warn('orderCodeClient inválido. Use createClient()'); return null })(),
                    phoneNumberClient: botClient.phoneNumberClient ? botClient.phoneNumberClient : (() => { console.warn('phoneNumberClient inválido. Use createClient()'); return null })(),
                    nameClient: botClient.nameClient !== undefined ? botClient.nameClient : (() => { console.warn('nameClient inválido. Use createClient()'); return null })(),
                    contextClient: botClient.contextClient !== undefined ? botClient.contextClient : (() => { console.warn('contextClient inválido. Use createClient()'); return null })(),
                    addressClient: botClient.addressClient !== undefined ? botClient.addressClient : (() => { console.warn('addressClient inválido. Use createClient()'); return null })(),
                    tableClient: botClient.tableClient !== undefined ? botClient.tableClient : (() => { console.warn('tableClient inválido. Use createClient()'); return 0 })(),
                    orderMessageId: botClient.orderMessageId !== undefined ? botClient.orderMessageId : (() => { console.warn('orderMessageId inválido. Use createClient()'); return null })(),
                    totalOrderPrice: botClient.totalOrderPrice !== undefined ? botClient.totalOrderPrice : (() => { console.warn('totalOrderPrice inválido. Use createClient()'); return 0 })(),
                    editingOrder: botClient.editingOrder !== undefined ? botClient.editingOrder : (() => { console.warn('editingOrder inválido. Use createClient()'); return null })(),
                    ProductListClient: botClient.ProductListClient !== undefined ? botClient.ProductListClient : (() => { console.warn('productListClient inválido. Use createClient()'); return {} })(),
                    chatHistory: botClient.chatHistory !== undefined ? botClient.chatHistory : (() => { console.warn('chatHistory inválido. Use createClient()'); return null })(),
                    botNumberID: this.botNumberID,
                    BotBusinessID: this.BotBusinessID
                };

                if (botClient.ID) {
                    await axios.put(`http://lojas.vlks.com.br/api/BotClient/${botClient.ID}`, data)
                        .then(response => {
                            console.log(`Dados Client '${botClient.phoneNumberClient}' alterados no banco`)
                            resolve(response);
                        })
                        .catch(error => {
                            console.error("\x1b[31m%s\x1b[0m", `Erro PUT ao save cliente '${botClient.phoneNumberClient}' no banco\n${error}`);
                            reject(error);
                        });
                } else if (botClient.ID === undefined) {
                    await axios.post('http://lojas.vlks.com.br/api/BotClient', data)
                        .then(response => {
                            botClient.ID = response.data.ID
                            console.log(`Dados Client '${botClient.phoneNumberClient} - ${botClient.ID}' criados no banco`)
                            resolve(response);
                        })
                        .catch(error => {
                            console.error("\x1b[31m%s\x1b[0m", `Erro POST ao save cliente '${botClient.phoneNumberClient}' no banco\n${error}`);
                            reject(error);
                        });
                }
            } catch (error) {
                console.error(`Não foi possivel adionar o cliente [${botClient.phoneNumberClient}] a clientList.\nError: ${error.response.data}`);
                reject(error);
            }
        });
    }

    private async readClientFromBusinessDB(arg: { phoneNumberClient?: string; clientID?: number; } = {}): Promise<BotClient | undefined> {

        return new Promise(async (resolve, reject) => {
            try {
                const url = arg.phoneNumberClient
                    ? `http://lojas.vlks.com.br/api/BotClient/${arg.phoneNumberClient}/${this.botNumberID}`
                    : arg.clientID ? `http://lojas.vlks.com.br/api/BotClient/${arg.clientID}`
                        : `http://lojas.vlks.com.br/api/BotClient/${this.botNumberID}`;

                const response = await axios.get(url);
                console.log(response)
                console.log('response', response)
                resolve(response.data.length === 0 ? undefined : response.data);
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro GET BotClient '${arg.phoneNumberClient}'`, error.response.status, error.response.statusText);
                reject(error);
            }
        });
    }

    private async deleteClientFromBusinessDB(clientRequest: ClientReq): Promise<any> {

        return new Promise((resolve, reject) => {

            const botClient = this.clientList[clientRequest.costumerWAId]

            const axios = require('axios');

            let config = {
                method: 'delete',
                maxBodyLength: Infinity,
                url: `http://lojas.vlks.com.br/api/BotClient/${botClient.ID}`,
                headers: {}
            };

            axios.request(config)
                .then((response) => {
                    console.log(`Cliente ${botClient.phoneNumberClient} deletado do banco`);
                    resolve(response);
                })
                .catch((error) => {
                    console.error("\x1b[31m%s\x1b[0m", `Erro GET BotClient '${botClient.phoneNumberClient}'`, error.response.status, error.response.statusText);
                    reject(error);
                });
        });

    }

    private async writeClientOrderDB(clientRequest: ClientReq): Promise<any> {

        await this.deleteClientFromBusinessDB(clientRequest)

        const botClient = this.clientList[clientRequest.costumerWAId]

        const productListClient = []
        botClient.ProductListClient.forEach((product) => {
            const additionalList = []
            Object.values(product.AdditionalList).forEach((additional) => {
                additionalList.push({
                    ProductCode: additional.ProductCode ? additional.ProductCode : 0,
                    AddCode: additional.codeAdd ? additional.codeAdd : 0,
                    nameAdd: additional.nameAdd ? additional.nameAdd : '',
                    priceAdd: additional.priceAdd ? additional.priceAdd : 0,
                    categoryAdd: additional.categoryAdd ? additional.categoryAdd : '',
                    enabledAdd: additional.enabledAdd ? additional.enabledAdd : '',
                    qtdMinAdd: additional.qtdMinAdd ? additional.qtdMinAdd : 0,
                    qtdMaxAdd: additional.qtdMaxAdd ? additional.qtdMaxAdd : 0,
                    selectedAdd: additional.selectedAdd ? additional.selectedAdd : false,
                    orderQtdAdd: additional.orderQtdAdd ? additional.orderQtdAdd : 0
                })
            });

            productListClient.push({
                botNumberID: this.botNumberID,
                codeProd: product.codeProd ? product.codeProd : 0,
                nameProd: product.nameProd ? product.nameProd : '',
                priceProd: product.priceProd ? product.priceProd : 0,
                categoryProd: product.categoryProd ? product.categoryProd : '',
                orderQtdProd: product.orderQtdProd ? product.orderQtdProd : 0,
                qtdStockProd: product.qtdStockProd ? product.qtdStockProd : 0,
                descriptionProd: product.descriptionProd ? product.descriptionProd : '',
                observationClient: product.observationClient ? product.observationClient : '',
                preparationTime: product.preparationTime ? product.preparationTime : 0,
                qtdMaxAdditionals: product.qtdMaxAdditionals ? product.qtdMaxAdditionals : 0,
                qtdMinAdditionals: product.qtdMinAdditionals ? product.qtdMinAdditionals : 0,
                AdditionalList: additionalList,
                BotBusinessID: this.BotBusinessID
            })
        });

        const chatHistory = []
        botClient.chatHistory.forEach((text) => {
            chatHistory.push({
                texto: text ? JSON.stringify(text) : '',
                botNumberID: this.botNumberID,
                BotBusinessID: this.BotBusinessID
            })
        });

        const data = {
            botNumberID: this.botNumberID ? this.botNumberID : (() => { throw new Error(`botNumberID inválido! [${this.botNumberID}]`) })(),
            orderCodeClient: botClient.orderCodeClient ? botClient.orderCodeClient : (() => { throw new Error(`botNumberID inválido! [${this.botNumberID}]`) })(),
            phoneNumberClient: botClient.phoneNumberClient ? botClient.phoneNumberClient : (() => { throw new Error(`phoneNumberClient inválido! [${botClient.phoneNumberClient}]`) })(),
            nameClient: botClient.nameClient ? botClient.nameClient : (() => { throw new Error(`nameClient inválido! [${botClient.nameClient}]`) })(),
            cpfClient: botClient.cpf_cnpjClient ? botClient.cpf_cnpjClient : '',
            contextClient: botClient.contextClient ? botClient.contextClient : '',
            addressClient: botClient.addressClient ? botClient.addressClient : '',
            currentProductIndex: botClient.currentProductIndex ? botClient.currentProductIndex : 0,
            tableClient: botClient.tableClient ? botClient.tableClient : 0,
            orderMessageId: botClient.orderMessageId ? botClient.orderMessageId : '',
            totalOrderPrice: botClient.totalOrderPrice ? botClient.totalOrderPrice : 0,
            editingOrder: botClient.editingOrder ? botClient.editingOrder : false,
            ProductListClient: productListClient,
            chatHistory: chatHistory,
            BotBusinessID: this.BotBusinessID
        }

        console.log('----------------------------------------\nDATA = ', JSON.stringify(data, null, 2))

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `http://lojas.vlks.com.br/api/BotClient/${botClient.ID}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        };

        await axios.request(config)
            .then((response) => {
                console.log('response', JSON.stringify(response.data))
                // this.writeBotArrayStringDB(clientRequest)
                // this.writeProductListClientDB(clientRequest)
            })
            .then((response) => {
                console.log(`Pedido Client '${clientRequest.costumerWAId}' salvo no banco`);
            })
            .catch((error) => {
                console.error("\x1b[31m%s\x1b[0m", `Erro PUT ao salvar cliente '${clientRequest.costumerWAId}' no banco\n${error}`);
            });
    }

    private async writeProductListClientDB(clientRequest: ClientReq): Promise<any> {

        return new Promise((resolve, reject) => {

            const botClient = this.clientList[clientRequest.costumerWAId]
            let productList = []
            for (let product of botClient.ProductListClient) {
                productList.push({
                    botNumberID: this.botNumberID,
                    IdClient: botClient.ID,
                    codeProd: product.codeProd,
                    nameProd: product.nameProd,
                    priceProd: product.priceProd,
                    categoryProd: product.categoryProd,
                    orderQtdProd: product.orderQtdProd,
                    qtdStockProd: product.qtdStockProd,
                    descriptionProd: product.descriptionProd,
                    observationClient: product.observationClient,
                    preparationTime: product.preparationTime,
                    qtdMaxAdditionals: product.qtdMaxAdditionals,
                    qtdMinAdditionals: product.qtdMinAdditionals,
                    previewAdditionals: false,
                    AdditionalList: [],//product.AdditionalList,
                    BotBusinessID: this.BotBusinessID
                })
            }

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'http://lojas.vlks.com.br/api/BotProducts',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(productList)
            };

            axios.request(config)
                .then(async (response) => {
                    for (let i = 0; i < response.data.length; i++) {
                        botClient.ProductListClient[i].ID = response.data[i].ID
                        console.log('AdditionalList', botClient.ProductListClient[i].AdditionalList)
                    }
                    console.log('response writeProductListClientDB', response.data)
                    console.log('ProductListClient writeProductListClientDB', botClient.ProductListClient)
                    await this.writeAdditionalListsClientDB(clientRequest)
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    private async writeAdditionalListsClientDB(clientRequest: ClientReq): Promise<void> {

        return new Promise((resolve, reject) => {

            try {
                const productListClient = this.clientList[clientRequest.costumerWAId].ProductListClient
                productListClient.forEach((product) => {
                    let additionalList = []
                    Object.values(product.AdditionalList).forEach((additional) => {
                        additionalList.push({
                            ProductCode: additional.ProductCode,
                            codeAdd: additional.codeAdd,
                            nameAdd: additional.nameAdd,
                            priceAdd: additional.priceAdd,
                            categoryAdd: additional.categoryAdd,
                            enabledAdd: additional.enabledAdd,
                            qtdMinAdd: additional.qtdMinAdd,
                            qtdMaxAdd: additional.qtdMaxAdd,
                            orderQtdAdd: additional.orderQtdAdd,
                            ProductsID: product.ID
                        })
                    });
                    let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'http://lojas.vlks.com.br/api/BotAdditional',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify(additionalList)
                    };

                    axios.request(config)
                        .then((response) => {
                            console.log('writeAdditionalListClientDB response', response)
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    private async writeBotArrayStringDB(clientRequest: ClientReq): Promise<any> {

        return new Promise((resolve, reject) => {

            const botClient = this.clientList[clientRequest.costumerWAId]

            let BotArrayString: BotArrayString[] = []
            for (let chat of botClient.chatHistory) {
                BotArrayString.push({
                    texto: chat,
                    botNumberID: this.botNumberID,
                    BotBusinessID: this.BotBusinessID,
                    BotClientID: botClient.ID
                })
            }

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'http://lojas.vlks.com.br/api/BotArrayString/',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(BotArrayString)
            };

            axios.request(config)
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    private async writeClientToCupomDB(botClient: BotClient): Promise<void> {
        try {
            let clientData = await this.readClientFromCupomDB(botClient.phoneNumberClient);
            const TCTOKEN = await this.getTokenTabletcloud()
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
                            'Authorization': `Bearer ${TCTOKEN}`
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
                            console.error(error);
                        });
                } else {
                    console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do cliente.');
                }
            }
        } catch (error) {
            console.error(`Não foi possivel adionar o cliente [${botClient.phoneNumberClient}] a clientList.\nError: ${error.response.data}`);
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
                    console.error(error);
                });
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", `Erro GET Token Tabletcloud`, error.response.status, error.response.statusText);
            return null;
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

    /*AUX*/

    private addProductsToClientProductsList(clientRequest: ClientReq, productList: BotProduct[]): void {
        try {

            const productClient = this.clientList[clientRequest.costumerWAId].ProductListClient;
            for (const prod of productList) {
                for (let qtd = 0; qtd < prod.orderQtdProd; qtd++) {
                    const productCopy = { ...this.productList[prod.codeProd] };
                    productCopy.AdditionalList = {}
                    productCopy.orderQtdProd = 1
                    productClient.push(productCopy)
                }
            }
            // console.log('addProductsToClientProductsList, ProductListClient')
            // console.table(this.clientList[clientRequest.costumerWAId].ProductListClient)
        } catch (error) {
            if (!this.clientList[clientRequest.costumerWAId]) {
                console.error(`Cliente ${clientRequest.costumerWAId} não existe!`)
            }
            console.error(`\nError: ${error.response.data}`);
        }
    }

    private addAdditionalsToFullAdditionalList(clientRequest: ClientReq): void {
        try {
            const fullAdditionalList = []
            const productListClient = this.clientList[clientRequest.costumerWAId].ProductListClient
            const product = this.productList
            for (let prod of productListClient) {
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

    private async sendSingleMessage(message: string, costumerWAId: string, functionName: string, arg: { message_id?: string, buttons?: Array<string> } = {}): Promise<void> {
        // Tornar essa função automatica e unificada
        return new Promise(async (resolve, reject) => {

            try {
                let data = {}

                if (arg.buttons) {
                    if (arg.buttons.length > 3) throw new Error("Max 3 buttons");
                    let buttons = []
                    for (let i = 0; i < arg.buttons.length; i++) {
                        if (arg.buttons[i] !== '') {
                            if (arg.buttons[i].length > 20) {
                                arg.buttons[i] = arg.buttons[i].slice(0, 20)
                            }
                            buttons.push({
                                type: 'reply',
                                reply: {
                                    id: i,
                                    title: arg.buttons[i]
                                }
                            });
                        }
                    }
                    data = {
                        "messaging_product": "whatsapp",
                        "recipient_type": "individual",
                        "to": costumerWAId,
                        "type": "interactive",
                        "interactive": {
                            "type": "button",
                            "body": {
                                "text": message
                            },
                            "action": {
                                "buttons": buttons
                            }
                        }
                    };
                } else {
                    data = {
                        "messaging_product": "whatsapp",
                        "recipient_type": "individual",
                        "to": costumerWAId,
                        "type": "text",
                        "text": {
                            "preview_url": false,
                            "body": message
                        }
                    }

                    if (arg.message_id) {
                        data["context"] = {
                            "message_id": arg.message_id
                        };
                    }
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
                        setTimeout(() => {
                            resolve(response);
                        }, 500);
                    })
                    .catch((error) => {
                        console.error("\x1b[31m%s\x1b[0m", `Erro ao enviar mensagem em '${functionName}'\n${error}`);
                        reject(error);
                    });

            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro em '${functionName}'\n${error}`);
            }
        });
    }

    private async sendWATextMessage(message: string, costumerWAId: string, functionName: string, arg: { message_id?: string, buttons?: Array<string> } = {}): Promise<void> {
        return new Promise(async (resolve, reject) => {

            try {

                let messageList = [message]
                if (message.length > 4096) {
                    messageList = this.splitLongMessage(message)
                }
                for (let i = 0; i < messageList.length; i++) {
                    if (arg && i === (messageList.length - 1)) {
                        await this.sendSingleMessage(messageList[i], costumerWAId, functionName, { message_id: arg.message_id, buttons: arg.buttons })
                    } else {
                        await this.sendSingleMessage(messageList[i], costumerWAId, functionName)
                    }
                }
                resolve();

            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro ao enviar mensagem em '${functionName}'\n${error.message}`);
                reject();
            }

        });
    }

    private splitLongMessage(message: string): string[] {
        message += '\n'
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

    private sendWAImageMessage(imageUrl: string, costumerWAId: string, functionName: string = "", message_id: string = ''): Promise<any> {
        return new Promise(async (resolve, reject) => {

            let data = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": costumerWAId,
                "type": "image",
                "image": {
                    "link": imageUrl
                }
            };

            if (message_id) {
                data["context"] = {
                    "message_id": message_id
                };
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
                    setTimeout((response) => {
                        resolve(response)
                    }, 500);
                })
                .catch((error) => {
                    console.error("\x1b[31m%s\x1b[0m", `Erro ao enviar imagem em '${functionName}'\n${error.message}`);
                    reject(error)
                });
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
                                codeAdd: codSabor,
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

    private largestPrepTime(clientRequest: ClientReq) {
        const productList = this.clientList[clientRequest.costumerWAId].ProductListClient
        let largestPrepTime = 0
        for (let product of Object.values(productList)) {
            if (product.preparationTime > largestPrepTime)
                largestPrepTime = product.preparationTime
        }
        return largestPrepTime
    }

    private quickResaleClientProducts(clientRequest: ClientReq): string[] {
        const botClient = this.clientList[clientRequest.costumerWAId]
        let quickResaleProducts = []
        for (let product of botClient.ProductListClient) {
            if (product.quickResale)
                quickResaleProducts.push(product.codeProd)
        }
        return quickResaleProducts
    }

    private mustIncludeAdditional(clientRequest: ClientReq): boolean {
        const productListClient = this.clientList[clientRequest.costumerWAId].ProductListClient
        let mustInclude: boolean = false
        let message: string = ''
        for (let prod of productListClient) {
            const diff = prod.qtdMinAdditionals - Object.values(prod.AdditionalList).length
            if (diff > 0) {
                message += `Opa! Você ainda não selecionou todos os adicionais para ${prod.nameProd}\n`
                message += `Faltam *${diff}*!`
                mustInclude = true
                this.sendWATextMessage(message, clientRequest.costumerWAId, 'mustIncludeAdditional')
            }
        }
        return mustInclude
    }

    private validateCNPJ(strCNPJ: string): boolean {
        const b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        if (/0{14}/.test(strCNPJ))
            return false;

        let n = 0;
        for (let i = 0; i < 12; i++) {
            n += Number(strCNPJ[i]) * b[i + 1];
        }

        if (strCNPJ[12] !== String((n % 11) < 2 ? 0 : 11 - (n % 11))) {
            return false;
        }

        n = 0;
        for (let i = 0; i <= 12; i++) {
            n += Number(strCNPJ[i]) * b[i];
        }

        if (strCNPJ[13] !== String((n % 11) < 2 ? 0 : 11 - (n % 11))) {
            return false;
        }

        return true;
    }

    private validateCPF(strCPF: string): boolean {
        let Soma;
        let Resto;
        Soma = 0;
        if (strCPF == "00000000000") return false;

        for (let i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
        Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11)) Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10))) return false;

        Soma = 0;
        for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11)) Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11))) return false;
        return true;
    }

    private categoryEmoji(category: string): String {
        switch (category.toUpperCase()) {
            case 'VESTUARIO':
                return '👕'
            case 'BEBIDAS':
                return '🥤'
            case 'COMIDAS':
                return '🍔' //'🍽️'
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
            case 'LANCHES':
                return '🍔'

            default:
                return '🛍️'
        }
    }

    /*INTENTIONS*/

    /**
     * Envia mensagem de boas vindas
     * @param recipientId 
     * @param botNumberId 
     */
    private greatingsMessage(clientRequest: ClientReq) {
        try {

            let message = `Olá! 😄 Eu sou *${this.botName}*, assistente virtual da *${this.name}*!🤖\nEstou pronto para agilizar e facilitar o seu atendimento. 🚀`
            message += `\n\nUse os números para pedir e, pronto, o pedido está feito! 🌮 Simples assim! 🌟`
            message += `\n\nPara dar uma olhada no nosso *cardápio*, é só clicar no link! 🍔👀 \n\nhttp://printweb.vlks.com.br/Empresas/3264/Cardapio3/Index.html`

            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'greatingsMessage')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro ao criar a mensagem em greatingsMessage', error)
        }
    }

    private async askAdditional(clientRequest: ClientReq, orderListData: any = {}) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId]
            if (orderListData.products?.length) {
                BotClient.tableClient = orderListData.table
                BotClient.totalOrderPrice = orderListData.totalCost
                this.addProductsToClientProductsList(clientRequest, orderListData.products)
                this.addAdditionalsToFullAdditionalList(clientRequest)
                console.log(`Pedido de ${clientRequest.costumerName}:`)
                console.table(BotClient.ProductListClient)
            }
            try {
                let i = 0
                let message = `Envie *um número por vez* e o *adicional* será incluido ao seu pedido! 🤩\n`
                message += `Você também pode incluir uma *observação especial* para cada produto. ✨\n\n`
                const productListClient = Object.values(BotClient.ProductListClient)

                for (let j = 0; j < productListClient.length; j++) {
                    let numProd = 0
                    for (let k = 0; k <= j; k++)
                        if (productListClient[j].nameProd === productListClient[k].nameProd) ++numProd;
                    let emoji = this.categoryEmoji(productListClient[j].categoryProd)
                    if (productListClient[j].qtdMinAdditionals) {
                        message += `*Obrigatório incluir ${productListClient[j].qtdMinAdditionals}*\n`
                    }
                    message += `${emoji} *${numProd}º _${productListClient[j].nameProd}_* :\n`;
                    for (let add of Object.values(this.productList[productListClient[j].codeProd].AdditionalList)) {
                        message += ` _*${++i}*_ • ${add.nameAdd}${this.showPrice ? ` - ${add.priceAdd.toFixed(2).replace('.', ',')}` : ''}\n`
                    }
                    message += ` _*${++i}*_ • Incluir observação.\n\n`;
                }
                message += `_*0*_ • *Concluir* e *revisar* pedido. 🛒✅`;

                if (!BotClient.chatHistory) {
                    this.clientList[clientRequest.costumerWAId].chatHistory = []
                }
                this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
                this.sendWATextMessage(message, clientRequest.costumerWAId, 'askAdditional')
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
            let prodIndex = 0
            for (let i = 0; i < BotClient.fullAdditionalList.length; i++) {
                if ("observation" in BotClient.fullAdditionalList[i]) ++prodIndex;
                if (i === parseInt(clientRequest.textMessage) - 1) break;
            }
            const productClient = BotClient.ProductListClient[prodIndex]
            const product = this.productList[productClient.codeProd]
            const additional = product.AdditionalList[additionalClient.codeAdd]

            let message: string

            /**
             * Se o produto não possui quantidade maxima de adicionais ou
             * Se o cliente selecionou menos itens que a quantidade maxima ou
             * Se o cliente selecionou todos os adicionais possiveis
             */
            if (!product.qtdMaxAdditionals ||
                Object.values(productClient.AdditionalList).length < product.qtdMaxAdditionals ||
                Object.values(productClient.AdditionalList).length === product.AdditionalList.length) {
                if (Object.values(productClient.AdditionalList).some(add => add.codeAdd === additional.codeAdd)) {
                    message = `Opa, _*${additional.nameAdd}*_ já foi incluído.\n`
                } else {
                    message = `Ok, _*${additional.nameAdd}*_.`
                    productClient.AdditionalList[additional.codeAdd] = ({ ...additional })
                    if (additional.qtdMaxAdd) {
                        message += `\n\nQual a *quantidade* desejada?\nVocê pode adicionar até ${additional.qtdMaxAdd} ${additional.nameAdd}!`
                        this.clientList[clientRequest.costumerWAId].contextClient = 'qtd_adicionais'
                    } else {
                        message += `\nMais alguma coisa?\n`
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
            const additional = this.productList[additionalClient.ProductCode].AdditionalList[additionalClient.codeAdd]

            let message: string
            if (parseInt(clientRequest.textMessage) > additional.qtdMaxAdd) {
                message = `Não é possivel adicionar ${clientRequest.textMessage} ${additional.nameAdd}!\nEscolha uma quantidade de no *máximo* ${additional.qtdMaxAdd}.`
                BotClient.errorQtdAdd += 1
            } else {
                message = `Ok, então fica *${clientRequest.textMessage} ${additional.nameAdd}*${this.showPrice ? `, no total de +R$ ${(parseInt(clientRequest.textMessage) * additional.priceAdd).toFixed(2).replace('.', ',')}` : ''}`
                message = `\n\nDigite o numero do adicional para continuar incluindo.`
                message = `\n\n*_0_* • Voltar para a lista de pedidos.\n`
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
            let prodIndex = -1
            for (let i = 1; i <= parseInt(BotClient.chatHistory[BotClient.chatHistory.length - 2]); i++) {
                if ("observation" in BotClient.fullAdditionalList[i - 1]) console.log(++prodIndex);

            }

            const productClient = BotClient.ProductListClient[prodIndex]
            console.log('BotClient.ProductListClient', BotClient.ProductListClient)
            if (!productClient.observationClient) productClient.observationClient = '';
            productClient.observationClient = clientRequest.textMessage

            let message = `Certo, *observação anotada*!\n"${productClient.observationClient}"`
            message += `\n\nDeseja incluir mais algum adicional ou observação?\n\`\`\`Digite o numero do item\`\`\``

            console.log('observationClient: ', this.clientList[clientRequest.costumerWAId].ProductListClient[prodIndex].observationClient)

            this.sendWATextMessage(message, clientRequest.costumerWAId, 'confirmObservation')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao confirmObservation', error)
        }
    }

    private async mostRecommendProduct(clientRequest: ClientReq) {
        try {

            const productListClient = this.clientList[clientRequest.costumerWAId].ProductListClient
            const productList = this.productList
            let recProducts: Record<string, RecommendProduct> = {}
            let mostRec: RecommendProduct

            for (let i = 0; i < productListClient.length; i++) {
                if (productList[productListClient[i].codeProd].recommendedProductCode) {
                    mostRec = {
                        count: 0,
                        recCodeProd: productList[productListClient[i].codeProd].recommendedProductCode,
                        refCodeProd: productList[productListClient[i].codeProd].codeProd
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
                                refCodeProd: prod.codeProd
                            }
                        } else {
                            recProducts[currentCode].count++
                        }
                        if (recProducts[currentCode].count > mostRec.count) {
                            mostRec = recProducts[currentCode]
                        }
                    }
                }
                console.log('Most Recommended Product')
                console.table(mostRec)
                this.clientList[clientRequest.costumerWAId].recommendedProduct = mostRec

                let message = `_*${clientRequest.costumerName}!*_ Sabe o que vai super bem com _*${this.productList[mostRec.refCodeProd].nameProd}*_?\n\n`
                message += `_*${this.productList[mostRec.recCodeProd].nameProd}*_ !!!🤩\n\n`
                message += `${this.showPrice ? `Por apenas R$ _*${(this.productList[mostRec.recCodeProd].priceProd).toFixed(2).replace('.', ',')}*_\n` : ''}`
                message += `*Aproveite!!!*\n\n`
                const button1 = `Incluir ${this.productList[mostRec.recCodeProd].nameProd.length < 12 ? this.productList[mostRec.recCodeProd].nameProd : 'com certeza!'}`
                const button2 = `Não, obrigado!`
                this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
                if (this.productList[mostRec.recCodeProd].imageUrlProd) {
                    await this.sendWAImageMessage(this.productList[mostRec.recCodeProd].imageUrlProd, clientRequest.costumerWAId, 'mostRecommendProduct')
                }
                this.sendWATextMessage(message, clientRequest.costumerWAId, 'mostRecommendProduct', { buttons: [button1, button2] })
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em mostRecommendProduct', error)
        }
    }

    private includeRecommendedProduct(clientRequest: ClientReq) {

        try {
            const botClient = this.clientList[clientRequest.costumerWAId]
            const product = this.productList[botClient.recommendedProduct.recCodeProd]
            clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.idButton)

            let message = `Incrível!!!`
            message += `\nQuantos _*${product.nameProd}*_ você gostaria de acrescentar a sua lista de pedidos?`
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeRecommendedProduct')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em includeRecommendedProduct', error)
        }

    }

    private async quantityRecommendedProduct(clientRequest: ClientReq) {

        try {
            const BotClient = this.clientList[clientRequest.costumerWAId]
            const product = { ...this.productList[BotClient.recommendedProduct.recCodeProd] }
            product.orderQtdProd = parseInt(clientRequest.textMessage)
            product.AdditionalList = {}
            // BotClient.totalOrderPrice += parseInt(clientRequest.textMessage) * product.priceProd
            let message = `Certo, ${parseInt(clientRequest.textMessage)} ${product.nameProd} incluídos!`
            await this.sendWATextMessage(message, clientRequest.costumerWAId, 'quantityRecommendedProduct')
            let orderListData = {
                table: BotClient.tableClient,
                products: [{
                    codeProd: product.codeProd,
                    nameProd: product.nameProd,
                    priceProd: product.priceProd,
                    orderQtdProd: parseInt(clientRequest.textMessage),
                    AdditionalList: {}
                }],
                totalCost: BotClient.totalOrderPrice
            }

            BotClient.chatHistory.push(clientRequest.textMessage)
            this.askAdditional(clientRequest, orderListData)
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em quantityRecommendedProduct', error)
        }

    }

    private noContextMessage(clientRequest: ClientReq) {
        try {
            let message = "Responda com o _numero_ correspondente do item que deseja _selecionar_.\n\nPor favor, envie _um_ valor _por mensagem_ e aguarde a resposta."
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'noContextMessage');
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao noContextMessage')
        }
    }

    private reviewOrder(clientRequest: ClientReq) {
        try {
            const botClient = this.clientList[clientRequest.costumerWAId]
            clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive)
            let totalOrderPrice = botClient.totalOrderPrice = 0
            let message = `Seu pedido:\n`
            for (let product of botClient.ProductListClient) {
                let orderQtdProd = product.orderQtdProd ? product.orderQtdProd : 1
                totalOrderPrice += orderQtdProd * product.priceProd
                message += `\n• *${orderQtdProd} ${product.nameProd}*${this.showPrice ? ` - R$ ${(orderQtdProd * product.priceProd).toFixed(2).replace('.', ',')}` : ''}`
                for (let add of Object.values(product.AdditionalList)) {
                    let orderQtdAdd = add.orderQtdAdd ? add.orderQtdAdd : 1
                    totalOrderPrice += orderQtdAdd * add.priceAdd
                    message += `\n\t${orderQtdAdd} ${add.nameAdd}${this.showPrice ? ` + R$ ${(orderQtdAdd * add.priceAdd).toFixed(2).replace('.', ',')}` : ''}`
                }
                if (product.observationClient) message += `\n\tObservação: "${product.observationClient}"`
                message += `\n`
            }
            message += `\`\`\`${this.showPrice ? `\nTotal do pedido: R$ ${totalOrderPrice.toFixed(2).replace('.', ',')}` : ''}\`\`\``
            const button1 = `Editar pedido ✏️`
            const button2 = `Finalizar pedido ✅`

            this.sendWATextMessage(message, clientRequest.costumerWAId, 'reviewOrder', { buttons: [button1, button2] })
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao reviewOrder')
        }
    }

    private askProductForEdit(clientRequest: ClientReq) {
        try {
            const botClient = this.clientList[clientRequest.costumerWAId]
            const productClient = botClient.ProductListClient
            clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive)
            let message = `Qual produto você deseja editar?`
            for (let i = 0; i < productClient.length; i++) {
                message += `\n\n_*${i + 1}*_ • ${productClient[i].nameProd}`
            }
            message += `\n\n_*0*_ • Deixa pra lá. Finalizar pedido 🛒`

            botClient.editingOrder = true
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'askProductForEdit')
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao editOrder')
        }
    }

    private editOrder(clientRequest: ClientReq) {
        const productClient = this.clientList[clientRequest.costumerWAId].ProductListClient[parseInt(clientRequest.textMessage) - 1]
        productClient.AdditionalList = {}
        productClient.observationClient = ''
        let message = `Certo! Deletei as inclusões de _*${productClient.nameProd}*_.\n\n`
        message += `Digite o numero para incluir novos adicionais da lista.\n\n`
        message += `\`\`\`Os outros produtos continuam com os adicionais escolhidos anteriormente\`\`\``

        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'editOrder', { message_id: this.clientList[clientRequest.costumerWAId].orderMessageId })
    }

    private async checkClientRegistration(clientRequest: ClientReq) {
        try {
            const botClient = this.clientList[clientRequest.costumerWAId]
            clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive)
            const clientDataList = await this.readClientFromBusinessDB({ phoneNumberClient: clientRequest.costumerWAId })
            let clientData

            for (let data of Object.values(clientDataList)) {
                if ('addressClient' in data && data.addressClient !== '') {
                    clientData = data
                }
            }
            console.log(clientData[Object.values(clientData).length - 1])

            if ('addressClient' in clientData /*&& 'cpfClient' in clientData && clientData.cpfClient.length */ && clientData.addressClient.length) {
                let message = `*${clientRequest.costumerName}*! Verificamos que você ja possui cadastro!\n`
                message += `Gostaria de usar os dados abaixo para seu pedido?\n\n`
                message += `\`\`\`Nome\`\`\`: ${clientData.nameClient}\n`
                message += `\`\`\`CPF\`\`\`: ${clientData.cpf_cnpjClient ? clientData.cpf_cnpjClient : 'NÃO INFORMADO'}\n`
                message += `\`\`\`Endereço\`\`\`: ${clientData.addressClient}\n`
                const button1 = `Sim usar estes dados`
                const button2 = `Não, cadastrar novos`

                this.sendWATextMessage(message, clientRequest.costumerWAId, 'checkClientRegistration', { buttons: [button1, button2] })
                botClient.contextClient = 'confirmar_dados'
            } else {
                this.askClientName(clientRequest)
                botClient.contextClient = 'dados_nome'
            }
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao checkClientRegistration', error)
        }
    }

    private askClientName(clientRequest: ClientReq): void {
        const botClient = this.clientList[clientRequest.costumerWAId]
        clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive)

        let message = `Por favor, *${clientRequest.costumerName}*, confirme seu nome.`

        this.sendWATextMessage(message, clientRequest.costumerWAId, 'askClientName')
    }

    private askClientAddress(clientRequest: ClientReq): void {
        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)

        let message = `Perfeito ${clientRequest.textMessage}!\n\n`
        message += `Agora informe seu endereço de entrega completo.\n`
        message += `Ex: Rua das Palmeiras, n 123, ap 123 bloco 4 - CEP 12345-000`

        this.sendWATextMessage(message, clientRequest.costumerWAId, 'askClientAddress')
    }

    private askClientCPF(clientRequest: ClientReq): void {
        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage)

        let message = `Ótimo!\n\n`
        message += `Gostaria de incluir seu CPF ou CNPJ na nota fiscal?\n\n`
        message += `• Informe seu CPF ou CNPJ\n\t_*OU*_\n• Digite _*0*_ para *não* incluir.`

        this.sendWATextMessage(message, clientRequest.costumerWAId, 'askClientCPF')
    }

    private validateCPF_CNPJ(clientRequest: ClientReq) {
        try {

            const digits = clientRequest.textMessage.replace(/[^\d]/g, '');
            let illegit = ''

            if (digits.length === 11) {
                illegit = this.validateCPF(digits) ? '' : 'CPF'
            } else if (digits.length === 14) {
                illegit = this.validateCNPJ(digits) ? '' : 'CNPJ'
            } else {
                illegit = 'CPF ou CNPJ'
            }
            if (illegit !== '') {
                let message = `Por favor, informe um ${illegit} válido!`
                this.sendWATextMessage(message, clientRequest.costumerWAId, 'validateCPF_CNPJ')
                return false
            }
            return true

        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro ao validar cpf/cnpj validateCPF_CNPJ', error)
        }
    }

    private async sendToPreparation(clientRequest: ClientReq): Promise<void> {
        try {
            const botClient = this.clientList[clientRequest.costumerWAId]
            clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive)
            botClient.contextClient = 'aguardar_pedido'
            const prepTime = this.largestPrepTime(clientRequest)
            let message = `Ótimo!! Seu pedido já esta sendo preparado! 🙌`
            if (this.showPrepTime) {
                message += `\nTempo de espera é de aproximadamente *${prepTime}* minutos 😉`
            }
            clearTimeout(botClient.timeoutID)
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'sendToPreparation');
            this.writeClientOrderDB(clientRequest)
                .then((response) => {
                    console.log(`Pedido ${clientRequest.costumerName} :`)
                    console.table(botClient.ProductListClient)
                    // delete this.clientList[clientRequest.costumerWAId]
                    // delete this.clientRequestList[clientRequest.costumerWAId]
                });
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao sendToPreparation', error)
        }
    }

    private async quickResaleProduct(clientRequest): Promise<void> {

        return new Promise((resolve, reject) => {

            try {
                if (this.clientList[clientRequest.costumerWAId].tableClient) {
                    const prepTime = this.largestPrepTime(clientRequest)
                    const quickResaleProductsCode = this.quickResaleClientProducts(clientRequest)
                    if (quickResaleProductsCode.length) {
                        setTimeout(() => {
                            const botClient = this.clientList[clientRequest.costumerWAId]
                            const productList = this.productList
                            let message = `${botClient.nameClient}, gostaria de ver o cardápio ou pedir novamente um dos itens abaixo?`
                            message = `\n\nÉ só clicar e já trazemos seu pedido`
                            let buttons = []
                            buttons.push('VER CARDÁPIO')
                            buttons.push(productList[quickResaleProductsCode[0]].nameProd)
                            if (quickResaleProductsCode[1]) buttons.push(productList[quickResaleProductsCode[1]].nameProd)
                            this.sendWATextMessage(message, clientRequest.costumerWAId, 'quickResaleProduct', { buttons: buttons })
                        }, Math.floor(prepTime * 0.8 * 60000));
                    }
                }
                resolve();
            } catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao quickResaleProduct', error)
                reject(error);
            }

        });
    }

    private endClientSession(clientRequest: ClientReq) {
        let message = `Como não recebi nenhum retorno, vou encerrar nossa conversa para esse pedido.\n\n`
        message += `Para iniciar um novo pedido, é só me chamar novamente 😉`

        this.sendWATextMessage(message, clientRequest.costumerWAId, 'endClientSession')
            .then((response) => {
                this.deleteClientFromBusinessDB(clientRequest)
                delete this.clientList[clientRequest.costumerWAId]
                delete this.clientRequestList[clientRequest.costumerWAId]
            });
    }
}