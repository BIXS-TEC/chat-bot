"use strict";
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
var client_1 = require("./client");
var Controller = /** @class */ (function () {
    function Controller() {
        this._businessList = {};
    }
    Controller.prototype.postRequest = function (req, res) {
        this._clientRequest = new client_1.default(req, res);
        try {
            if (this._clientRequest.messagesObject) { // Se a mensagem é do tipo "message"
                if (!this._businessList[this._clientRequest.botNumberID].orders.ordersList[this._clientRequest.costumerWAId]) { // Se o cliente não esta na orderList
                    // Adiciona cliente ao banco de dados e a orderList do estabelecimento
                    this.writeClientToBusinessOrderListDB(this._clientRequest.botNumberID, this.createClient(this._clientRequest.costumerName, this._clientRequest.costumerWAId));
                    console.log("cliente nao existe!!!");
                }
                if (this._clientRequest.typeMessage === "text") {
                    this.handleClientContext(this._clientRequest.botNumberID, this._clientRequest);
                }
                else if (this._clientRequest.typeMessage === "interactive") {
                    this.handleButton(this._clientRequest.costumerWAId, this._clientRequest.idButton);
                }
            }
            else if (this._clientRequest.statusesObject) {
                console.log(this._clientRequest.messageStatus);
            }
            res.sendStatus(200);
        }
        catch (error) {
            if (!this._businessList[this._clientRequest.botNumberID]) {
                console.log("Business ".concat(this._businessList[this._clientRequest.botNumberID], " nao existe"));
            }
            else if (!this._businessList[this._clientRequest.botNumberID].orders) {
                console.log("Objeto orders ".concat(this._businessList[this._clientRequest.botNumberID], ".orders nao existe"));
            }
            else if (!this._businessList[this._clientRequest.botNumberID].orders.ordersList[this._clientRequest.costumerWAId]) {
                console.log("Cliente ".concat(this._businessList[this._clientRequest.botNumberID].orders.ordersList[this._clientRequest.costumerWAId], " nao existe"));
            }
        }
    };
    Object.defineProperty(Controller.prototype, "businessList", {
        // BUSINESS
        /**
         * Retorna um objeto business da _businessList especificado por name 1692626214
         * @param name
         * @returns
        */
        get: function () {
            return this._businessList;
        },
        enumerable: false,
        configurable: true
    });
    Controller.prototype.getBusinessName = function (phone_number_id) {
        return this._businessList[phone_number_id].name;
    };
    /**
     *
     * @param name
     * @param FBTOKEN
     * @param botNumberID
     * @param botNumber
     * @param orders
     * @param products
     * @param botChat
     * @returns
     */
    Controller.prototype.createBusiness = function (name, FBTOKEN, botNumberID, botNumber, orders, products, botChat) {
        if (orders === void 0) { orders = { ordersList: {} }; }
        if (products === void 0) { products = []; }
        if (botChat === void 0) { botChat = {}; }
        var business = {
            name: name,
            FBTOKEN: FBTOKEN,
            botNumberID: botNumberID,
            botNumber: botNumber,
            orders: orders,
            products: products,
            botChat: botChat
        };
        return business;
    };
    /**
     * Adiciona um objeto business do tipo Business com o nome definidor por name, na _businessList do controller
     * @param phone_number_id
     * @param business
    */
    Controller.prototype.writeBusinessDB = function (business) {
        var _this = this;
        this._businessList[business.botNumberID] = business;
        this._businessList[business.botNumberID].products ? null : console.log("".concat(business.botNumberID, " created with empty products list"));
        this._businessList[business.botNumberID].orders ? null : console.log("".concat(business.botNumberID, " created with empty orders list"));
        this._businessList[business.botNumberID].botChat ? null : console.log("".concat(business.botNumberID, " created with empty botChat list"));
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var businessData, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readBusinessDB(business.botNumberID)];
                    case 1:
                        businessData = _a.sent();
                        data = {
                            "name": business.name,
                            "FBTOKEN": business.FBTOKEN,
                            "botNumberID": business.botNumberID,
                            "botNumber": business.botNumber,
                            "IdFilial": 3264
                        };
                        if (businessData !== null) {
                            if (businessData && businessData.find(function (obj) { return obj.botNumberID === business.botNumberID; })) {
                                try {
                                    axios.put("http://lojas.vlks.com.br/api/BotBusiness/".concat(business.botNumberID), data)
                                        .then(function (response) {
                                        console.log(response.data);
                                    })
                                        .catch(function (error) {
                                        console.error('error in PUT');
                                    });
                                    console.log("Business '".concat(business.botNumberID, "' alterado com sucesso!"));
                                }
                                catch (error) {
                                    console.error('Erro na requisição POST:');
                                }
                            }
                            else {
                                try {
                                    axios.post('http://lojas.vlks.com.br/api/BotBusiness', data)
                                        .then(function (response) {
                                        console.log(response.data);
                                    })
                                        .catch(function (error) {
                                        console.error('error in POST');
                                    });
                                    console.log("Business '".concat(business.botNumberID, "' criado com sucesso!"));
                                }
                                catch (error) {
                                    console.error('Erro na requisição PUT:');
                                }
                            }
                        }
                        else {
                            console.error('Erro na obtenção dos dados do negocio.');
                        }
                        return [2 /*return*/];
                }
            });
        }); })();
    };
    Controller.prototype.readBusinessDB = function (botNumberID) {
        if (botNumberID === void 0) { botNumberID = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_1;
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
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Controller.prototype.deleteBusinessDB = function (botNumberID) {
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
    Controller.prototype.findBussiness = function (phone_number_id) {
        return this._businessList[phone_number_id];
    };
    Controller.prototype.addProductToBusiness = function (botNumberID, productList) {
        var _a;
        try {
            (_a = this._businessList[botNumberID].products).push.apply(_a, productList);
        }
        catch (error) {
            console.log("Business with ID ".concat(botNumberID, " not found.\nError: ").concat(error.message));
        }
        return;
    };
    Controller.prototype.createIntent = function (name, activationText, context, response) {
        var intent = {
            name: name,
            activationText: activationText,
            context: context,
            response: response
        };
        return intent;
    };
    Controller.prototype.writeIntentToBusinessDB = function (botNumberID, intent) {
        var _this = this;
        var _a;
        try {
            if ((_a = this._businessList[botNumberID].botChat) === null || _a === void 0 ? void 0 : _a[intent.name]) {
                console.log("Intent: ".concat(this._businessList[botNumberID].botChat[intent.name], "\nHas been overwritten by intent\n").concat(intent));
            }
            this._businessList[botNumberID].botChat[intent.name] = intent;
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var intentData, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.readIntentFromBusinessDB(botNumberID, intent.name)];
                        case 1:
                            intentData = _a.sent();
                            data = {
                                "name": intent.name,
                                "activationText": intent.activationText[0],
                                "context": intent.context[0] //alterar banco de dados para array ou lista de string
                            };
                            if (intentData !== null) {
                                if (intentData) {
                                    try {
                                        axios.put("http://lojas.vlks.com.br/api/BotIntent/".concat(intent.name), data)
                                            .then(function (response) {
                                            console.log(response.data);
                                        })
                                            .catch(function (error) {
                                            console.error('error in PUT');
                                        });
                                        console.log("Intent '".concat(intent.name, "' de '").concat(botNumberID, "' alterada com sucesso!"));
                                    }
                                    catch (error) {
                                        console.error('Erro na requisição POST:');
                                    }
                                }
                                else if (intentData === undefined) {
                                    try {
                                        axios.post('http://lojas.vlks.com.br/api/BotIntent', data)
                                            .then(function (response) {
                                            console.log(response.data);
                                        })
                                            .catch(function (error) {
                                            console.error('error in POST');
                                        });
                                        console.log("Intent '".concat(intent.name, "' de '").concat(botNumberID, "' criado com sucesso!"));
                                    }
                                    catch (error) {
                                        console.error('Erro na requisição PUT:');
                                    }
                                }
                            }
                            else {
                                console.error('Erro na obtenção dos dados da Intent.');
                            }
                            return [2 /*return*/];
                    }
                });
            }); })();
        }
        catch (error) {
            console.log(this._businessList[botNumberID].botChat, "\n");
            console.log("Could not add Intent to botChat.\nIntent : ".concat(intent.name, "\nError: ").concat(error.message));
        }
    };
    // Requisição da intenção deve ser sempre referenciado ao botNumberId 
    // (não há necessidade de requisitar todas as intenções cadastradas por qualquer bot, apenas para cada um)
    Controller.prototype.readIntentFromBusinessDB = function (botNumberID, intentName) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = botNumberID
                            ? "http://lojas.vlks.com.br/api/BotIntent/".concat(intentName) // alterar para http://lojas.vlks.com.br/api/BotIntent/${botNumberID}/${intent.name}
                            : "http://lojas.vlks.com.br/api/BotIntent";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.length === 0 ? undefined : response.data];
                    case 3:
                        error_2 = _a.sent();
                        console.error(error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Controller.prototype.createClient = function (name, numberClient, addressClient, chatHistory, conversationContext, table, BotProdutoPedidos) {
        if (addressClient === void 0) { addressClient = ""; }
        if (chatHistory === void 0) { chatHistory = []; }
        if (conversationContext === void 0) { conversationContext = 'nenhum'; }
        if (table === void 0) { table = 0; }
        if (BotProdutoPedidos === void 0) { BotProdutoPedidos = []; }
        var client = {
            name: name,
            orderCode: Math.random().toString(36).substring(2, 7),
            numberClient: numberClient,
            table: table,
            addressClient: addressClient,
            chatHistory: chatHistory,
            conversationContext: conversationContext,
            BotProdutoPedidos: BotProdutoPedidos
        };
        return client;
    };
    /**
     * Criar ou modificar o dado de um cliente no banco de dados BotProdutoPedido
     * @param botNumberID Numero ID do bot do estabelecimento
     * @param clientID Numero do WA do cliente
     */
    Controller.prototype.writeClientToBusinessOrderListDB = function (botNumberID, clientID) {
        var _this = this;
        try {
            if (!this._businessList[botNumberID].orders.ordersList) { // Deprecated
                console.log('OrderList inicializada (Lembre-se de inicializar order e orderList ao criar um novo negocio!)');
                this._businessList[botNumberID].orders.ordersList = {};
            }
            this._businessList[botNumberID].orders.ordersList[clientID.numberClient] = clientID;
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var clientData, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.readClientFromBusinessDB(botNumberID, clientID.numberClient)];
                        case 1:
                            clientData = _a.sent();
                            data = {
                                "numberClient": clientID.numberClient,
                                "name": clientID.name,
                                "orderCode": clientID.orderCode,
                                "conversationContext": clientID.conversationContext,
                                "addressClient": clientID.addressClient,
                                "chatHistory": clientID.chatHistory,
                                "botNumberID": botNumberID
                            };
                            console.log('\n\n---data: \n', data);
                            if (clientData !== null) {
                                if (clientData) {
                                    try {
                                        axios.put("http://lojas.vlks.com.br/api/BotClient/".concat(botNumberID, "/").concat(clientID.numberClient), data)
                                            .then(function (response) {
                                            console.log(response.data);
                                        })
                                            .catch(function (error) {
                                            console.error('error on PUT BusinessOrderList', error.response.data);
                                        });
                                        console.log("Client '".concat(clientID.numberClient, "' de '").concat(botNumberID, "' alterado com sucesso!"));
                                    }
                                    catch (error) {
                                        console.error('Erro na requisição POST:');
                                    }
                                }
                                else if (clientData === undefined) {
                                    try {
                                        axios.post('http://lojas.vlks.com.br/api/BotClient', data)
                                            .then(function (response) {
                                            console.log(response.data);
                                        })
                                            .catch(function (error) {
                                            console.error('error on POST BusinessOrderList');
                                        });
                                        console.log("Client '".concat(clientID.numberClient, "' de '").concat(botNumberID, "' criado com sucesso!"));
                                    }
                                    catch (error) {
                                        console.error('Erro na requisição PUT:');
                                    }
                                }
                            }
                            else {
                                console.error('Erro na obtenção dos dados do cliente.');
                            }
                            return [2 /*return*/];
                    }
                });
            }); })();
        }
        catch (error) {
            console.log(this._businessList[botNumberID].orders, "\n");
            console.log("Could not add clientID to ordersList.\nclientID : ".concat(clientID.numberClient, "\nError: ").concat(error.message));
        }
    };
    Controller.prototype.readClientFromBusinessDB = function (botNumberID, numberClient) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = botNumberID
                            ? "http://lojas.vlks.com.br/api/BotClient/".concat(botNumberID, "/").concat(numberClient) // alterar para http://lojas.vlks.com.br/api/BotClientId/${botNumberID}/${numberClient}
                            : "http://lojas.vlks.com.br/api/BotClient";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.length === 0 ? undefined : response.data];
                    case 3:
                        error_3 = _a.sent();
                        console.error('error in GET of Client');
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Controller.prototype.addProductToClientProductsList = function (botNumberID, client, products) {
        try {
            for (var _i = 0, products_1 = products; _i < products_1.length; _i++) {
                var product = products_1[_i];
                this._businessList[botNumberID].orders.ordersList[client.costumerWAId].BotProdutoPedidos.push(product);
                console.log('\n\nProduct List = \n', this._businessList[botNumberID].orders.ordersList[client.costumerWAId].BotProdutoPedidos);
            }
        }
        catch (error) {
            if (!this._businessList[botNumberID]) {
                console.log("Business number [".concat(botNumberID, "] n\u00E3o existe!\n"));
            }
            else if (!this._businessList[botNumberID].orders.ordersList[client.costumerWAId]) {
                console.log("Cliente ".concat(client.costumerWAId, " n\u00E3o existe!"));
            }
            console.log("\nError: ".concat(error.message));
        }
    };
    Controller.prototype.removeProductFromClient = function (botNumberID, clientID, productName) {
        var BotProdutoPedidos = this._businessList[botNumberID].orders.ordersList[clientID.numberClient].BotProdutoPedidos;
        this._businessList[botNumberID].orders.ordersList[clientID.numberClient].BotProdutoPedidos = BotProdutoPedidos.filter(function (product) { return product.name !== productName; });
    };
    Controller.prototype.handleClientContext = function (botNumberID, client) {
        try {
            if (this._businessList[botNumberID].orders.ordersList[client.costumerWAId].conversationContext === 'nenhum') {
                var orderListData = this.extractProductOrdersFromMessage(client.textMessage);
                this.addProductToClientProductsList(botNumberID, client, orderListData[1]);
                this._businessList[botNumberID].orders.ordersList[client.costumerWAId].conversationContext = 'qtd_pedidos_lista'; // contextMap(conversationContext, text)
                this.askAdditional(botNumberID, client);
            }
            else if (this._businessList[botNumberID].orders.ordersList[client.costumerWAId].conversationContext === 'qtd_pedidos_lista') {
                if (client.textMessage === '0') {
                    this._businessList[botNumberID].orders.ordersList[client.costumerWAId].conversationContext === 'aguardar_pedido';
                    this.sendToPreparation(botNumberID, client);
                }
                else {
                    this.chooseModifier(botNumberID, client);
                }
            }
        }
        catch (error) {
            if (!this._businessList[botNumberID]) {
                console.log("Business number [".concat(botNumberID, "] n\u00E3o existe!\n"));
            }
            else if (!this._businessList[botNumberID].orders.ordersList[client.costumerWAId]) {
                console.log("Cliente ".concat(client.costumerWAId, " n\u00E3o existe!"));
            }
            console.log("Error: ".concat(error.response.data));
        }
    };
    Controller.prototype.findBestIntent = function (botNumberID) {
        var activatedIntents = [];
        for (var _i = 0, _a = Object.values(this._businessList[botNumberID].botChat); _i < _a.length; _i++) {
            var intent = _a[_i];
            for (var _b = 0, _c = intent.activationText; _b < _c.length; _b++) {
                var text = _c[_b];
                if (text === this._clientRequest.textMessage) {
                    activatedIntents.push(intent.name);
                }
            }
        }
        return;
    };
    Controller.prototype.extractProductOrdersFromMessage = function (mensagem) {
        var regexMesa = /Mesa: (\d+)/;
        var regexCodigo = /Cod: (\d+)/;
        var regexPedido = /(\d+) - ([^\n]+) \.\.\.\.\.\. R\$ ([\d,]+)/;
        var regexTotal = /Total do pedido:R\$ ([\d,]+)/;
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
                    pedidos.push({
                        id: codigo,
                        name: nome.trim(),
                        price: parseFloat(preco.replace(',', '.')),
                        quantity: parseInt(quantidade),
                    });
                }
            }
            else if (line.match(regexTotal)) {
                totalPedido = parseFloat(line.match(regexTotal)[1].replace(',', '.'));
                break;
            }
        }
        return [mesa, pedidos, totalPedido];
    };
    // MESSAGE
    /**
     * Envia mensagem de boas vindas
     * @param recipientId
     * @param botNumberId
     */
    Controller.prototype.greatingsMessage = function (recipientId) {
        var data = JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: recipientId,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                    text: "Olá! Bem-vindo ao Chat Rapido da BIX Lanches\n\nGostaria de ver nosso cardápio?",
                },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "cardapio",
                                title: "Sim, por favor!",
                            },
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "naocardapio",
                                title: "Não, obrigado!",
                            },
                        },
                    ],
                },
            },
        });
        // url: `https://graph.facebook.com/v17.0/${botNumberId}/messages`,
        var config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://graph.facebook.com/v17.0/113343625148900/messages",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD",
            },
            data: data,
        };
        axios
            .request(config)
            .then(function (response) {
            console.log("axios:", JSON.stringify(response.data));
        })
            .catch(function (error) {
            console.log("error on greatingsMessage:");
        });
    };
    Controller.prototype.askAdditional = function (botNumberID, client) {
        var _this = this;
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var i, modifiers, message, _i, _a, product, data, config;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        i = 0;
                        message = '*Informe o numero do pedido*, caso queria incluir algum adicional.\n\n';
                        _i = 0, _a = this._businessList[botNumberID].orders.ordersList[client.costumerWAId].BotProdutoPedidos;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        product = _a[_i];
                        return [4 /*yield*/, this.readProductModifierDB(product.id)];
                    case 2:
                        modifiers = _b.sent();
                        if (modifiers)
                            message += "*[".concat(++i, "]* - Ver adicionais de *").concat(product.name, "*\n");
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        message += "\n*[0]* - N\u00E3o quero incluir adicionais em nenhum item.";
                        console.log('\n\n', message);
                        data = JSON.stringify({
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": client.costumerWAId,
                            "type": "text",
                            "text": {
                                "preview_url": false,
                                "body": message
                            }
                        });
                        config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: 'https://graph.facebook.com/v17.0/113343625148900/messages',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD'
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
                        return [2 /*return*/];
                }
            });
        }); })();
    };
    Controller.prototype.askAdditionalOLD = function (botNumberID, client) {
        var buttons = [];
        for (var _i = 0, _a = this._businessList[botNumberID].orders.ordersList[client.costumerWAId].BotProdutoPedidos; _i < _a.length; _i++) {
            var product = _a[_i];
            buttons.push({
                type: "reply",
                reply: {
                    id: "".concat(buttons.length),
                    title: "Sim, ".concat(product.name),
                }
            });
        }
        console.log('\n\nbuttons: \n', buttons);
        var data = JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: client.costumerWAId,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                    text: "Gostaria de incluir algum item adicional nos itens abaixo?",
                },
                action: {
                    buttons: buttons,
                },
            },
        });
        // url: `https://graph.facebook.com/v17.0/${botNumberId}/messages`,
        var config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://graph.facebook.com/v17.0/113343625148900/messages",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD",
            },
            data: data,
        };
        axios
            .request(config)
            .then(function (response) {
            console.log("axios:", JSON.stringify(response.data));
        })
            .catch(function (error) {
            console.log("error on askAdditional:\n", error.response.data);
        });
    };
    Controller.prototype.chooseModifier = function (botNumberID, client) {
        var _this = this;
        try {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var modifiers, i, message, _i, modifiers_1, modifier, data, config;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.readProductModifierDB(this._businessList[botNumberID].orders.ordersList[client.costumerWAId].BotProdutoPedidos[client.textMessage].id)];
                        case 1:
                            modifiers = _a.sent();
                            i = 0;
                            message = "Por favor, digite um numero por vez do modificador que voc\u00EA deseja incluir para *".concat(this._businessList[botNumberID].orders.ordersList[client.costumerWAId].BotProdutoPedidos[client.textMessage].name, "*\n\n");
                            for (_i = 0, modifiers_1 = modifiers; _i < modifiers_1.length; _i++) {
                                modifier = modifiers_1[_i];
                                message += "*[".concat(++i, "]* - *").concat(modifier.descricaoModificador, "* ... ").concat(modifier.preco.toFixed(2).replace('.', ','), "\n");
                            }
                            message += "\n*[O]* - N\u00E3o quero incluir adicionais em nenhum item.";
                            data = JSON.stringify({
                                "messaging_product": "whatsapp",
                                "recipient_type": "individual",
                                "to": client.costumerWAId,
                                "type": "text",
                                "text": {
                                    "preview_url": false,
                                    "body": message
                                }
                            });
                            config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: 'https://graph.facebook.com/v17.0/113343625148900/messages',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD'
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
                            return [2 /*return*/];
                    }
                });
            }); })();
        }
        catch (error) {
            console.log('Erro em chooseModifier');
        }
    };
    Controller.prototype.readProductModifierDB = function (codigoProduto) {
        return __awaiter(this, void 0, void 0, function () {
            var config, response, error_4;
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
                        response = _a.sent();
                        // console.log(JSON.stringify(response.data));
                        return [2 /*return*/, response.data];
                    case 2:
                        error_4 = _a.sent();
                        console.error('error in GET of Client', error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Controller.prototype.sendToPreparation = function (botNumberID, client) {
        var message = "Ótimo, seu pedido ja esta sendo preparado!\n Tempo de espera é de __ minutos";
        var data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": client.costumerWAId,
            "type": "text",
            "text": {
                "preview_url": false,
                "body": message
            }
        });
        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://graph.facebook.com/v17.0/113343625148900/messages',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD'
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
    Controller.prototype.handleButton = function (recipientId, buttonReplyId) {
        var axios = require("axios");
        var data = JSON.stringify({});
        if (buttonReplyId === "cardapio") {
            var text = this.createMenuText();
            var buttons = this.createButtonsTest();
            data = JSON.stringify({
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": recipientId,
                "type": "interactive",
                "interactive": {
                    "type": "button",
                    "body": {
                        "text": text
                    },
                    "action": {
                        "buttons": buttons
                    }
                }
            });
        }
        else if (buttonReplyId === "naocardapio") {
            data = JSON.stringify({
                messaging_product: "whatsapp",
                to: recipientId,
                type: "text",
                text: {
                    body: "Ok, se precisar estou a disposição!",
                },
            });
        }
        else if (buttonReplyId === "1") {
            data = JSON.stringify({
                messaging_product: "whatsapp",
                to: recipientId,
                type: "text",
                text: {
                    body: "Ok, *X-Bacon*\nQual a *quantidade*?\n\nPara cancelar digite *#cancelar*",
                },
            });
        }
        else if (buttonReplyId === "2") {
            data = JSON.stringify({
                messaging_product: "whatsapp",
                to: recipientId,
                type: "text",
                text: {
                    body: "Ok, *X-Salada*\nQual a *quantidade*?\n\nPara cancelar digite *#cancelar*",
                },
            });
        }
        var config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://graph.facebook.com/v17.0/113343625148900/messages",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD",
            },
            data: data,
        };
        axios
            .request(config)
            .then(function (response) {
            console.log("axios:", JSON.stringify(response.data));
        })
            .catch(function (error) {
            console.log("error:", error);
        });
    };
    /**
     * Cria um objeto do tipo business ficticio para teste
     * @returns
     */
    Controller.prototype.negocioTeste = function () {
        var produtos = [
            {
                name: "X-Bacon",
                price: 28.50,
                category: "Lanche",
                description: "Pão de hamburguer, Hamburguer 180g, 4 fatias de Bacon , Mussarela, Tomate, Alface, Cebola, Molho Especial",
                id: "1",
                additional: [
                // { name: "Bacon Extra", price: 3.50 },
                // { name: "Queijo Extra", price: 2.50 },
                ]
            },
            {
                name: "X-Salada",
                price: 26.00,
                category: "Lanche",
                description: "Pão de hamburguer, Hamburguer 180g, Mussarela, Tomate, Alface, Cebola, Molho Especial",
                id: "2",
                additional: [
                // { name: "Bacon Extra", price: 3.50 },
                // { name: "Queijo Extra", price: 2.50 },
                // { name: "Ovo", price: 2.00 },
                ]
            }
        ];
        var pedido = { ordersList: {} };
        var negocioTeste = {
            name: "BIX Lanches",
            FBTOKEN: "EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD",
            botNumberID: "113343625148900",
            botNumber: "15550107122",
            products: produtos,
            orders: pedido,
            botChat: {}
        };
        return negocioTeste;
    };
    Controller.prototype.createMenuText = function () {
        var bix = this.negocioTeste();
        var text = "Nosso Cardápio de Lanches:\n";
        for (var _i = 0, _a = bix.products; _i < _a.length; _i++) {
            var produto = _a[_i];
            var formattedPrice = produto.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            text += "*".concat(produto.name, "* - *R$ ").concat(formattedPrice, "*\n").concat(produto.description, "\n\n");
        }
        return text;
    };
    Controller.prototype.createButtonsTest = function () {
        var bix = this.negocioTeste();
        var buttons = [];
        for (var _i = 0, _a = bix.products; _i < _a.length; _i++) {
            var produto = _a[_i];
            buttons.push({
                type: "reply",
                reply: {
                    id: produto.id.toString(),
                    title: produto.name
                }
            });
        }
        return JSON.stringify(buttons, null, 2);
    };
    Controller.prototype.sendMenuTest = function (recipientId) {
        var data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipientId,
            "type": "interactive",
            "interactive": {
                "type": "list",
                "header": {
                    "type": "text",
                    "text": "BIX Lanches"
                },
                "body": {
                    "text": "Cardápio"
                },
                "footer": {
                    "text": "*Selecione um pedido por vez e responda as perguntas*"
                },
                "action": {
                    "button": "Lanches e bebidas",
                    "sections": [
                        {
                            "title": "Lanches",
                            "rows": [
                                {
                                    "id": "111",
                                    "title": "*X-Bacon - R$ 28,50*",
                                    "description": "4 fatias de Bacon , Mussarela, Tomate, Alface, Cebola, Molho Especial"
                                },
                                {
                                    "id": "222",
                                    "title": "*X-Salada - R$ 26,00*",
                                    "description": "Mussarela, Tomate, Alface, Cebola, Molho Especial"
                                },
                                {
                                    "id": "333",
                                    "title": "*X-Frango - R$ 27,50*",
                                    "description": "Peito de Frango , Mussarela, Tomate, Alface, Cebola, Molho Especial"
                                },
                                {
                                    "id": "444",
                                    "title": "*X-Tudo - R$ 32,00*",
                                    "description": "4 fatias de Bacon, Peito de Frango, Mussarela, Tomate, Molho Especial"
                                }
                            ]
                        },
                        {
                            "title": "Bebidas",
                            "rows": [
                                {
                                    "id": "1111",
                                    "title": "Coca-Cola",
                                    "description": "Lata 350ml"
                                },
                                {
                                    "id": "2222",
                                    "title": "Coca-Cola",
                                    "description": "2 Litros"
                                },
                                {
                                    "id": "3333",
                                    "title": "Guaraná",
                                    "description": "Lata 350ml"
                                },
                                {
                                    "id": "444",
                                    "title": "Guaraná",
                                    "description": "2 Litros"
                                }
                            ]
                        }
                    ]
                }
            }
        });
        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://graph.facebook.com/v17.0/113343625148900/messages',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD'
            },
            data: data
        };
        axios.request(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
            .catch(function (error) {
            console.log("\n-----\nerror\n-----\n");
        });
    };
    return Controller;
}());
exports.default = Controller;
//# sourceMappingURL=controller.js.map