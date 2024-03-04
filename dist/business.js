var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const axios = require("axios");
const fs = require('fs');
const qs = require('qs');
const uuid = require('uuid');
require("dotenv").config();
import ClientReq from './client';
export default class Business {
    /*CONFIGURATION*/
    constructor(botNumberID) {
        this.orderCodeList = new Set();
        this.contexts = {};
        this.botNumberID = botNumberID;
        this.initializeBusinessData();
    }
    initializeBusinessData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios.get(`http://lojas.vlks.com.br/api/BotBusiness/botNumberID=${this.botNumberID}`);
                if (response.status === 200) {
                    const businessData = response.data;
                    this.BotBusinessID = businessData.ID ?
                        businessData.ID : (() => { throw new Error("Business ID deve ser inicializado!"); })();
                    this.name = businessData.nameBs ?
                        businessData.nameBs : (() => { throw new Error("Business name deve ser inicializado!"); })();
                    this.FBTOKEN = businessData.FBTOKEN ?
                        businessData.FBTOKEN : (() => { throw new Error("Business FBTOKEN deve ser inicializado!"); })();
                    this.codFilial = businessData.codFilial ?
                        businessData.codFilial : (() => { throw new Error("Business codFilial deve ser inicializado!"); })();
                    this.botNumber = businessData.botNumber ?
                        businessData.botNumber : (() => { throw new Error("Business botNumber deve ser inicializado!"); })();
                    this.botName = businessData.botName ?
                        businessData.botName : (() => { console.warn("\x1b[33m%s\x1b[0m", "AVISO! Bot name não inicializado. Usando 'o Chat Bot'."); return 'o Assistente Virtual'; })();
                    this.clientList = businessData.clientListBs ?
                        businessData.clientListBs : (() => { console.warn("\x1b[33m%s\x1b[0m", 'clientList vazia. Usando {}.'); return {}; })();
                    this.showRecommendedProduct = 'showRecommendedProduct' in businessData ?
                        businessData.clientListBs : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! showRecommendedProduct não inicializado. Usando true.'); return true; })();
                    this.showPrepTime = 'showPrepTime' in businessData ?
                        businessData.showPrepTime : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! showPrepTime não inicializado. Usando true.'); return true; })();
                    this.showPrice = 'showPrice' in businessData ?
                        businessData.showPrice : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! showPrice não inicializado. Usando true.'); return true; })();
                    this.minutesToEndSession = 'minutesToEndSession' in businessData ?
                        businessData.minutesToEndSession : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! minutesToEndSession não inicializado. Usando 30.'); return 30; })();
                    this.secondsToTimeOut = businessData.secondsToTimeOut ?
                        businessData.secondsToTimeOut : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! secondsToTimeOut não inicializado. Usando 50.'); return 50; })();
                    this.menuLink = businessData.menuLink ?
                        businessData.menuLink : (() => { console.warn("\x1b[33m%s\x1b[0m", 'AVISO! menuLink não inicializado. Usando "link".'); return 'link'; })();
                    this.productList = Array.isArray(businessData.productListBs) && businessData.productListBs.length ?
                        yield this.rebuildProductListToBotProductList(businessData.productListBs) : yield this.initializeProducts();
                    this.clientRequestList = {};
                    this.initializeIntents();
                    console.log('name: ', this.name, '\nFBTOKEN: ', this.FBTOKEN, '\nbotNumberID: ', this.botNumberID, '\nbotNumber: ', this.botNumber, 
                    // '\nclientList: ', this.clientList,
                    '\nshowPrepTime: ', this.showPrepTime, '\nsecondsToTimeOut: ', this.secondsToTimeOut);
                    if (Object.values(this.productList).length) {
                        console.log('productList: ');
                        // console.table(this.productList)
                        console.info(`Dados '${this.name}' carregados do banco (${Object.keys(this.productList).length} produtos)`);
                        console.info(`Aguardando clientes...`);
                    }
                    else {
                        console.error("\x1b[31m%s\x1b[0m", 'Não foi possivel carregar os produtos do banco.');
                        console.error("\x1b[33m%s\x1b[0m", 'Por favor, reinicie o servidor!');
                    }
                }
                else {
                    console.error("\x1b[31m%s\x1b[0m", `BotBusiness response status: ${response.status}  ${response.statusText}`);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro GET dados BotBusiness.\n${error}`);
            }
        });
    }
    initializeProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `http://lojas.vlks.com.br/api/BotProducts/Listbot/${this.botNumberID}`;
                const response = yield axios.get(url);
                if (response.status === 200) {
                    const productMap = {};
                    try {
                        this.rebuildProductListToBotProductList(response.data);
                        return productMap;
                    }
                    catch (error) {
                        console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar produtos: ${error}`);
                        if (!response)
                            console.error('response.data: ', response.data);
                    }
                }
                else {
                    console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar produtos: ${response.status} - ${response.statusText}`);
                    return {};
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar produtos: ${error}`);
                return {};
            }
        });
    }
    initializeIntents() {
        this.addContext('inicio', (clientRequest) => {
            var _a;
            try {
                const orderListData = this.extractProductOrdersFromMessage(clientRequest.textMessage ? clientRequest.textMessage : '');
                if ((_a = orderListData.products) === null || _a === void 0 ? void 0 : _a.length) { // Mostrar lista de adicionais
                    this.clientList[clientRequest.costumerWAId].orderMessageId = 'save';
                    this.askAdditional(clientRequest, orderListData);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
                }
                else { // Enviar mensagem de boas-vindas com link
                    this.greatingsMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em inicial', error);
            }
        });
        this.addContext('escolher_adicionais', (clientRequest) => {
            var _a, _b;
            try {
                const BotClient = this.clientList[clientRequest.costumerWAId];
                if (clientRequest.textMessage === '0' || clientRequest.textMessage.toLowerCase() === 'nao' || clientRequest.textMessage.toLowerCase() === 'não') { // 0 - Revisar e finalizar pedido
                    if (!this.mustIncludeAdditional(clientRequest)) {
                        if (!BotClient.recommendedProduct && this.showRecommendedProduct) {
                            this.mostRecommendProduct(clientRequest);
                            this.clientList[clientRequest.costumerWAId].contextClient = 'produto_recomendado';
                        }
                        else {
                            this.reviewOrder(clientRequest);
                            this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido';
                        }
                    }
                }
                else if ((_a = BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]) === null || _a === void 0 ? void 0 : _a.codeAdd) { // # - Incluir adicional
                    this.includeAdditional(clientRequest);
                }
                else if (((_b = BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]) === null || _b === void 0 ? void 0 : _b.observation) === '') { // # - Incluir observação 
                    this.includeObservation(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'observacao';
                }
                else {
                    this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em escolher_adicionais', error);
            }
        });
        this.addContext('observacao', (clientRequest) => {
            try {
                this.confirmObservation(clientRequest); // Texto : observação
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em observacao', error);
            }
        });
        this.addContext('qtd_adicionais', (clientRequest) => {
            try {
                this.quantityAdditional(clientRequest); // Quantidade de adicionais
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em qtd_adicionais', error);
            }
        });
        this.addContext('produto_recomendado', (clientRequest) => {
            try {
                console.log(clientRequest.idButton);
                if (clientRequest.idButton === '1') { // 1 - Não quero incluir
                    this.reviewOrder(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido';
                }
                else if (clientRequest.idButton === '0') { // 0 - Quero incluir 
                    this.includeRecommendedProduct(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'quantidade_recomendado';
                }
                else {
                    this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em produto_recomendado', error);
            }
        });
        this.addContext('quantidade_recomendado', (clientRequest) => {
            try {
                this.quantityRecommendedProduct(clientRequest);
                this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em quantidade_recomendado', error);
            }
        });
        this.addContext('revisar_pedido', (clientRequest) => {
            try {
                const botClient = this.clientList[clientRequest.costumerWAId];
                if (clientRequest.idButton === '1') { // 1 - Finalizar pedido
                    if (botClient.tableClient) {
                        this.sendToPreparation(clientRequest);
                        botClient.contextClient = 'aguardar_pedido';
                    }
                    else if (!botClient.tableClient) {
                        this.checkClientRegistration(clientRequest); // dados_nome, confirmar_dados
                    }
                }
                else if (clientRequest.idButton === '0') { // 0 - Editar pedido
                    this.askProductForEdit(clientRequest);
                    botClient.contextClient = 'editar_pedido';
                }
                else {
                    this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em revisar_pedido', error);
            }
        });
        this.addContext('editar_pedido', (clientRequest) => {
            try {
                if (clientRequest.textMessage === '0') { // 0 • Deixa pra lá. Finalizar pedido
                    this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido';
                    this.handleContext(clientRequest);
                }
                else if (parseInt(clientRequest.textMessage) <= this.clientList[clientRequest.costumerWAId].ProductListClient.length) {
                    this.editOrder(clientRequest); // Editando produto
                    this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
                }
                else {
                    this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em editar_pedido', error);
            }
        });
        this.addContext('confirmar_dados', (clientRequest) => {
            try {
                if (clientRequest.idButton === '1') { // 1 - Cadastrar novos dados
                    this.askClientName(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'dados_nome';
                }
                else if (clientRequest.idButton === '0') { //  0 - Usar dados cadastrados
                    this.sendToPreparation(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido';
                }
                else {
                    this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_nome', error);
            }
        });
        this.addContext('dados_nome', (clientRequest) => {
            try {
                if (true) {
                    this.clientList[clientRequest.costumerWAId].nameClient = clientRequest.textMessage;
                    this.askClientAddress(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'dados_endereco';
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_nome', error);
            }
        });
        this.addContext('dados_endereco', (clientRequest) => {
            try {
                if (true) {
                    this.clientList[clientRequest.costumerWAId].addressClient = clientRequest.textMessage;
                    this.askClientCPF(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'dados_cpf';
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_endereco', error);
            }
        });
        this.addContext('dados_cpf', (clientRequest) => {
            try {
                if (true) {
                    if (this.validateCPF_CNPJ(clientRequest)) {
                        this.sendToPreparation(clientRequest);
                        this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido';
                    }
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_cpf', error);
            }
        });
        this.addContext('revenda_rapida', (clientRequest) => {
            try {
                if (clientRequest.idButton === '0') { // VER CARDÁPIO
                    this.greatingsMessage(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'inicio';
                }
                else if (clientRequest.idButton === '1' || (this.quickResaleClientProducts(clientRequest).length >= 2 && clientRequest.idButton === '2')) { //  Pedir produto
                    this.addQuickResaleProductOrder(clientRequest);
                }
                else if (clientRequest.idButton === 'fechar_conta') {
                    this.paymentForm(clientRequest);
                    this.clientList[clientRequest.costumerWAId].contextClient = 'pagamento';
                }
                else {
                    this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_cpf', error);
            }
        });
        this.addContext('pagamento', (clientRequest) => {
            try {
                if (clientRequest.idButton === 'pix' || clientRequest.idButton === 'c_credito' || clientRequest.idButton === 'c_debito') {
                    this.payBill(clientRequest);
                }
                else {
                    this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em dados_cpf', error);
            }
        });
    }
    postRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let wa_id;
                if ('contacts' in req.body.entry[0].changes[0].value) {
                    wa_id = req.body.entry[0].changes[0].value.contacts[0].wa_id;
                }
                else if ('statuses' in req.body.entry[0].changes[0].value) {
                    wa_id = req.body.entry[0].changes[0].value.statuses[0].recipient_id;
                }
                this.clientRequestList[wa_id] = new ClientReq(req, res);
                if (this.clientRequestList[wa_id].messagesObject) {
                    const currentTimestamp = Math.floor(Date.now() / 1000);
                    if (currentTimestamp - parseInt(this.clientRequestList[wa_id].timestampCostumer) < this.secondsToTimeOut) {
                        if (!this.clientList[wa_id]) {
                            this.clientList[wa_id] = this.createClient(this.clientRequestList[wa_id].costumerName, wa_id);
                        }
                        if (this.clientList[wa_id].timeoutID) {
                            clearTimeout(this.clientList[wa_id].timeoutID);
                        }
                        const clientRequest = this.clientRequestList[wa_id];
                        this.clientList[wa_id].timeoutID = setTimeout(() => {
                            this.endClientSession(clientRequest);
                        }, this.minutesToEndSession * 60 * 1000);
                        if (this.clientRequestList[wa_id].typeMessage === "text" || this.clientRequestList[wa_id].typeMessage === "interactive") {
                            this.handleContext(this.clientRequestList[wa_id]);
                        }
                    }
                }
                else if (this.clientRequestList[wa_id].statusesObject) {
                    try {
                        if (this.clientList[wa_id]) {
                            if (this.clientRequestList[wa_id].messageStatus === "delivered") {
                                if (this.clientList[wa_id].orderMessageId === 'save')
                                    this.clientList[wa_id].orderMessageId = this.clientRequestList[wa_id].sentMessageId;
                                console.error(this.clientRequestList[wa_id].messageStatus);
                            }
                        }
                    }
                    catch (error) {
                        if (!this.clientList) {
                            console.error(`Business não iniciado, aguarde!`);
                        }
                        else if (!this.clientList[wa_id]) {
                            console.error(`Cliente ${wa_id} nao existe`, error.TypeError);
                        }
                        res.sendStatus(500);
                    }
                }
                res.sendStatus(200);
            }
            catch (error) {
                if (!this.clientList) {
                    console.error(`Business não iniciado, aguarde!`);
                }
                res.sendStatus(500);
            }
        });
    }
    addContext(name, handlerFunction) {
        this.contexts[name] = handlerFunction;
    }
    handleContext(clientRequest) {
        const contextClient = this.clientList[clientRequest.costumerWAId] ? this.clientList[clientRequest.costumerWAId].contextClient : 'inicio';
        if (this.contexts[contextClient] && typeof this.contexts[contextClient] === 'function') {
            this.contexts[contextClient](clientRequest);
            console.log(`client '${clientRequest.costumerWAId}' context: ${contextClient}`);
        }
        else {
            console.error("\x1b[31m%s\x1b[0m", `Contexto ${contextClient} não encontrado`);
        }
    }
    rebuildProductListToBotProductList(products) {
        const productList = {};
        try {
            products.map((product) => {
                const AdditionalList = {};
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
                        };
                    });
                }
                else {
                    product.AdditionalList = {};
                }
                const botProduct = {
                    botNumberID: this.botNumberID,
                    codeProd: product.codeProd,
                    nameProd: product.nameProd,
                    priceProd: product.priceProd,
                    categoryProd: product.categoryProd,
                    qtdStockProd: product.qtdStockProd,
                    descriptionProd: product.descriptionProd,
                    preparationTime: product.preparationTime ? product.preparationTime : 5,
                    quickResale: product.quickResale ? product.quickResale : true, //RETIRAR ESSA CONDIÇÃO
                    qtdMaxAdditionals: product.qtdMaxAdditionals,
                    qtdMinAdditionals: product.qtdMinAdditionals,
                    recommendedProductCode: product.recommendedProductCode ? product.recommendedProductCode : '845031', //products[Math.floor(Math.random() * products.length)].codeProd,
                    imageUrlProd: 'https://docs.lacartadigital.com.br/produtos/dc642675-30b1-440b-9600-cd7e2c3991a6_resize.jpg', // product.imagem
                    AdditionalList: AdditionalList,
                };
                productList[product.codeProd] = botProduct;
            });
            return productList;
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", `Erro em rebuildProductListToBotProductList ao reconstruir produtos:\n${error}`);
        }
    }
    createClient(name, phoneNumberClient, addressClient = "", chatHistory = [], contextClient = 'inicio', tableClient = 0, BotProductList = [], orderMessageId = '', editingOrder = false, totalOrderPrice = 0) {
        const client = {
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
        };
        return client;
    }
    /*DATA BASE*/
    writeBusinessDB() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.productList ? null : console.warn(`${this.botNumberID} created with empty products list`);
                let businessData = yield this.readBusinessDB(this.botNumberID);
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
                            console.log(`Business '${this.botNumberID}' alterado com sucesso!`);
                        }
                        catch (error) {
                            console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição POST:');
                        }
                    }
                    else {
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
                            console.log(`Business '${this.botNumberID}' criado com sucesso!`);
                        }
                        catch (error) {
                            console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição PUT:');
                        }
                    }
                }
                else {
                    console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do negocio.');
                }
            }));
        });
    }
    readBusinessDB(botNumberID = "") {
        return __awaiter(this, void 0, void 0, function* () {
            const url = botNumberID
                ? `http://lojas.vlks.com.br/api/BotBusiness?botNumberID=${botNumberID}`
                : `http://lojas.vlks.com.br/api/BotBusiness`;
            try {
                const response = yield axios.get(url);
                return response.data.length === 0 ? undefined : response.data;
            }
            catch (error) {
                if (error.response.status && error.response.statusText) {
                    console.error("\x1b[31m%s\x1b[0m", `Erro ao tentar ler dados de '${botNumberID}'`, error.response.status, error.response.statusText);
                }
                else {
                    console.error("\x1b[31m%s\x1b[0m", `Erro ao tentar ler dados`, error.response);
                }
                return null;
            }
        });
    }
    deleteBusinessDB(botNumberID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let config = {
                    method: 'delete',
                    maxBodyLength: Infinity,
                    url: 'http://lojas.vlks.com.br/api/BotBusiness',
                    headers: {}
                };
                axios.request(config)
                    .then((response) => {
                    console.log(JSON.stringify(response.data));
                    resolve(response);
                })
                    .catch((error) => {
                    console.error(error);
                    reject(error);
                });
            }));
        });
    }
    writeClientToBusinessClientListDB(botClient) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.clientList[botClient.phoneNumberClient] = botClient;
                    console.log('writeClientToBusinessClientListDB\n  totalOrderPrice', botClient.totalOrderPrice);
                    const data = {
                        ID: botClient.ID ? botClient.ID : undefined,
                        orderCodeClient: botClient.orderCodeClient ? botClient.orderCodeClient : (() => { console.warn('orderCodeClient inválido. Use createClient()'); return null; })(),
                        phoneNumberClient: botClient.phoneNumberClient ? botClient.phoneNumberClient : (() => { console.warn('phoneNumberClient inválido. Use createClient()'); return null; })(),
                        nameClient: botClient.nameClient !== undefined ? botClient.nameClient : (() => { console.warn('nameClient inválido. Use createClient()'); return null; })(),
                        contextClient: botClient.contextClient !== undefined ? botClient.contextClient : (() => { console.warn('contextClient inválido. Use createClient()'); return null; })(),
                        addressClient: botClient.addressClient !== undefined ? botClient.addressClient : (() => { console.warn('addressClient inválido. Use createClient()'); return null; })(),
                        tableClient: botClient.tableClient !== undefined ? botClient.tableClient : (() => { console.warn('tableClient inválido. Use createClient()'); return 0; })(),
                        orderMessageId: botClient.orderMessageId !== undefined ? botClient.orderMessageId : (() => { console.warn('orderMessageId inválido. Use createClient()'); return null; })(),
                        totalOrderPrice: botClient.totalOrderPrice !== undefined ? botClient.totalOrderPrice : (() => { console.warn('totalOrderPrice inválido. Use createClient()'); return 0; })(),
                        editingOrder: botClient.editingOrder !== undefined ? botClient.editingOrder : (() => { console.warn('editingOrder inválido. Use createClient()'); return null; })(),
                        ProductListClient: botClient.ProductListClient !== undefined ? botClient.ProductListClient : (() => { console.warn('productListClient inválido. Use createClient()'); return {}; })(),
                        chatHistory: botClient.chatHistory !== undefined ? botClient.chatHistory : (() => { console.warn('chatHistory inválido. Use createClient()'); return null; })(),
                        botNumberID: this.botNumberID,
                        BotBusinessID: this.BotBusinessID
                    };
                    if (botClient.ID) {
                        yield axios.put(`http://lojas.vlks.com.br/api/BotClient/${botClient.ID}`, data)
                            .then(response => {
                            console.log(`Dados Client '${botClient.phoneNumberClient}' alterados no banco`);
                            resolve(response);
                        })
                            .catch(error => {
                            console.error("\x1b[31m%s\x1b[0m", `Erro PUT ao save cliente '${botClient.phoneNumberClient}' no banco\n${error}`);
                            reject(error);
                        });
                    }
                    else if (botClient.ID === undefined) {
                        yield axios.post('http://lojas.vlks.com.br/api/BotClient', data)
                            .then(response => {
                            botClient.ID = response.data.ID;
                            console.log(`Dados Client '${botClient.phoneNumberClient} - ${botClient.ID}' criados no banco`);
                            resolve(response);
                        })
                            .catch(error => {
                            console.error("\x1b[31m%s\x1b[0m", `Erro POST ao save cliente '${botClient.phoneNumberClient}' no banco\n${error}`);
                            reject(error);
                        });
                    }
                }
                catch (error) {
                    console.error(`Não foi possivel adionar o cliente [${botClient.phoneNumberClient}] a clientList.\nError: ${error.response.data}`);
                    reject(error);
                }
            }));
        });
    }
    readClientFromBusinessDB(arg = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const url = arg.phoneNumberClient
                        ? `http://lojas.vlks.com.br/api/BotClient/${arg.phoneNumberClient}/${this.botNumberID}`
                        : arg.clientID ? `http://lojas.vlks.com.br/api/BotClient/${arg.clientID}`
                            : `http://lojas.vlks.com.br/api/BotClient/${this.botNumberID}`;
                    const response = yield axios.get(url);
                    console.log(response);
                    console.log('response', response);
                    resolve(response.data.length === 0 ? undefined : response.data);
                }
                catch (error) {
                    console.error("\x1b[31m%s\x1b[0m", `Erro GET BotClient '${arg.phoneNumberClient}'`, error.response.status, error.response.statusText);
                    reject(error);
                }
            }));
        });
    }
    deleteClientFromBusinessDB(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const botClient = this.clientList[clientRequest.costumerWAId];
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
                    console.error("\x1b[31m%s\x1b[0m", `Erro DELETE BotClient '${botClient.phoneNumberClient}'`, error.response.status, error.response.statusText);
                    reject(error);
                });
            });
        });
    }
    writeClientOrderDB(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteClientFromBusinessDB(clientRequest);
            const botClient = this.clientList[clientRequest.costumerWAId];
            const productListClient = [];
            botClient.ProductListClient.forEach((product) => {
                const additionalList = [];
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
                    });
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
                });
            });
            const chatHistory = [];
            botClient.chatHistory.forEach((text) => {
                chatHistory.push({
                    texto: text ? JSON.stringify(text) : '',
                    botNumberID: this.botNumberID,
                    BotBusinessID: this.BotBusinessID
                });
            });
            const data = {
                botNumberID: this.botNumberID ? this.botNumberID : (() => { throw new Error(`botNumberID inválido! [${this.botNumberID}]`); })(),
                orderCodeClient: botClient.orderCodeClient ? botClient.orderCodeClient : (() => { throw new Error(`botNumberID inválido! [${this.botNumberID}]`); })(),
                phoneNumberClient: botClient.phoneNumberClient ? botClient.phoneNumberClient : (() => { throw new Error(`phoneNumberClient inválido! [${botClient.phoneNumberClient}]`); })(),
                nameClient: botClient.nameClient ? botClient.nameClient : (() => { throw new Error(`nameClient inválido! [${botClient.nameClient}]`); })(),
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
            };
            // console.log('DATA = ', JSON.stringify(data, null, 2))
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `http://lojas.vlks.com.br/api/BotClient/${botClient.ID}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            };
            yield axios.request(config)
                .then((response) => {
                console.log(`Pedido Client '${clientRequest.costumerWAId}' salvo no banco`);
            })
                .catch((error) => {
                console.error("\x1b[31m%s\x1b[0m", `Erro PUT ao salvar cliente '${clientRequest.costumerWAId}' no banco\n${error}`);
            });
        });
    }
    writeProductListClientDB(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const botClient = this.clientList[clientRequest.costumerWAId];
                let productList = [];
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
                        AdditionalList: [], //product.AdditionalList,
                        BotBusinessID: this.BotBusinessID
                    });
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
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    for (let i = 0; i < response.data.length; i++) {
                        botClient.ProductListClient[i].ID = response.data[i].ID;
                        console.log('AdditionalList', botClient.ProductListClient[i].AdditionalList);
                    }
                    console.log('response writeProductListClientDB', response.data);
                    console.log('ProductListClient writeProductListClientDB', botClient.ProductListClient);
                    yield this.writeAdditionalListsClientDB(clientRequest);
                    resolve(response);
                }))
                    .catch((error) => {
                    reject(error);
                });
            });
        });
    }
    writeAdditionalListsClientDB(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const productListClient = this.clientList[clientRequest.costumerWAId].ProductListClient;
                    productListClient.forEach((product) => {
                        let additionalList = [];
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
                            });
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
                            console.log('writeAdditionalListClientDB response', response);
                        })
                            .catch((error) => {
                            reject(error);
                        });
                    });
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    writeBotArrayStringDB(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const botClient = this.clientList[clientRequest.costumerWAId];
                let BotArrayString = [];
                for (let chat of botClient.chatHistory) {
                    BotArrayString.push({
                        texto: chat,
                        botNumberID: this.botNumberID,
                        BotBusinessID: this.BotBusinessID,
                        BotClientID: botClient.ID
                    });
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
        });
    }
    writeClientToCupomDB(botClient) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let clientData = yield this.readClientFromCupomDB(botClient.phoneNumberClient);
                const TCTOKEN = yield this.getTokenTabletcloud();
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
                const check = false;
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
                            config.method = 'put';
                            config.url = 'https://api.tabletcloud.com.br/cliente/update';
                        }
                        axios.request(config)
                            .then((response) => {
                            // console.log(JSON.stringify(response.data));
                        })
                            .catch((error) => {
                            console.error(error);
                        });
                    }
                    else {
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do cliente.');
                    }
                }
            }
            catch (error) {
                console.error(`Não foi possivel adionar o cliente [${botClient.phoneNumberClient}] a clientList.\nError: ${error.response.data}`);
            }
        });
    }
    readClientFromCupomDB(id = "") {
        return __awaiter(this, void 0, void 0, function* () {
            const url = id
                ? `https://api.tabletcloud.com.br/`
                : `https://api.tabletcloud.com.br/`;
            try {
                const response = yield axios.get(url);
                return response.data.length === 0 ? undefined : response.data;
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro GET Cupom '${id}'`, error.response.status, error.response.statusText);
                return null;
            }
        });
    }
    getTokenTabletcloud() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://api.tabletcloud.com.br/token`;
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
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro GET Token Tabletcloud`, error.response.status, error.response.statusText);
                return null;
            }
        });
    }
    readBotProductDB(phoneNumberClient = "") {
        return __awaiter(this, void 0, void 0, function* () {
            const url = phoneNumberClient
                ? `http://lojas.vlks.com.br/api/BotProduct/${this.botNumberID}/${phoneNumberClient}`
                : `http://lojas.vlks.com.br/api/BotProduct/${this.botNumberID}`;
            try {
                const response = yield axios.get(url);
                return response.data.length === 0 ? undefined : response.data;
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro ao tentar ler dados de '${phoneNumberClient}'`, error.response.status, error.response.statusText);
                return null;
            }
        });
    }
    readProductAdditionalDB(codigoProduto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `http://printweb.vlks.com.br/LoginAPI/Modificadores/${codigoProduto}`,
                    headers: {}
                };
                const additionals = yield axios.request(config);
                return additionals.data;
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", `Erro ao buscar o modificador do produto '${codigoProduto}'\n`, error.response.status, error.response.statusText);
                return null;
            }
        });
    }
    /*AUX*/
    addProductsToClientProductsList(clientRequest, productList) {
        try {
            const botClient = this.clientList[clientRequest.costumerWAId];
            const productClient = botClient.ProductListClient;
            for (const prod of productList) {
                for (let qtd = 0; qtd < prod.orderQtdProd; qtd++) {
                    botClient.totalOrderPrice += prod.priceProd;
                    const productCopy = Object.assign({}, this.productList[prod.codeProd]);
                    productCopy.AdditionalList = {};
                    productCopy.orderQtdProd = 1;
                    productClient.push(productCopy);
                }
            }
            this.addAdditionalsToFullAdditionalList(clientRequest);
        }
        catch (error) {
            if (!this.clientList[clientRequest.costumerWAId]) {
                console.error(`Cliente ${clientRequest.costumerWAId} não existe!`);
            }
            console.error(`\nError: ${error.response.data}`);
        }
    }
    addAdditionalsToFullAdditionalList(clientRequest) {
        try {
            const fullAdditionalList = this.clientList[clientRequest.costumerWAId].fullAdditionalList = [];
            const productListClient = this.clientList[clientRequest.costumerWAId].ProductListClient;
            const product = this.productList;
            for (let prod of productListClient) {
                for (let add of Object.values(product[prod.codeProd].AdditionalList)) {
                    fullAdditionalList.push(add);
                }
                fullAdditionalList.push({ "observation": "" });
            }
            this.clientList[clientRequest.costumerWAId].fullAdditionalList = fullAdditionalList;
            console.log('addAdditionalsToFullAdditionalList, fullAdditionalList');
            console.table(this.clientList[clientRequest.costumerWAId].fullAdditionalList);
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em addAdditionalsToFullAdditionalList', error);
        }
    }
    uuidOrderCodeGenerator() {
        let orderCode;
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
    deleteOrderCode(client) {
        if (client.orderCodeClient) {
            this.orderCodeList.delete(client.orderCodeClient);
        }
    }
    splitLongMessage(message) {
        message += '\n';
        const maxIndex = 4096;
        let NLindex = 0;
        let messageList = [];
        const times = message.length / maxIndex;
        for (let j = 0; j < times; j++) {
            for (let i = maxIndex; i > 0; i--) {
                if (message[i] === '\n') {
                    NLindex = i;
                    break;
                }
            }
            messageList.push(message.slice(0, NLindex));
            message = message.slice(NLindex);
        }
        return messageList;
    }
    sendSingleMessage(message, costumerWAId, functionName, arg = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // Tornar essa função automatica e unificada
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let data = {};
                    if (arg.buttons) {
                        if (arg.buttons.length > 3)
                            throw new Error("Max 3 buttons");
                        let buttons = [];
                        for (let i = 0; i < arg.buttons.length; i++) {
                            if (arg.buttons[i] !== '') {
                                if (arg.buttons[i].length > 20) {
                                    arg.buttons[i] = arg.buttons[i].slice(0, 20);
                                }
                                buttons.push({
                                    type: 'reply',
                                    reply: {
                                        id: arg.id_buttons ? arg.id_buttons[i] : i,
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
                    }
                    else {
                        data = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": costumerWAId,
                            "type": "text",
                            "text": {
                                "preview_url": false,
                                "body": message
                            }
                        };
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
                }
                catch (error) {
                    console.error("\x1b[31m%s\x1b[0m", `Erro em '${functionName}'\n${error}`);
                }
            }));
        });
    }
    sendWATextMessage(message, costumerWAId, functionName, arg = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let messageList = [message];
                    if (message.length > 4096) {
                        messageList = this.splitLongMessage(message);
                    }
                    for (let i = 0; i < messageList.length; i++) {
                        if (arg && i === (messageList.length - 1)) {
                            yield this.sendSingleMessage(messageList[i], costumerWAId, functionName, arg);
                        }
                        else {
                            yield this.sendSingleMessage(messageList[i], costumerWAId, functionName);
                        }
                    }
                    resolve();
                }
                catch (error) {
                    console.error("\x1b[31m%s\x1b[0m", `Erro ao enviar mensagem em '${functionName}'\n${error.message}`);
                    reject();
                }
            }));
        });
    }
    sendWAImageMessage(imageUrl, costumerWAId, functionName = "", message_id = '') {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
                    resolve(response);
                }, 500);
            })
                .catch((error) => {
                console.error("\x1b[31m%s\x1b[0m", `Erro ao enviar imagem em '${functionName}'\n${error.message}`);
                reject(error);
            });
        }));
    }
    extractProductOrdersFromMessage(mensagem) {
        const regexMesa = /Mesa: (\d+)/;
        const regexCodigo = /Cod: (\d+)/;
        const regexPedido = /(\d+) - ([^\n]+) \.\.\.\.\.\. R\$ ([\d,]+)/;
        const regexTotal = /Total do pedido: R\$ ([\d,]+)/;
        const regexSabores = /Sabores:/;
        const regexQtdSabores = /(\d+) - (\d+)/;
        const regexVazia = /^\s*\n/gm;
        let mesa = null;
        let pedidos = [];
        let totalPedido = null;
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
                    const addList = {};
                    if (line.match(regexSabores)) {
                        ++i;
                        do {
                            line = lines[++i].trim();
                            const [, qtdSabor, codSabor] = line.match(regexQtdSabores);
                            addList[codSabor] = {
                                ProductCode: codigo,
                                codeAdd: codSabor,
                                orderQtdAdd: qtdSabor
                            };
                            line = lines[i + 1].trim();
                        } while (line.match(regexQtdSabores));
                    }
                    pedidos.push({
                        codeProd: codigo,
                        nameProd: nome.trim(),
                        priceProd: parseFloat(preco.replace(',', '.')),
                        orderQtdProd: parseInt(quantidade),
                        AdditionalList: addList
                    });
                }
            }
            else if (line.match(regexTotal)) {
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
    largestPrepTime(clientRequest) {
        const productList = this.clientList[clientRequest.costumerWAId].ProductListClient;
        let largestPrepTime = 0;
        for (let product of Object.values(productList)) {
            if (product.preparationTime > largestPrepTime)
                largestPrepTime = product.preparationTime;
        }
        return largestPrepTime;
    }
    quickResaleClientProducts(clientRequest) {
        const botClient = this.clientList[clientRequest.costumerWAId];
        let quickResaleProducts = [];
        for (let product of botClient.ProductListClient) {
            if (product.quickResale)
                quickResaleProducts.push(product.codeProd);
        }
        return quickResaleProducts;
    }
    mustIncludeAdditional(clientRequest) {
        const productListClient = this.clientList[clientRequest.costumerWAId].ProductListClient;
        let mustInclude = false;
        let message = '';
        for (let prod of productListClient) {
            const diff = prod.qtdMinAdditionals - Object.values(prod.AdditionalList).length;
            if (diff > 0) {
                message += `Opa! Você ainda não selecionou todos os adicionais para ${prod.nameProd}\n`;
                message += `Faltam *${diff}*!`;
                mustInclude = true;
                this.sendWATextMessage(message, clientRequest.costumerWAId, 'mustIncludeAdditional');
            }
        }
        return mustInclude;
    }
    validateCNPJ(strCNPJ) {
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
    validateCPF(strCPF) {
        let Soma;
        let Resto;
        Soma = 0;
        if (strCPF == "00000000000")
            return false;
        for (let i = 1; i <= 9; i++)
            Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
        Resto = (Soma * 10) % 11;
        if ((Resto == 10) || (Resto == 11))
            Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10)))
            return false;
        Soma = 0;
        for (let i = 1; i <= 10; i++)
            Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;
        if ((Resto == 10) || (Resto == 11))
            Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11)))
            return false;
        return true;
    }
    categoryEmoji(category) {
        switch (category.toUpperCase()) {
            case 'VESTUARIO':
                return '👕';
            case 'BEBIDAS':
                return '🥤';
            case 'COMIDAS':
                return '🍔'; //'🍽️'
            case 'OUTROS':
                return '📦';
            case 'SORVETERIA':
                return '🍦';
            case 'SERVICOS':
                return '👩‍💼';
            case 'CONSUMACAO':
                return '💳';
            case 'PIZZA':
                return '🍕';
            case 'HORTIFRUTI':
                return '🥦';
            case 'FICHAS':
                return '🎟️';
            case 'BATATA':
                return '🥔';
            case 'ACAI':
                return '🍨';
            case 'LANCHES':
                return '🍔';
            default:
                return '🛍️';
        }
    }
    /*INTENTIONS*/
    testMessage(clientRequest) {
        try {
            let message = `Olá! 😄 Eu sou *${this.botName}*, assistente virtual da *${this.name}*!🤖\nEstou pronto para agilizar e facilitar o seu atendimento. 🚀`;
            message += `\n\nUse os números para pedir e, pronto, o pedido está feito! 🌮 Simples assim! 🌟`;
            message += `\n\nPara dar uma olhada no nosso *cardápio*, é só clicar no link! 🍔👀 \n\nhttp://printweb.vlks.com.br/Empresas/3264/Cardapio3/Index.html`;
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'testMessage');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro ao criar a mensagem em testMessage', error);
        }
    }
    greatingsMessage(clientRequest) {
        try {
            let message = `Olá! 😄 Eu sou *${this.botName}*, assistente virtual da *${this.name}*!🤖\nEstou pronto para agilizar e facilitar o seu atendimento. 🚀`;
            message += `\n\nUse os números para pedir e, pronto, o pedido está feito! 🌮 Simples assim! 🌟`;
            message += `\n\nPara dar uma olhada no nosso *cardápio*, é só clicar no link! 🍔👀 \n\nhttp://printweb.vlks.com.br/Empresas/3264/Cardapio3/Index.html`;
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'greatingsMessage');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro ao criar a mensagem em greatingsMessage', error);
        }
    }
    askAdditional(clientRequest, orderListData = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const BotClient = this.clientList[clientRequest.costumerWAId];
                if ((_a = orderListData.products) === null || _a === void 0 ? void 0 : _a.length) {
                    BotClient.tableClient = orderListData.table;
                    this.addProductsToClientProductsList(clientRequest, orderListData.products);
                    console.log(`Pedido de ${clientRequest.costumerName}:`);
                    console.table(BotClient.ProductListClient);
                }
                try {
                    let i = 0;
                    let message = `Envie *um número por vez* e o *adicional* será incluido ao seu pedido! 🤩\n`;
                    message += `Você também pode incluir uma *observação especial* para cada produto. ✨\n\n`;
                    const productListClient = Object.values(BotClient.ProductListClient);
                    for (let j = 0; j < productListClient.length; j++) {
                        let numProd = 0;
                        for (let k = 0; k <= j; k++)
                            if (productListClient[j].nameProd === productListClient[k].nameProd)
                                ++numProd;
                        let emoji = this.categoryEmoji(productListClient[j].categoryProd);
                        if (productListClient[j].qtdMinAdditionals) {
                            message += `*Obrigatório incluir ${productListClient[j].qtdMinAdditionals}*\n`;
                        }
                        message += `${emoji} *${numProd}º _${productListClient[j].nameProd}_* :\n`;
                        for (let add of Object.values(this.productList[productListClient[j].codeProd].AdditionalList)) {
                            message += ` _*${++i}*_ • ${add.nameAdd}${this.showPrice ? ` - ${add.priceAdd.toFixed(2).replace('.', ',')}` : ''}\n`;
                        }
                        message += ` _*${++i}*_ • Incluir observação.\n\n`;
                    }
                    message += `_*0*_ • *Concluir* e *revisar* pedido. 🛒✅`;
                    if (!BotClient.chatHistory) {
                        this.clientList[clientRequest.costumerWAId].chatHistory = [];
                    }
                    this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
                    this.sendWATextMessage(message, clientRequest.costumerWAId, 'askAdditional');
                }
                catch (error) {
                    console.error("\x1b[31m%s\x1b[0m", 'Erro ao criar a mensagem em askAdditional', error);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro askAdditional');
            }
        });
    }
    includeAdditional(clientRequest) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId];
            const additionalClient = BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1];
            let prodIndex = 0;
            for (let i = 0; i < BotClient.fullAdditionalList.length; i++) {
                if ("observation" in BotClient.fullAdditionalList[i])
                    ++prodIndex;
                if (i === parseInt(clientRequest.textMessage) - 1)
                    break;
            }
            const productClient = BotClient.ProductListClient[prodIndex];
            const product = this.productList[productClient.codeProd];
            const additional = product.AdditionalList[additionalClient.codeAdd];
            let message;
            /**
             * Se o produto não possui quantidade maxima de adicionais ou
             * Se o cliente selecionou menos itens que a quantidade maxima ou
             * Se o cliente selecionou todos os adicionais possiveis
             */
            if (!product.qtdMaxAdditionals ||
                Object.values(productClient.AdditionalList).length < product.qtdMaxAdditionals ||
                Object.values(productClient.AdditionalList).length === product.AdditionalList.length) {
                if (Object.values(productClient.AdditionalList).some(add => add.codeAdd === additional.codeAdd)) {
                    message = `Opa, _*${additional.nameAdd}*_ já foi incluído.\n`;
                }
                else {
                    message = `Ok, _*${additional.nameAdd}*_.`;
                    productClient.AdditionalList[additional.codeAdd] = (Object.assign({}, additional));
                    if (additional.qtdMaxAdd) {
                        message += `\n\nQual a *quantidade* desejada?\nVocê pode adicionar até ${additional.qtdMaxAdd} ${additional.nameAdd}!`;
                        this.clientList[clientRequest.costumerWAId].contextClient = 'qtd_adicionais';
                    }
                    else {
                        BotClient.totalOrderPrice += additional.priceAdd;
                        message += `\nMais alguma coisa?\n`;
                    }
                }
            }
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeAdditional');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em includeAdditional', error);
        }
    }
    quantityAdditional(clientRequest) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId];
            BotClient.errorQtdAdd = BotClient.errorQtdAdd ? BotClient.errorQtdAdd : 1;
            const additionalClient = BotClient.fullAdditionalList[parseInt(BotClient.chatHistory[BotClient.chatHistory.length - 1]) - 1 * BotClient.errorQtdAdd];
            const additional = this.productList[additionalClient.ProductCode].AdditionalList[additionalClient.codeAdd];
            let message;
            if (parseInt(clientRequest.textMessage) > additional.qtdMaxAdd) {
                message = `Não é possivel adicionar ${clientRequest.textMessage} ${additional.nameAdd}!\nEscolha uma quantidade de no *máximo* ${additional.qtdMaxAdd}.`;
                BotClient.errorQtdAdd += 1;
            }
            else {
                message = `Ok, então fica *${clientRequest.textMessage} ${additional.nameAdd}*${this.showPrice ? `, no total de +R$ ${(parseInt(clientRequest.textMessage) * additional.priceAdd).toFixed(2).replace('.', ',')}` : ''}`;
                message = `\n\nDigite o numero do adicional para continuar incluindo.`;
                message = `\n\n*_0_* • Voltar para a lista de pedidos.\n`;
                BotClient.totalOrderPrice += additional.priceAdd * parseInt(clientRequest.textMessage);
            }
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'quantityAdditional');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao quantityAdditional');
        }
    }
    includeObservation(clientRequest) {
        try {
            let message = `Por favor, *descreva* a *observação* desejada.\n\nEx: Sem cebola, guardanapo extra`;
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeObservation');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao includeObservation');
        }
    }
    confirmObservation(clientRequest) {
        try {
            const BotClient = this.clientList[clientRequest.costumerWAId];
            BotClient.chatHistory.push(clientRequest.textMessage);
            let prodIndex = -1;
            for (let i = 1; i <= parseInt(BotClient.chatHistory[BotClient.chatHistory.length - 2]); i++) {
                if ("observation" in BotClient.fullAdditionalList[i - 1])
                    console.log(++prodIndex);
            }
            const productClient = BotClient.ProductListClient[prodIndex];
            console.log('BotClient.ProductListClient', BotClient.ProductListClient);
            if (!productClient.observationClient)
                productClient.observationClient = '';
            productClient.observationClient = clientRequest.textMessage;
            let message = `Certo, *observação anotada*!\n"${productClient.observationClient}"`;
            message += `\n\nDeseja incluir mais algum adicional ou observação?\n\`\`\`Digite o numero do item\`\`\``;
            console.log('observationClient: ', this.clientList[clientRequest.costumerWAId].ProductListClient[prodIndex].observationClient);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'confirmObservation');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao confirmObservation', error);
        }
    }
    mostRecommendProduct(clientRequest) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const productListClient = this.clientList[clientRequest.costumerWAId].ProductListClient;
                const productList = this.productList;
                let recProducts = {};
                let mostRec;
                for (let i = 0; i < productListClient.length; i++) {
                    if (productList[productListClient[i].codeProd].recommendedProductCode) {
                        mostRec = {
                            count: 0,
                            recCodeProd: productList[productListClient[i].codeProd].recommendedProductCode,
                            refCodeProd: productList[productListClient[i].codeProd].codeProd
                        };
                        break;
                    }
                }
                if (mostRec) {
                    for (let prod of productListClient) {
                        if ((_a = this.productList[prod.codeProd]) === null || _a === void 0 ? void 0 : _a.recommendedProductCode) {
                            const currentCode = this.productList[prod.codeProd].recommendedProductCode;
                            if (!recProducts[currentCode]) {
                                recProducts[currentCode] = {
                                    count: 1,
                                    recCodeProd: currentCode,
                                    refCodeProd: prod.codeProd
                                };
                            }
                            else {
                                recProducts[currentCode].count++;
                            }
                            if (recProducts[currentCode].count > mostRec.count) {
                                mostRec = recProducts[currentCode];
                            }
                        }
                    }
                    console.log('Most Recommended Product');
                    console.table(mostRec);
                    this.clientList[clientRequest.costumerWAId].recommendedProduct = mostRec;
                    let message = `_*${clientRequest.costumerName}!*_ Sabe o que vai super bem com _*${this.productList[mostRec.refCodeProd].nameProd}*_?\n\n`;
                    message += `_*${this.productList[mostRec.recCodeProd].nameProd}*_ !!!🤩\n\n`;
                    message += `${this.showPrice ? `Por apenas R$ _*${(this.productList[mostRec.recCodeProd].priceProd).toFixed(2).replace('.', ',')}*_\n` : ''}`;
                    message += `*Aproveite!!!*\n\n`;
                    const button1 = `Incluir ${this.productList[mostRec.recCodeProd].nameProd.length < 12 ? this.productList[mostRec.recCodeProd].nameProd : 'com certeza!'}`;
                    const button2 = `Não, obrigado!`;
                    this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
                    if (this.productList[mostRec.recCodeProd].imageUrlProd) {
                        yield this.sendWAImageMessage(this.productList[mostRec.recCodeProd].imageUrlProd, clientRequest.costumerWAId, 'mostRecommendProduct');
                    }
                    this.sendWATextMessage(message, clientRequest.costumerWAId, 'mostRecommendProduct', { buttons: [button1, button2] });
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em mostRecommendProduct', error);
            }
        });
    }
    includeRecommendedProduct(clientRequest) {
        try {
            const botClient = this.clientList[clientRequest.costumerWAId];
            const product = this.productList[botClient.recommendedProduct.recCodeProd];
            clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.idButton);
            let message = `Incrível!!!`;
            message += `\nQuantos _*${product.nameProd}*_ você gostaria de acrescentar a sua lista de pedidos?`;
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeRecommendedProduct');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em includeRecommendedProduct', error);
        }
    }
    quantityRecommendedProduct(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const BotClient = this.clientList[clientRequest.costumerWAId];
                const product = Object.assign({}, this.productList[BotClient.recommendedProduct.recCodeProd]);
                product.orderQtdProd = parseInt(clientRequest.textMessage);
                product.AdditionalList = {};
                // BotClient.totalOrderPrice += parseInt(clientRequest.textMessage) * product.priceProd
                let message = `Certo, _*${parseInt(clientRequest.textMessage)} ${product.nameProd}*_ incluídos!`;
                yield this.sendWATextMessage(message, clientRequest.costumerWAId, 'quantityRecommendedProduct');
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
                };
                BotClient.chatHistory.push(clientRequest.textMessage);
                this.askAdditional(clientRequest, orderListData);
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em quantityRecommendedProduct', error);
            }
        });
    }
    noContextMessage(clientRequest) {
        try {
            let message = "Responda com o _numero_ correspondente do item que deseja _selecionar_.\n\nPor favor, envie _um_ valor _por mensagem_ e aguarde a resposta.";
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'noContextMessage');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao noContextMessage');
        }
    }
    reviewOrder(clientRequest) {
        try {
            const botClient = this.clientList[clientRequest.costumerWAId];
            clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive);
            let totalOrderPrice = botClient.totalOrderPrice; // = 0
            let message = `Seu pedido:\n`;
            for (let product of botClient.ProductListClient) {
                let orderQtdProd = product.orderQtdProd ? product.orderQtdProd : 1;
                // totalOrderPrice += orderQtdProd * product.priceProd
                message += `\n• *${orderQtdProd} ${product.nameProd}*${this.showPrice ? ` - R$ ${(orderQtdProd * product.priceProd).toFixed(2).replace('.', ',')}` : ''}`;
                for (let add of Object.values(product.AdditionalList)) {
                    let orderQtdAdd = add.orderQtdAdd ? add.orderQtdAdd : 1;
                    // totalOrderPrice += orderQtdAdd * add.priceAdd
                    message += `\n\t${orderQtdAdd} ${add.nameAdd}${this.showPrice ? ` + R$ ${(orderQtdAdd * add.priceAdd).toFixed(2).replace('.', ',')}` : ''}`;
                }
                if (product.observationClient)
                    message += `\n\tObservação: "${product.observationClient}"`;
                message += `\n`;
            }
            message += `${this.showPrice ? `\`\`\`\nTotal do pedido: R$ ${totalOrderPrice.toFixed(2).replace('.', ',')}\`\`\`` : ''}`;
            const button1 = `Editar pedido ✏️`;
            const button2 = `Finalizar pedido ✅`;
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'reviewOrder', { buttons: [button1, button2] });
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao reviewOrder');
        }
    }
    askProductForEdit(clientRequest) {
        try {
            const botClient = this.clientList[clientRequest.costumerWAId];
            const productClient = botClient.ProductListClient;
            clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive);
            let message = `Qual produto você deseja editar?`;
            for (let i = 0; i < productClient.length; i++) {
                message += `\n\n_*${i + 1}*_ • ${productClient[i].nameProd}`;
            }
            message += `\n\n_*0*_ • Deixa pra lá. Finalizar pedido 🛒`;
            botClient.editingOrder = true;
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'askProductForEdit');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao editOrder');
        }
    }
    editOrder(clientRequest) {
        const botClient = this.clientList[clientRequest.costumerWAId];
        const productClient = botClient.ProductListClient[parseInt(clientRequest.textMessage) - 1];
        for (let add of Object.values(productClient.AdditionalList)) {
            botClient.totalOrderPrice -= add.priceAdd * (add.orderQtdAdd ? add.orderQtdAdd : 1);
        }
        productClient.AdditionalList = {};
        productClient.observationClient = '';
        let message = `Certo! Deletei as inclusões de _*${productClient.nameProd}*_.\n\n`;
        message += `Digite o numero para incluir novos adicionais da lista.\n\n`;
        message += `\`\`\`Os outros produtos continuam com os adicionais escolhidos anteriormente\`\`\``;
        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'editOrder', { message_id: this.clientList[clientRequest.costumerWAId].orderMessageId });
    }
    checkClientRegistration(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const botClient = this.clientList[clientRequest.costumerWAId];
                clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive);
                const clientDataList = yield this.readClientFromBusinessDB({ phoneNumberClient: clientRequest.costumerWAId });
                let clientData;
                for (let data of Object.values(clientDataList)) {
                    if ('addressClient' in data && data.addressClient !== '') {
                        clientData = data;
                    }
                }
                console.log(clientData[Object.values(clientData).length - 1]);
                if ('addressClient' in clientData /*&& 'cpfClient' in clientData && clientData.cpfClient.length */ && clientData.addressClient.length) {
                    let message = `*${clientRequest.costumerName}*! Verificamos que você ja possui cadastro!\n`;
                    message += `Gostaria de usar os dados abaixo para seu pedido?\n\n`;
                    message += `\`\`\`Nome\`\`\`: ${clientData.nameClient}\n`;
                    message += `\`\`\`CPF\`\`\`: ${clientData.cpf_cnpjClient ? clientData.cpf_cnpjClient : 'NÃO INFORMADO'}\n`;
                    message += `\`\`\`Endereço\`\`\`: ${clientData.addressClient}\n`;
                    const button1 = `Sim usar estes dados`;
                    const button2 = `Não, cadastrar novos`;
                    this.sendWATextMessage(message, clientRequest.costumerWAId, 'checkClientRegistration', { buttons: [button1, button2] });
                    botClient.contextClient = 'confirmar_dados';
                }
                else {
                    this.askClientName(clientRequest);
                    botClient.contextClient = 'dados_nome';
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao checkClientRegistration', error);
            }
        });
    }
    askClientName(clientRequest) {
        const botClient = this.clientList[clientRequest.costumerWAId];
        clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive);
        let message = `Por favor, *${clientRequest.costumerName}*, confirme seu nome.`;
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'askClientName');
    }
    askClientAddress(clientRequest) {
        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
        let message = `Perfeito ${clientRequest.textMessage}!\n\n`;
        message += `Agora informe seu endereço de entrega completo.\n`;
        message += `Ex: Rua das Palmeiras, n 123, ap 123 bloco 4 - CEP 12345-000`;
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'askClientAddress');
    }
    askClientCPF(clientRequest) {
        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
        let message = `Ótimo!\n\n`;
        message += `Gostaria de incluir seu CPF ou CNPJ na nota fiscal?\n\n`;
        message += `• Informe seu CPF ou CNPJ\n\t_*OU*_\n• Digite _*0*_ para *não* incluir.`;
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'askClientCPF');
    }
    validateCPF_CNPJ(clientRequest) {
        try {
            const digits = clientRequest.textMessage.replace(/[^\d]/g, '');
            let illegit = '';
            if (digits.length === 11) {
                illegit = this.validateCPF(digits) ? '' : 'CPF';
            }
            else if (digits.length === 14) {
                illegit = this.validateCNPJ(digits) ? '' : 'CNPJ';
            }
            else {
                illegit = 'CPF ou CNPJ';
            }
            if (illegit !== '') {
                let message = `Por favor, informe um ${illegit} válido!`;
                this.sendWATextMessage(message, clientRequest.costumerWAId, 'validateCPF_CNPJ');
                return false;
            }
            return true;
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro ao validar cpf/cnpj validateCPF_CNPJ', error);
        }
    }
    sendToPreparation(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const botClient = this.clientList[clientRequest.costumerWAId];
                clientRequest.textMessage ? botClient.chatHistory.push(clientRequest.textMessage) : botClient.chatHistory.push(clientRequest.interactive);
                botClient.contextClient = 'aguardar_pedido';
                const prepTime = this.largestPrepTime(clientRequest);
                let message = `Ótimo!! Seu pedido já esta sendo preparado! 🙌`;
                if (this.showPrepTime) {
                    message += `\nTempo de espera é de aproximadamente *${prepTime}* minutos 😉`;
                }
                clearTimeout(botClient.timeoutID);
                this.sendWATextMessage(message, clientRequest.costumerWAId, 'sendToPreparation');
                this.writeClientOrderDB(clientRequest)
                    .then((response) => {
                    console.log(`Pedido ${clientRequest.costumerName} :`);
                    console.table(botClient.ProductListClient);
                    this.quickResaleProductMessage(clientRequest);
                });
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao sendToPreparation', error);
            }
        });
    }
    quickResaleProductMessage(clientRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    if (this.clientList[clientRequest.costumerWAId].tableClient) {
                        const prepTime = this.largestPrepTime(clientRequest);
                        const quickResaleProductsCodeList = this.quickResaleClientProducts(clientRequest);
                        if (quickResaleProductsCodeList.length) {
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                const message_check = 'Caso queira pedir a conta, clique no botão abaixo';
                                const arg = { buttons: ['FECHAR CONTA'], id_buttons: ['fechar_conta'] };
                                yield this.sendWATextMessage(message_check, clientRequest.costumerWAId, 'quickResaleProductMessage', arg);
                                const botClient = this.clientList[clientRequest.costumerWAId];
                                const productList = this.productList;
                                let message = `${botClient.nameClient}, gostaria de ver o cardápio ou pedir novamente um dos itens abaixo?`;
                                message += `\n\nÉ só clicar e já trazemos seu pedido`;
                                let buttons = [];
                                buttons.push('VER CARDÁPIO');
                                buttons.push(productList[quickResaleProductsCodeList[0]].nameProd);
                                if (quickResaleProductsCodeList[1])
                                    buttons.push(productList[quickResaleProductsCodeList[1]].nameProd);
                                botClient.contextClient = 'revenda_rapida';
                                this.sendWATextMessage(message, clientRequest.costumerWAId, 'quickResaleProduct', { buttons: buttons });
                            }), Math.floor(prepTime * 0.1 * 60000));
                        }
                    }
                    resolve();
                }
                catch (error) {
                    console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao quickResaleProduct', error);
                    reject(error);
                }
            });
        });
    }
    addQuickResaleProductOrder(clientRequest) {
        const productList = this.productList;
        const quickProductCode = this.quickResaleClientProducts(clientRequest)[parseInt(clientRequest.idButton) - 1];
        const productClient = this.productList[quickProductCode];
        const quickResaleProductsCodeList = this.quickResaleClientProducts(clientRequest);
        this.addProductsToClientProductsList(clientRequest, [productClient]);
        this.writeClientOrderDB(clientRequest);
        let message = `Show!`;
        message += `\n1 _*${productClient.nameProd}*_ saindoo!💨`;
        message += `\n\nClique no botão abaixo para pedir mais um agora mesmo ou mais tarde!`;
        let buttons = [];
        buttons.push('VER CARDÁPIO');
        buttons.push(productList[quickResaleProductsCodeList[0]].nameProd);
        if (quickResaleProductsCodeList.length > 1)
            buttons.push(productList[quickResaleProductsCodeList[1]].nameProd);
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'quickResaleProduct', { buttons: buttons });
    }
    paymentForm(clientRequest) {
        const botClient = this.clientList[clientRequest.costumerWAId];
        let message = `Certo! A conta ficou R$ ${botClient.totalOrderPrice.toFixed(2).replace('.', ',')}`;
        message += `\nQual a forma de pagamento?`;
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'paymentForm', { buttons: ['PIX', 'Cartão de crédito', 'Cartão de débito'], id_buttons: ['pix', 'c_credito', 'c_debito'] });
    }
    payBill(clientRequest) {
        let message = '';
        if (clientRequest.idButton === '0') {
            message = 'PIX';
        }
        else if (clientRequest.idButton === '1') {
            message = 'Cartão de crédito';
        }
        else if (clientRequest.idButton === '2') {
            message = 'Cartão de débito';
        }
        message += `\n\nPagamento confirmado!\nObrigado pela confiança\nVolte sempre!!!  `;
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'payBill');
        delete this.clientList[clientRequest.costumerWAId];
        delete this.clientRequestList[clientRequest.costumerWAId];
    }
    endClientSession(clientRequest) {
        let message = `Como não recebi retorno, vou encerrar nossa conversa para esse pedido.\n\n`;
        message += `Para iniciar um novo pedido, é só me chamar novamente 😉`;
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'endClientSession')
            .then((response) => {
            this.deleteClientFromBusinessDB(clientRequest);
            delete this.clientList[clientRequest.costumerWAId];
            delete this.clientRequestList[clientRequest.costumerWAId];
        });
    }
}
//# sourceMappingURL=business.js.map