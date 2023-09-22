"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require("axios");
var fs = require('fs');
var qs = require('qs');
var uuid = require("uuid");
var client_1 = require("./client");
var Business = /** @class */ (function () {
    function Business(IdFilial) {
        this.orderCodeList = new Set();
        this.contexts = {};
        this.IdFilial = IdFilial;
        this.initializeBusinessData();
    }
    Business.prototype.initializeBusinessData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, businessData, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, axios.get("http://lojas.vlks.com.br/api/BotBusiness/113343625148900")]; //correto: http://lojas.vlks.com.br/api/BotBusiness/${this.IdFilial}
                    case 1:
                        response = _b.sent() //correto: http://lojas.vlks.com.br/api/BotBusiness/${this.IdFilial}
                        ;
                        if (!(response.status === 200)) return [3 /*break*/, 3];
                        businessData = response.data;
                        this.name = businessData.name;
                        this.FBTOKEN = businessData.FBTOKEN;
                        this.botNumberID = businessData.botNumberID;
                        this.botNumber = businessData.botNumber;
                        this.botName = businessData.botName ? businessData.botName : 'o Chat BOT';
                        _a = this;
                        return [4 /*yield*/, this.initializeProducts()];
                    case 2:
                        _a.productList = _b.sent();
                        this.clientList = businessData.clientList ? businessData.clientList : {};
                        this.showPrepTime = businessData.showPrepTime ? businessData.showPrepTime : true;
                        this.secondsToTimeOut = 50;
                        this.initializeIntents();
                        if (Object.values(this.productList).length) {
                            console.log('name: ', this.name, '\nFBTOKEN: ', this.FBTOKEN, '\nbotNumberID: ', this.botNumberID, '\nbotNumber: ', this.botNumber, '\nclientList: ', this.clientList, '\nshowPrepTime: ', this.showPrepTime);
                            console.log('productList: ');
                            console.table(this.productList);
                            console.info("Dados '".concat(this.name, "' carregados do banco (").concat(Object.keys(this.productList).length, " produtos)"));
                            console.info("Aguardando clientes...");
                        }
                        else {
                            console.error("\x1b[31m%s\x1b[0m", 'Não foi possivel carregar os produtos do banco.');
                            console.error("\x1b[33m%s\x1b[0m", 'Por favor, reinicie o servidor!');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        console.error("\x1b[31m%s\x1b[0m", "Initializer reponse status: ".concat(response.status, "  ").concat(response.statusText));
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        console.error("\x1b[31m%s\x1b[0m", "Erro GET dados:\n".concat(error_1));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.initializeProducts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, productMap_1, tempRecProducts_1, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        url = "http://lojas.vlks.com.br/api/BotFood/".concat(this.IdFilial);
                        return [4 /*yield*/, axios.get(url)];
                    case 1:
                        response = _a.sent();
                        if (!(response.status === 200)) return [3 /*break*/, 3];
                        productMap_1 = {};
                        tempRecProducts_1 = ['740651', '1229618', '845031', '1272635', '845028', '845030', '1229516', '2311415', '1807348', '2165481', '2311795', '3717285', '699951'];
                        return [4 /*yield*/, Promise.all(response.data.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                                var botProduct, modifiersUrl, modifiersResponse;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            botProduct = {
                                                codeProd: item.codigo,
                                                nameProd: item.name,
                                                priceProd: parseFloat(item.price),
                                                categoryProd: item.category,
                                                descriptionProd: item.description,
                                                recommendedProductCode: tempRecProducts_1[Math.floor(parseFloat(item.price) / 8)],
                                                imageProdUrl: item.imagem,
                                                AdditionalList: {},
                                            };
                                            modifiersUrl = "http://printweb.vlks.com.br/LoginAPI/Modificadores/".concat(botProduct.codeProd);
                                            return [4 /*yield*/, axios.get(modifiersUrl)];
                                        case 1:
                                            modifiersResponse = _a.sent();
                                            if (modifiersResponse.status === 200) {
                                                if (Array.isArray(modifiersResponse.data) && modifiersResponse.data.length > 0) {
                                                    botProduct.AdditionalList = modifiersResponse.data.reduce(function (acc, modifier) {
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
                                            }
                                            else {
                                                console.error("\x1b[31m%s\x1b[0m", "Erro ao buscar modificadores para o produto ".concat(botProduct.nameProd, ": ").concat(modifiersResponse.status, " - ").concat(modifiersResponse.statusText));
                                            }
                                            productMap_1[botProduct.codeProd.toString()] = botProduct;
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, productMap_1];
                    case 3:
                        console.error("\x1b[31m%s\x1b[0m", "Erro ao buscar produtos: ".concat(response.status, " - ").concat(response.statusText));
                        return [2 /*return*/, {}];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.error("\x1b[31m%s\x1b[0m", "Erro ao buscar produtos: ".concat(error_2));
                        return [2 /*return*/, {}];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.initializeIntents = function () {
        var _this = this;
        this.addContext('nenhum', function (clientRequest) {
            var _a;
            try {
                var orderListData = _this.extractProductOrdersFromMessage(clientRequest.textMessage);
                if ((_a = orderListData.products) === null || _a === void 0 ? void 0 : _a.length) {
                    _this.clientList[clientRequest.costumerWAId].orderMessageId = 'salvar';
                    console.log('orderListData', orderListData);
                    _this.askAdditional(clientRequest, orderListData);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
                }
                else {
                    _this.greatingsMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em nenhum', error);
            }
        });
        this.addContext('escolher_adicionais', function (clientRequest) {
            var _a, _b;
            try {
                var BotClient = _this.clientList[clientRequest.costumerWAId];
                if (clientRequest.textMessage === '0') {
                    _this.reviewOrder(clientRequest);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'revisar_pedido';
                }
                else if ((_a = BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]) === null || _a === void 0 ? void 0 : _a.AddCode) {
                    _this.includeAdditional(clientRequest);
                }
                else if (((_b = BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1]) === null || _b === void 0 ? void 0 : _b.observation) === '') {
                    _this.includeObservation(clientRequest);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'observacao';
                }
                else if (parseInt(clientRequest.textMessage) === BotClient.fullAdditionalList.length + 1) {
                    _this.includeRecommendedProduct(clientRequest);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'quantidade_recomendado';
                }
                else {
                    _this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em escolher_adicionais', error);
            }
        });
        this.addContext('observacao', function (clientRequest) {
            try {
                _this.confirmObservation(clientRequest);
                _this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em observacao', error);
            }
        });
        this.addContext('qtd_adicionais', function (clientRequest) {
            try {
                _this.quantityAdditional(clientRequest);
                _this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em qtd_adicionais', error);
            }
        });
        this.addContext('quantidade_recomendado', function (clientRequest) {
            try {
                _this.quantityRecommendedProduct(clientRequest);
                _this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em observacao', error);
            }
        });
        this.addContext('revisar_pedido', function (clientRequest) {
            try {
                if (clientRequest.textMessage === '0') {
                    _this.checkClientRegistration(clientRequest);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'cadastro';
                }
                else if (clientRequest.textMessage === '1') {
                    _this.askProductForEdit(clientRequest);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'editar_pedido';
                }
                else {
                    _this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em revisar_pedido', error);
            }
        });
        this.addContext('editar_pedido', function (clientRequest) {
            try {
                if (clientRequest.textMessage === '0') {
                    _this.checkClientRegistration(clientRequest);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'cadastro';
                }
                else if (parseInt(clientRequest.textMessage) <= _this.clientList[clientRequest.costumerWAId].productListClient.length) {
                    _this.editOrder(clientRequest);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'escolher_adicionais';
                }
                else {
                    _this.noContextMessage(clientRequest);
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em revisar_pedido', error);
            }
        });
        this.addContext('cadastro', function (clientRequest) {
            try {
                if (clientRequest.textMessage === '0') {
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido';
                    _this.sendToPreparation(clientRequest);
                }
                else if (clientRequest.textMessage === '1') {
                    _this.checkClientRegistration(clientRequest);
                    _this.clientList[clientRequest.costumerWAId].contextClient = 'cadastro';
                }
            }
            catch (error) {
                console.error("\x1b[31m%s\x1b[0m", 'Erro em cadastro', error);
            }
        });
    };
    // 1º Timestamp dif : 38
    // 2º Timestamp dif : 41
    // 3º Timestamp dif : 38
    // 4º Timestamp dif : 38
    Business.prototype.postRequest = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTimestamp, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.clientRequest = new client_1.default(req, res);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        if (!this.clientRequest.messagesObject) return [3 /*break*/, 5];
                        currentTimestamp = Math.floor(Date.now() / 1000);
                        if (!(currentTimestamp - parseInt(this.clientRequest.timestampCostumer) < this.secondsToTimeOut)) return [3 /*break*/, 4];
                        if (!!this.clientList[this.clientRequest.costumerWAId]) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.writeClientToBusinessClientListDB(this.createClient(this.clientRequest.costumerName, this.clientRequest.costumerWAId))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (this.clientRequest.typeMessage === "text") {
                            this.handleIntent(this.clientRequest);
                        }
                        else if (this.clientRequest.typeMessage === "interactive") {
                            // Tratar mensagens com botões
                        }
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        if (this.clientRequest.statusesObject) {
                            if (!this.clientList[this.clientRequest.recipientId]) {
                                if (this.clientRequest.messageStatus === "delivered") {
                                    if (this.clientList[this.clientRequest.recipientId].orderMessageId === 'salvar')
                                        this.clientList[this.clientRequest.recipientId].orderMessageId = this.clientRequest.sentMessageId;
                                    console.log(this.clientRequest.messageStatus);
                                }
                            }
                        }
                        _a.label = 6;
                    case 6:
                        res.sendStatus(200);
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _a.sent();
                        if (!this.clientList) {
                            console.log("Business n\u00E3o iniciado, aguarde!");
                        }
                        else if (!this.clientList[this.clientRequest.costumerWAId]) {
                            console.log("Cliente ".concat(this.clientList[this.clientRequest.costumerWAId], " nao existe"), error_3);
                        }
                        res.sendStatus(500);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.addContext = function (name, handlerFunction) {
        this.contexts[name] = handlerFunction;
    };
    Business.prototype.handleIntent = function (clientRequest) {
        var contextClient = this.clientList[clientRequest.costumerWAId] ? this.clientList[clientRequest.costumerWAId].contextClient : 'nenhum';
        if (this.contexts[contextClient] && typeof this.contexts[contextClient] === 'function') {
            console.log('context client: ', contextClient);
            this.contexts[contextClient](clientRequest);
        }
        else {
            console.error("\x1b[31m%s\x1b[0m", "Contexto ".concat(contextClient, " n\u00E3o encontrado"));
        }
    };
    Business.prototype.uuidOrderCodeGenerator = function () {
        var orderCode;
        do {
            orderCode = uuid.v4();
            var today = new Date();
            var day = String(today.getDate()).padStart(2, '0');
            var month = String(today.getMonth() + 1).padStart(2, '0'); // Os meses começam em zero
            var year = today.getFullYear();
            orderCode += "-".concat(day).concat(month).concat(year);
        } while (this.orderCodeList.has(orderCode));
        this.orderCodeList.add(orderCode);
        return orderCode;
    };
    Business.prototype.deleteOrderCode = function (client) {
        if (client.orderCodeClient) {
            this.orderCodeList.delete(client.orderCodeClient);
        }
    };
    /**
     * Adiciona um objeto business do tipo BotBusiness com o nome definidor por name, na _businessList do controller
     * @param phone_number_id
     * @param business
    */
    Business.prototype.writeBusinessDB = function () {
        var _this = this;
        this.productList ? null : console.log("".concat(this.botNumberID, " created with empty products list"));
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var businessData, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readBusinessDB(this.botNumberID)];
                    case 1:
                        businessData = _a.sent();
                        data = {
                            "name": this.name,
                            "FBTOKEN": this.FBTOKEN,
                            "botNumberID": this.botNumberID,
                            "botNumber": this.botNumber,
                            "IdFilial": 3264
                        };
                        if (businessData !== null) {
                            if (businessData && businessData.find(function (obj) { return obj.botNumberID === _this.botNumberID; })) {
                                try {
                                    axios.put("http://lojas.vlks.com.br/api/BotBusiness/".concat(this.botNumberID), data)
                                        .then(function (response) {
                                        console.log(response.data);
                                    })
                                        .catch(function (error) {
                                        console.error("\x1b[31m%s\x1b[0m", 'error in PUT');
                                    });
                                    console.log("Business '".concat(this.botNumberID, "' alterado com sucesso!"));
                                }
                                catch (error) {
                                    console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição POST:');
                                }
                            }
                            else {
                                try {
                                    axios.post('http://lojas.vlks.com.br/api/BotBusiness', data)
                                        .then(function (response) {
                                        console.log(response.data);
                                    })
                                        .catch(function (error) {
                                        console.error("\x1b[31m%s\x1b[0m", 'error in POST');
                                    });
                                    console.log("Business '".concat(this.botNumberID, "' criado com sucesso!"));
                                }
                                catch (error) {
                                    console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição PUT:');
                                }
                            }
                        }
                        else {
                            console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do negocio.');
                        }
                        return [2 /*return*/];
                }
            });
        }); })();
    };
    Business.prototype.readBusinessDB = function (botNumberID) {
        if (botNumberID === void 0) { botNumberID = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = botNumberID
                            ? "http://lojas.vlks.com.br/api/BotBusiness?botNumberID=".concat(botNumberID)
                            : "http://lojas.vlks.com.br/api/BotBusiness";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.length === 0 ? undefined : response.data];
                    case 3:
                        error_4 = _a.sent();
                        if (error_4.response.status && error_4.response.statusText) {
                            console.error("\x1b[31m%s\x1b[0m", "Erro ao tentar ler dados de '".concat(botNumberID, "'"), error_4.response.status, error_4.response.statusText);
                        }
                        else {
                            console.error("\x1b[31m%s\x1b[0m", "Erro ao tentar ler dados", error_4.response);
                        }
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.deleteBusinessDB = function (botNumberID) {
        var config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: 'http://lojas.vlks.com.br/api/BotClient',
            headers: {}
        };
        axios.request(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
            .catch(function (error) {
            console.log(error);
        });
        return;
    };
    Business.prototype.getBusinessObject = function () {
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
    };
    Business.prototype.createClient = function (name, phoneNumberClient, addressClient, chatHistory, contextClient, table, BotProductList) {
        if (addressClient === void 0) { addressClient = ""; }
        if (chatHistory === void 0) { chatHistory = []; }
        if (contextClient === void 0) { contextClient = 'nenhum'; }
        if (table === void 0) { table = 0; }
        if (BotProductList === void 0) { BotProductList = []; }
        var client = {
            nameClient: name,
            orderCodeClient: this.uuidOrderCodeGenerator(),
            phoneNumberClient: phoneNumberClient,
            tableClient: table,
            addressClient: addressClient,
            chatHistory: chatHistory,
            contextClient: contextClient,
            productListClient: BotProductList
        };
        return client;
    };
    /**
     * Criar ou modificar o dado de um cliente no banco de dados BotProdutoPedido
     * @param botNumberID Numero ID do bot do estabelecimento
     * @param clientID Numero do WA do cliente
     */
    Business.prototype.writeClientToBusinessClientListDB = function (botClient) {
        return __awaiter(this, void 0, void 0, function () {
            var clientData, data, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        if (!this.clientList) { // Deprecated
                            console.warn('clientList inicializada (Lembre-se de inicializar clientList ao instanciar um novo negocio!)');
                            this.clientList = {};
                        }
                        botClient.editingOrder = false;
                        this.clientList[botClient.phoneNumberClient] = botClient;
                        return [4 /*yield*/, this.readClientFromBusinessDB(botClient.phoneNumberClient)];
                    case 1:
                        clientData = _a.sent();
                        data = {
                            "numberClient": botClient.phoneNumberClient,
                            "name": botClient.nameClient,
                            "orderCode": botClient.orderCodeClient,
                            "conversationContext": botClient.contextClient,
                            "addressClient": botClient.addressClient,
                            "botNumberID": this.botNumberID // "botNumberID": this.botNumberID
                            // "chatHistory": botClient.chatHistory,            // "chatHistory": botClient.chatHistory,
                        };
                        if (!(clientData !== null)) return [3 /*break*/, 6];
                        if (!clientData) return [3 /*break*/, 3];
                        return [4 /*yield*/, axios.put("http://lojas.vlks.com.br/api/BotClient/".concat(this.botNumberID, "/").concat(botClient.phoneNumberClient), data)
                                .then(function (response) {
                                console.log("Dados Client '".concat(botClient.phoneNumberClient, "' alterados no banco"));
                            })
                                .catch(function (error) {
                                console.error("\x1b[31m%s\x1b[0m", "Erro PUT ao salvar o cliente '".concat(botClient.phoneNumberClient, "' no banco\n").concat(error.status, "  ").concat(error.statusText));
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(clientData === undefined)) return [3 /*break*/, 5];
                        return [4 /*yield*/, axios.post('http://lojas.vlks.com.br/api/BotClient', data)
                                .then(function (response) {
                                console.log("Dados Client '".concat(botClient.phoneNumberClient, "' criados no banco"));
                            })
                                .catch(function (error) {
                                console.error("\x1b[31m%s\x1b[0m", "Erro POST ao salvar o cliente '".concat(botClient.phoneNumberClient, "' no banco\n").concat(error.status, "  ").concat(error.statusText));
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do cliente.');
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_5 = _a.sent();
                        console.log("N\u00E3o foi possivel adionar o cliente [".concat(botClient.phoneNumberClient, "] a clientList.\nError: ").concat(error_5.response.data));
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.readClientFromBusinessDB = function (phoneNumberClient) {
        if (phoneNumberClient === void 0) { phoneNumberClient = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = phoneNumberClient
                            ? "http://lojas.vlks.com.br/api/BotClient/".concat(this.botNumberID, "/").concat(phoneNumberClient)
                            : "http://lojas.vlks.com.br/api/BotClient/".concat(this.botNumberID);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.length === 0 ? undefined : response.data];
                    case 3:
                        error_6 = _a.sent();
                        console.error("\x1b[31m%s\x1b[0m", "Erro GET BotClient '".concat(phoneNumberClient, "'"), error_6.response.status, error_6.response.statusText);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.writeClientToCupomDB = function (botClient) {
        return __awaiter(this, void 0, void 0, function () {
            var clientData, TOKEN, data, check, config, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.readClientFromCupomDB(botClient.phoneNumberClient)];
                    case 1:
                        clientData = _a.sent();
                        return [4 /*yield*/, this.getTokenTabletcloud()];
                    case 2:
                        TOKEN = _a.sent();
                        data = {
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
                        check = false;
                        if (check) {
                            if (clientData !== null) {
                                config = {
                                    method: 'post',
                                    maxBodyLength: Infinity,
                                    url: 'https://api.tabletcloud.com.br/cliente/save',
                                    headers: {
                                        'Authorization': "Bearer ".concat(TOKEN)
                                    },
                                    data: data
                                };
                                if (clientData) {
                                    config.method = 'put';
                                    config.url = 'https://api.tabletcloud.com.br/cliente/update';
                                }
                                axios.request(config)
                                    .then(function (response) {
                                    // console.log(JSON.stringify(response.data));
                                })
                                    .catch(function (error) {
                                    console.log(error);
                                });
                            }
                            else {
                                console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do cliente.');
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.log("N\u00E3o foi possivel adionar o cliente [".concat(botClient.phoneNumberClient, "] a clientList.\nError: ").concat(error_7.response.data));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.readClientFromCupomDB = function (id) {
        if (id === void 0) { id = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = id
                            ? "https://api.tabletcloud.com.br/"
                            : "https://api.tabletcloud.com.br/";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.length === 0 ? undefined : response.data];
                    case 3:
                        error_8 = _a.sent();
                        console.error("\x1b[31m%s\x1b[0m", "Erro GET Cupom '".concat(id, "'"), error_8.response.status, error_8.response.statusText);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.getTokenTabletcloud = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, data, config;
            return __generator(this, function (_a) {
                url = "https://api.tabletcloud.com.br/token";
                try {
                    data = qs.stringify({
                        'username': 'marcelo@vlks.com.br',
                        'password': 'ozts-9195-5667-7475@5977919',
                        'grant_type': 'password',
                        'client_id': '2824',
                        'client_secret': 'KHDG-7533-5465-0564'
                    });
                    config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: url,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: data
                    };
                    axios.request(config)
                        .then(function (response) {
                        // console.log(JSON.stringify(response.data));
                    })
                        .catch(function (error) {
                        console.log(error);
                    });
                }
                catch (error) {
                    console.error("\x1b[31m%s\x1b[0m", "Erro GET Token Tabletcloud", error.response.status, error.response.statusText);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    Business.prototype.addProductsToClientProductsList = function (clientRequest, productList) {
        try {
            var productClient = this.clientList[clientRequest.costumerWAId].productListClient;
            for (var _i = 0, productList_1 = productList; _i < productList_1.length; _i++) {
                var prod = productList_1[_i];
                for (var qtd = 0; qtd < prod.orderQtdProd; qtd++) {
                    var productCopy = __assign({}, this.productList[prod.codeProd]);
                    productCopy.AdditionalList = {};
                    productCopy.orderQtdProd = 1;
                    productClient.push(productCopy);
                }
            }
            console.log('addProductsToClientProductsList, productListClient');
            console.table(this.clientList[clientRequest.costumerWAId].productListClient);
        }
        catch (error) {
            if (!this.clientList[clientRequest.costumerWAId]) {
                console.log("Cliente ".concat(clientRequest.costumerWAId, " n\u00E3o existe!"));
            }
            console.log("\nError: ".concat(error.response.data));
        }
    };
    Business.prototype.addAdditionalsToFullAdditionalList = function (clientRequest) {
        try {
            var fullAdditionalList = [];
            var productClient = this.clientList[clientRequest.costumerWAId].productListClient;
            var product = this.productList;
            for (var _i = 0, productClient_1 = productClient; _i < productClient_1.length; _i++) {
                var prod = productClient_1[_i];
                for (var _a = 0, _b = Object.values(product[prod.codeProd].AdditionalList); _a < _b.length; _a++) {
                    var add = _b[_a];
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
    };
    Business.prototype.writeClientOrderToDB = function (botClient, produtos) {
        return __awaiter(this, void 0, void 0, function () {
            var clientData, data, error_9, error_10, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        return [4 /*yield*/, this.readBotProductDB(botClient.phoneNumberClient)];
                    case 1:
                        clientData = _a.sent();
                        data = {
                            "numberClient": botClient.phoneNumberClient,
                            "name": botClient.nameClient,
                            "orderCode": botClient.orderCodeClient,
                            "conversationContext": botClient.contextClient,
                            "addressClient": botClient.addressClient,
                            "botNumberID": this.botNumberID // "botNumberID": this.botNumberID
                            // "chatHistory": botClient.chatHistory,            // "chatHistory": botClient.chatHistory,
                        };
                        if (!(clientData !== null)) return [3 /*break*/, 11];
                        if (!clientData) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios.put("http://lojas.vlks.com.br/api/BotProduct/".concat(this.botNumberID, "/").concat(botClient.phoneNumberClient), data)
                                .then(function (response) {
                                console.log(response.data);
                                console.log("Pedido de '".concat(botClient.phoneNumberClient, "' alterado com sucesso!"));
                            })
                                .catch(function (error) {
                                console.error("\x1b[31m%s\x1b[0m", 'error on PUT writeClientOrderToDB', error.response.data);
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição POST:');
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 10];
                    case 6:
                        if (!(clientData === undefined)) return [3 /*break*/, 10];
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, axios.post('http://lojas.vlks.com.br/api/BotProduct', data)
                                .then(function (response) {
                                console.log(response.data);
                                console.log("Pedido de '".concat(botClient.phoneNumberClient, "' criado com sucesso!"));
                            })
                                .catch(function (error) {
                                console.error("\x1b[31m%s\x1b[0m", 'error on POST writeClientOrderToDB');
                            })];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_10 = _a.sent();
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na requisição PUT:');
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        console.error("\x1b[31m%s\x1b[0m", 'Erro na obtenção dos dados do cliente.');
                        _a.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        error_11 = _a.sent();
                        console.log("N\u00E3o foi possivel adionar o cliente [".concat(botClient.phoneNumberClient, "] a clientList.\nError: ").concat(error_11.response.data));
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.readBotProductDB = function (phoneNumberClient) {
        if (phoneNumberClient === void 0) { phoneNumberClient = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = phoneNumberClient
                            ? "http://lojas.vlks.com.br/api/BotProduct/".concat(this.botNumberID, "/").concat(phoneNumberClient)
                            : "http://lojas.vlks.com.br/api/BotProduct/".concat(this.botNumberID);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.length === 0 ? undefined : response.data];
                    case 3:
                        error_12 = _a.sent();
                        console.error("\x1b[31m%s\x1b[0m", "Erro ao tentar ler dados de '".concat(phoneNumberClient, "'"), error_12.response.status, error_12.response.statusText);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.readProductAdditionalDB = function (codigoProduto) {
        return __awaiter(this, void 0, void 0, function () {
            var config, additionals, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            url: "http://printweb.vlks.com.br/LoginAPI/Modificadores/".concat(codigoProduto),
                            headers: {}
                        };
                        return [4 /*yield*/, axios.request(config)];
                    case 1:
                        additionals = _a.sent();
                        return [2 /*return*/, additionals.data];
                    case 2:
                        error_13 = _a.sent();
                        console.error("\x1b[31m%s\x1b[0m", "Erro ao buscar o modificador do produto '".concat(codigoProduto, "'\n"), error_13.response.status, error_13.response.statusText);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param message Param text['body'] must be at most 4096 characters long.
     * @param costumerWAId
     * @param functionName
     * @param message_id
     * @returns
     */
    Business.prototype.sendWATextMessage = function (message, costumerWAId, functionName, message_id) {
        var _this = this;
        if (functionName === void 0) { functionName = ""; }
        if (message_id === void 0) { message_id = ''; }
        var messageList = [message];
        if (message.length > 4096) {
            messageList = this.treatLongMessage(message);
        }
        return new Promise(function (resolve, reject) {
            for (var _i = 0, messageList_1 = messageList; _i < messageList_1.length; _i++) {
                var msg = messageList_1[_i];
                var data = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": costumerWAId,
                    "type": "text",
                    "text": {
                        "preview_url": false,
                        "body": msg
                    }
                };
                if (message_id) {
                    data["context"] = {
                        "message_id": message_id
                    };
                    console.log(JSON.stringify(data, null, 2));
                }
                var config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: "https://graph.facebook.com/v17.0/".concat(_this.botNumberID, "/messages"),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer ".concat(_this.FBTOKEN)
                    },
                    data: JSON.stringify(data)
                };
                axios.request(config)
                    .then(function (response) {
                    // console.log(JSON.stringify(response.data));
                    resolve();
                })
                    .catch(function (error) {
                    console.error("\x1b[31m%s\x1b[0m", "Erro ao enviar mensagem em '".concat(functionName, "'\n").concat(error.message));
                    reject(error);
                });
            }
        });
    };
    Business.prototype.treatLongMessage = function (message) {
        var maxIndex = 4096;
        var NLindex = 0;
        var messageList = [];
        var times = message.length / maxIndex;
        for (var j = 0; j < times; j++) {
            for (var i = maxIndex; i > 0; i--) {
                if (message[i] === '\n') {
                    NLindex = i;
                    break;
                }
            }
            messageList.push(message.slice(0, NLindex));
            message = message.slice(NLindex);
        }
        return messageList;
    };
    Business.prototype.sendWAImageMessage = function (imageUrl) {
        var data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": "554791025923",
            "type": "image",
            "image": {
                "link": imageUrl
            }
        });
        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: "https://graph.facebook.com/v17.0/".concat(this.botNumberID, "/messages"),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer ".concat(this.FBTOKEN)
            },
            data: data
        };
        axios.request(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
            .catch(function (error) {
            console.log(error);
        });
    };
    Business.prototype.extractProductOrdersFromMessage = function (mensagem) {
        var regexMesa = /Mesa: (\d+)/;
        var regexCodigo = /Cod: (\d+)/;
        var regexPedido = /(\d+) - ([^\n]+) \.\.\.\.\.\. R\$ ([\d,]+)/;
        var regexTotal = /Total do pedido: R\$ ([\d,]+)/;
        var regexSabores = /Sabores:/;
        var regexQtdSabores = /(\d+) - (\d+)/;
        var regexVazia = /^\s*\n/gm;
        var mesa = null;
        var pedidos = [];
        var totalPedido = null;
        var lines = mensagem.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.match(regexMesa)) {
                mesa = line.match(regexMesa)[1];
            }
            else if (line.match(regexCodigo)) {
                var codigo = line.match(regexCodigo)[1];
                line = lines[i + 1].trim();
                var _a = line.match(regexPedido), quantidade = _a[1], nome = _a[2], preco = _a[3];
                if (codigo && quantidade && nome && preco) {
                    ++i;
                    line = lines[i + 1].trim();
                    var addList = {};
                    if (line.match(regexSabores)) {
                        ++i;
                        do {
                            line = lines[++i].trim();
                            var _b = line.match(regexQtdSabores), qtdSabor = _b[1], codSabor = _b[2];
                            addList[codSabor] = {
                                ProductCode: codigo,
                                AddCode: codSabor,
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
    };
    Business.prototype.mostRecommendProduct = function (clientRequest) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var productListClient, productList, recProducts, mostRec, i, _i, productListClient_1, prod, currentCode, message, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        productListClient = this.clientList[clientRequest.costumerWAId].productListClient;
                        productList = this.productList;
                        recProducts = {};
                        mostRec = void 0;
                        for (i = 0; i < productListClient.length; i++) {
                            if (productList[productListClient[i].codeProd].recommendedProductCode) {
                                mostRec = {
                                    count: 0,
                                    recCodeProd: productList[productListClient[i].codeProd].recommendedProductCode,
                                    codeProd: productList[productListClient[i].codeProd].codeProd
                                };
                                break;
                            }
                        }
                        if (!mostRec) return [3 /*break*/, 3];
                        for (_i = 0, productListClient_1 = productListClient; _i < productListClient_1.length; _i++) {
                            prod = productListClient_1[_i];
                            if ((_a = this.productList[prod.codeProd]) === null || _a === void 0 ? void 0 : _a.recommendedProductCode) {
                                currentCode = this.productList[prod.codeProd].recommendedProductCode;
                                if (!recProducts[currentCode]) {
                                    recProducts[currentCode] = {
                                        count: 1,
                                        recCodeProd: currentCode,
                                        codeProd: prod.codeProd
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
                        console.log('Recommended Products');
                        console.table(recProducts);
                        console.log('Most Recommended Product');
                        console.table(mostRec);
                        this.clientList[clientRequest.costumerWAId].recomendedProduct = mostRec;
                        message = "_*".concat(clientRequest.costumerName, "!*_ Sabe o que vai super bem com _*").concat(this.productList[mostRec.codeProd].nameProd, "*_?\n\n");
                        message += "_*".concat(this.productList[mostRec.recCodeProd].nameProd, "*_ !!!\uD83E\uDD29\n\n");
                        message += "Por apenas R$ _*".concat((this.productList[mostRec.recCodeProd].priceProd).toFixed(2).replace('.', ','), "*_\n");
                        message += "*Aproveite!!!*\n\n";
                        message += "_*".concat(this.clientList[clientRequest.costumerWAId].fullAdditionalList.length + 1, "*_ \u2022 Quero incluir _*").concat(this.productList[mostRec.recCodeProd].nameProd, "*_ com certeza! \uD83D\uDE0B");
                        return [4 /*yield*/, this.sendWATextMessage(message, clientRequest.costumerWAId, 'mostRecommendProduct')];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.sendWAImageMessage(this.productList[mostRec.recCodeProd].imageProdUrl)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_14 = _b.sent();
                        console.error("\x1b[31m%s\x1b[0m", 'Erro em mostRecommendProduct', error_14);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.largestPrepTime = function (clientRequest) {
        var productList = this.clientList[clientRequest.costumerWAId].productListClient;
        var largestPrepTime = 0;
        for (var _i = 0, _a = Object.values(productList); _i < _a.length; _i++) {
            var product = _a[_i];
            if (product.preparationTime > largestPrepTime)
                largestPrepTime = product.preparationTime;
        }
        return largestPrepTime;
    };
    Business.prototype.categoryEmoji = function (category) {
        switch (category.toUpperCase()) {
            case 'VESTUARIO':
                return '👕';
            case 'BEBIDAS':
                return '🥤';
            case 'COMIDAS':
                return '🍽️';
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
            default:
                return '🛍️';
        }
    };
    // ------------------ INTENTS ------------------ //
    /**
     * Envia mensagem de boas vindas
     * @param recipientId
     * @param botNumberId
     */
    Business.prototype.greatingsMessage = function (clientRequest) {
        var message = "Ol\u00E1! \uD83D\uDE04 Eu sou *".concat(this.botName, "*, assistente virtual da *").concat(this.name, "*!\n\uD83E\uDD16 Estou pronto para agilizar e facilitar o seu atendimento. \uD83D\uDE80");
        message += "\n\nUse os n\u00FAmeros para pedir e, pronto, o pedido est\u00E1 feito! \uD83C\uDF2E Simples assim! \uD83C\uDF1F";
        message += "\n\nPara dar uma olhada no nosso *card\u00E1pio*, \u00E9 s\u00F3 clicar no link! \uD83C\uDF54\uD83D\uDC40 \n\nhttp://printweb.vlks.com.br/Empresas/3264/Cardapio3/Index.html";
        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'greatingsMessage');
    };
    Business.prototype.askAdditional = function (clientRequest, orderListData) {
        var _a;
        if (orderListData === void 0) { orderListData = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var BotClient, i, message, productListClient, j, numProd, k, emoji, _i, _b, add, error_15, error_16;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        BotClient = this.clientList[clientRequest.costumerWAId];
                        if ((_a = orderListData.products) === null || _a === void 0 ? void 0 : _a.length) {
                            BotClient.tableClient = orderListData.table;
                            BotClient.totalOrderPrice = orderListData.totalCost;
                            console.log("Pedido de ".concat(clientRequest.costumerName, ":"));
                            console.table(orderListData.products);
                            this.addProductsToClientProductsList(clientRequest, orderListData.products);
                            this.addAdditionalsToFullAdditionalList(clientRequest);
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        i = 0;
                        message = "J\u00E1 anotei! \uD83D\uDE0A \nEnvie *um n\u00FAmero por vez* e o *adicional* ser\u00E1 incluido ao seu pedido!\n";
                        message += "Voc\u00EA tamb\u00E9m pode incluir uma *observa\u00E7\u00E3o especial* para cada produto. \u2728";
                        productListClient = Object.values(BotClient.productListClient);
                        for (j = 0; j < productListClient.length; j++) {
                            numProd = 0;
                            for (k = 0; k <= j; k++)
                                if (productListClient[j].nameProd === productListClient[k].nameProd)
                                    ++numProd;
                            emoji = this.categoryEmoji(productListClient[j].categoryProd);
                            message += "\n\n ".concat(emoji, " Adicionais ").concat(numProd, "\u00BA _*").concat(productListClient[j].nameProd, "*_:");
                            for (_i = 0, _b = Object.values(this.productList[productListClient[j].codeProd].AdditionalList); _i < _b.length; _i++) {
                                add = _b[_i];
                                message += "\n _*".concat(++i, "*_ \u2022 ").concat(add.nameAdd, " - ").concat(add.priceAdd.toFixed(2).replace('.', ','));
                            }
                            message += "\n_*".concat(++i, "*_ \u2022 Incluir observa\u00E7\u00E3o.");
                        }
                        message += "\n\n_*0*_ \u2022 *Concluir* e *revisar* pedido. \uD83D\uDED2\u2705";
                        if (!BotClient.chatHistory) {
                            this.clientList[clientRequest.costumerWAId].chatHistory = [];
                        }
                        this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
                        return [4 /*yield*/, this.sendWATextMessage(message, clientRequest.costumerWAId, 'askAdditional')];
                    case 2:
                        _c.sent();
                        if (!!BotClient.recomendedProduct) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.mostRecommendProduct(clientRequest)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_15 = _c.sent();
                        console.error("\x1b[31m%s\x1b[0m", 'Erro ao criar a mensagem em askAdditional', error_15);
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_16 = _c.sent();
                        console.error("\x1b[31m%s\x1b[0m", 'Erro askAdditional');
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Business.prototype.includeAdditional = function (clientRequest) {
        try {
            var BotClient = this.clientList[clientRequest.costumerWAId];
            var additionalClient = BotClient.fullAdditionalList[parseInt(clientRequest.textMessage) - 1];
            console.log('additionalClient');
            console.table(additionalClient);
            var prodIndex = 0;
            for (var i = 0; i < BotClient.fullAdditionalList.length; i++) {
                if ("observation" in BotClient.fullAdditionalList[i])
                    ++prodIndex;
                if (i === parseInt(clientRequest.textMessage) - 1)
                    break;
            }
            var productClient = BotClient.productListClient[prodIndex];
            console.log('productClient:\n', productClient);
            var product = this.productList[productClient.codeProd];
            var additional_1 = product.AdditionalList[additionalClient.AddCode];
            console.log('additional:\n', additional_1);
            var message = void 0;
            if (!product.qtdMaxAdditionals ||
                Object.values(productClient.AdditionalList).length < product.qtdMaxAdditionals ||
                Object.values(productClient.AdditionalList).length === product.AdditionalList.length) {
                if (Object.values(productClient.AdditionalList).some(function (add) { return add.AddCode === additional_1.AddCode; })) {
                    message = "Opa, _*".concat(additional_1.nameAdd, "*_ j\u00E1 foi inclu\u00EDdo.\n");
                }
                else {
                    message = "Ok, _*".concat(additional_1.nameAdd, "*_.");
                    productClient.AdditionalList[additional_1.AddCode] = (__assign({}, additional_1));
                    console.log('includeAdditional, productClient');
                    console.table(productClient);
                    if (additional_1.qtdMaxAdd) {
                        message += "\n\nQual a *quantidade* desejada?\nVoc\u00EA pode adicionar at\u00E9 um m\u00E1ximo de ".concat(additional_1.qtdMaxAdd, "!");
                        this.clientList[clientRequest.costumerWAId].contextClient = 'qtd_adicionais';
                    }
                    else {
                        message += "\nMais alguma coisa?";
                    }
                }
            }
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeAdditional');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro em includeAdditional', error);
        }
    };
    Business.prototype.quantityAdditional = function (clientRequest) {
        try {
            var BotClient = this.clientList[clientRequest.costumerWAId];
            BotClient.errorQtdAdd = BotClient.errorQtdAdd ? BotClient.errorQtdAdd : 1;
            var additionalClient = BotClient.fullAdditionalList[parseInt(BotClient.chatHistory[BotClient.chatHistory.length - 1]) - 1 * BotClient.errorQtdAdd];
            var additional = this.productList[additionalClient.ProductCode].AdditionalList[additionalClient.AddCode];
            var message = void 0;
            if (parseInt(clientRequest.textMessage) > additional.qtdMaxAdd) {
                message = "N\u00E3o \u00E9 possivel adicionar ".concat(clientRequest.textMessage, " ").concat(additional.nameAdd, "!\nEscolha uma quantidade de no *m\u00E1ximo* ").concat(additional.qtdMaxAdd, ".");
                BotClient.errorQtdAdd += 1;
            }
            else {
                message = "Ok, ent\u00E3o fica *".concat(clientRequest.textMessage, " ").concat(additional.nameAdd, "*, no total de +R$ ").concat((parseInt(clientRequest.textMessage) * additional.priceAdd).toFixed(2).replace('.', ','));
                message = "\n\nDigite o numero do adicional para continuar incluindo.";
                message = "\n\n*_0_* \u2022 Voltar para a lista de pedidos.";
            }
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'quantityAdditional');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao quantityAdditional');
        }
    };
    Business.prototype.includeObservation = function (clientRequest) {
        try {
            var message = "Por favor, *descreva* a *observa\u00E7\u00E3o* desejada.\n\nEx: Sem cebola, guardanapo extra";
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeObservation');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao includeObservation');
        }
    };
    Business.prototype.confirmObservation = function (clientRequest) {
        try {
            var BotClient = this.clientList[clientRequest.costumerWAId];
            BotClient.chatHistory.push(clientRequest.textMessage);
            var prodIndex = 0;
            for (var i = 0; i < BotClient.fullAdditionalList.length; i++) {
                if ("observation" in BotClient.fullAdditionalList[i])
                    ++prodIndex;
                if (i === parseInt(BotClient.chatHistory[BotClient.chatHistory.length - 2]))
                    break;
            }
            var productClient = BotClient.productListClient[prodIndex];
            if (typeof productClient.observationClient === 'undefined')
                productClient.observationClient = '';
            productClient.observationClient = clientRequest.textMessage;
            var message = "Certo, *observa\u00E7\u00E3o anotada*!\n\"".concat(productClient.observationClient, "\"");
            message += "\n\nDeseja incluir mais algum adicional ou observa\u00E7\u00E3o?\n```Digite o numero do item```";
            console.log('observationClient', this.clientList[clientRequest.costumerWAId].productListClient[prodIndex].observationClient);
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'confirmObservation');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao confirmObservation', error);
        }
    };
    Business.prototype.includeRecommendedProduct = function (clientRequest) {
        var BotClient = this.clientList[clientRequest.costumerWAId];
        var product = __assign({}, this.productList[BotClient.recomendedProduct.recCodeProd]);
        product.AdditionalList = {};
        product.orderQtdProd = 1;
        console.log('includeRecommendedProduct, recommendedProduct', this.productList[BotClient.recomendedProduct.recCodeProd]);
        BotClient.productListClient.push(product);
        var message = "Incr\u00EDvel!!!";
        message += "\nQuantos _*".concat(product.nameProd, "*_ voc\u00EA gostaria de acrescentar a sua lista de pedidos?");
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'includeRecommendedProduct');
    };
    Business.prototype.quantityRecommendedProduct = function (clientRequest) {
        var BotClient = this.clientList[clientRequest.costumerWAId];
        var productClient = BotClient.productListClient[BotClient.productListClient.length - 1];
        var orderListData = {
            table: BotClient.tableClient,
            products: [{
                    codeProd: productClient.codeProd,
                    nameProd: productClient.nameProd,
                    priceProd: productClient.priceProd,
                    orderQtdProd: parseInt(clientRequest.textMessage),
                    AdditionalList: {}
                }],
            totalCost: BotClient.totalOrderPrice
        };
        this.askAdditional(clientRequest, orderListData);
    };
    Business.prototype.noContextMessage = function (clientRequest) {
        try {
            var message = "Responda com o _numero_ correspondente do item que deseja _selecionar_.\n\nPor favor, envie _um_ valor _por mensagem_ e aguarde a resposta.";
            var data = JSON.stringify({
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": clientRequest.costumerWAId,
                "type": "text",
                "text": {
                    "preview_url": false,
                    "body": message
                }
            });
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'noContextMessage');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao noContextMessage');
        }
    };
    Business.prototype.reviewOrder = function (clientRequest) {
        try {
            var productListClient = this.clientList[clientRequest.costumerWAId].productListClient;
            var totalOrderPrice = this.clientList[clientRequest.costumerWAId].totalOrderPrice;
            totalOrderPrice = 0;
            var message = "Seu pedido:";
            for (var _i = 0, productListClient_2 = productListClient; _i < productListClient_2.length; _i++) {
                var product = productListClient_2[_i];
                var orderQtdProd = product.orderQtdProd ? product.orderQtdProd : 1;
                totalOrderPrice += orderQtdProd * product.priceProd;
                message += "\n\u2022 ".concat(orderQtdProd, " ").concat(product.nameProd, " - R$ ").concat((orderQtdProd * product.priceProd).toFixed(2).replace('.', ','));
                for (var _a = 0, _b = Object.values(product.AdditionalList); _a < _b.length; _a++) {
                    var add = _b[_a];
                    var orderQtdAdd = add.orderQtdAdd ? add.orderQtdAdd : 1;
                    totalOrderPrice += orderQtdAdd * add.priceAdd;
                    message += "\n\t".concat(orderQtdAdd, " ").concat(add.nameAdd, " + R$ ").concat((orderQtdAdd * add.priceAdd).toFixed(2).replace('.', ','));
                }
                if (product.observationClient)
                    message += "\n\tObserva\u00E7\u00E3o: \"".concat(product.observationClient, "\"");
                message += "\n";
            }
            message += "\nTotal do pedido: ".concat(totalOrderPrice.toFixed(2).replace('.', ','));
            message += "\n____________________________________";
            message += "\n\n_*1*_ \u2022 Editar pedido \u270F\uFE0F";
            message += "\n\n_*0*_ \u2022 Finalizar pedido \u2705";
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'reviewOrder');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao reviewOrder');
        }
    };
    Business.prototype.askProductForEdit = function (clientRequest) {
        try {
            var productClient = this.clientList[clientRequest.costumerWAId].productListClient;
            var message = "Qual produto voc\u00EA deseja editar?";
            for (var i = 0; i < productClient.length; i++) {
                message += "\n\n_*".concat(i + 1, "*_ \u2022 ").concat(productClient[i].nameProd);
            }
            message += "\n\n_*0*_ \u2022 Deixa pra l\u00E1. Finalizar pedido \uD83D\uDED2";
            this.clientList[clientRequest.costumerWAId].editingOrder = true;
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'askProductForEdit');
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao editOrder');
        }
    };
    Business.prototype.editOrder = function (clientRequest) {
        var productClient = this.clientList[clientRequest.costumerWAId].productListClient[parseInt(clientRequest.textMessage) - 1];
        productClient.AdditionalList = {};
        productClient.observationClient = '';
        var message = "Certo! Deletei as inclus\u00F5es de _*".concat(productClient.nameProd, "*_.\n\n");
        message += "Digite o numero para incluir novos adicionais da lista.\n\n";
        message += "```Os *outros produtos* continuam com os adicionais escolhidos anteriormente```";
        this.sendWATextMessage(message, clientRequest.costumerWAId, 'editOrder', this.clientList[clientRequest.costumerWAId].orderMessageId);
    };
    Business.prototype.checkClientRegistration = function (clientRequest) {
        try {
            var clientData = false;
            // const clientData = this.readClientFromCupomDB()
            if (!clientData) {
                var message = "Verificiamos que voc\u00EA ainda n\u00E3o possui cadastro conosco!\n\n";
                message += "Para deixar seu atendimento mais r\u00E1pido e pr\u00E1tico, gostaria de cadastrar seus dados?\n \u00C9 rapidinho! ";
                message += "\n\n_*1*_ Sim, por favor!";
                message += "\n\n_*0*_ N\u00E3o, obrigado!";
                this.sendWATextMessage(message, clientRequest.costumerWAId, 'checkClientRegistration');
            }
            else {
                this.clientList[clientRequest.costumerWAId].contextClient = 'aguardar_pedido';
                this.sendToPreparation(clientRequest);
            }
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao checkClientRegistration');
        }
    };
    Business.prototype.sendToPreparation = function (clientRequest) {
        try {
            var prepTime = this.largestPrepTime(clientRequest);
            var message = "\u00D3timo!! seu pedido j\u00E1 esta sendo preparado! \uD83D\uDE4C";
            if (this.showPrepTime) {
                message += "\nTempo de espera \u00E9 de aproximadamente *".concat(prepTime, "* minutos \uD83D\uDE09");
            }
            this.sendWATextMessage(message, clientRequest.costumerWAId, 'sendToPreparation');
            this.clientList[clientRequest.costumerWAId].chatHistory.push(clientRequest.textMessage);
            console.log("Pedido ".concat(clientRequest.costumerName, " :"));
            console.table(this.clientList[clientRequest.costumerWAId].productListClient);
            // fs.writeFileSync(`./clientObject/${clientRequest.costumerName}.json`, JSON.stringify(this.clientList[clientRequest.costumerWAId], null, 2))
            delete this.clientList[clientRequest.costumerWAId];
            console.log('Token:', this.getTokenTabletcloud());
        }
        catch (error) {
            console.error("\x1b[31m%s\x1b[0m", 'Erro na funcao sendToPreparation', error);
        }
    };
    return Business;
}());
exports.default = Business;
//# sourceMappingURL=business.js.map