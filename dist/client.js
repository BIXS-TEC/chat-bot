"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClientReq = /** @class */ (function () {
    function ClientReq(request, response) {
        this._contacts = false;
        this._messages = false;
        this._statuses = false;
        this._req = request;
        var __entry = this._req.body.entry[0];
        this._idWABA = __entry.id;
        this._messagingProduct = __entry.changes[0].value.messaging_product;
        this._display_phone_number = __entry.changes[0].value.metadata.display_phone_number;
        this._phone_number_id = __entry.changes[0].value.metadata.phone_number_id;
        if (__entry.changes[0].value.contacts && __entry.changes[0].value.contacts[0]) {
            this._contacts = true;
            var __contacts = __entry.changes[0].value.contacts[0];
            this._name = __contacts.profile.name;
            this._wa_id = __contacts.wa_id;
        }
        if (__entry.changes[0].value.messages && __entry.changes[0].value.messages[0]) {
            this._messages = true;
            var __messages = __entry.changes[0].value.messages[0];
            this._from = __messages.from;
            this._MessageId = __messages.id;
            this._timestamp = __messages.timestamp;
            this._type = __messages.type;
            if (this._type === "text") {
                this._bodyText = __messages.text.body;
            }
            else if (this._type === "interactive") {
                this._typeInteractive = __messages.interactive.type;
                if (this._typeInteractive === "button") {
                    this._idButton = __messages.interactive.button_reply.id;
                    this._titleButton = __messages.interactive.button_reply.title;
                }
            }
        }
        else if (__entry.changes[0].value.statuses && __entry.changes[0].value.statuses[0]) {
            this._statuses = true;
            var __statuses = __entry.changes[0].value.statuses[0];
            this._sentMessageId = __statuses.id;
            this._status = __statuses.status;
            this._recipient_id = __statuses.recipient_id;
            if (__statuses.conversation) {
                if (this._status === "sent")
                    this._expiration_timestamp = __statuses.conversation.expiration_timestamp;
                this._idConversation = __statuses.conversation.id;
                this._typeOrigin = __statuses.conversation.origin.type;
            }
            if (__statuses.pricing) {
                this._billable = __statuses.pricing.billable;
                this._pricing_model = __statuses.pricing.pricing_model;
                this._category = __statuses.pricing.category;
            }
        }
    }
    Object.defineProperty(ClientReq.prototype, "idWABA", {
        /**
         * The ID of Whatsapp Business Accounts this Webhook belongs to.
         * O ID das Contas Empresariais do WhatsApp a que pertence este Webhook.
         * @returns
         */
        get: function () {
            return this._idWABA;
        },
        set: function (id) {
            this._idWABA = id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "messagingProduct", {
        /**
         * The messaging service used for Webhooks. For WhatsApp messages, this value needs to be set to “whatsapp”.
         * O serviço de mensagens usado para os Webhooks. Para mensagens do WhatsApp, este valor precisa ser definido como "whatsapp".
         * @returns
         */
        get: function () {
            return this._messagingProduct;
        },
        set: function (messaging_product) {
            this._messagingProduct = messaging_product;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "botNumber", {
        // METADATA
        /**
         * The phone number of the business account that is receiving the Webhooks.
         * O número de telefone da conta empresarial que está recebendo os Webhooks.
         * @returns
         */
        get: function () {
            return this._display_phone_number;
        },
        set: function (display_phone_number) {
            this._display_phone_number = display_phone_number;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "botNumberID", {
        /**
         * The ID of the phone number receiving the Webhooks. You can use this phone_number_id to send messages back to customers.
         * O ID do número de telefone que está recebendo os Webhooks. Você pode usar este phone_number_id para enviar mensagens de volta para os clientes.
         * curl -i -X POST `  https://graph.facebook.com/v17.0/phone_number_id/messages ` [...]
         * @returns
         */
        get: function () {
            return this._phone_number_id;
        },
        set: function (phone_number_id) {
            this._phone_number_id = phone_number_id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "costumerName", {
        // CONTACTS
        /**
         * Specifies the sender's profile name.
         * Especifica o nome do perfil do remetente.
         * @returns
         */
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "costumerWAId", {
        /**
         * The WhatsApp ID (phone number) of the customer. You can send messages using this wa_id.
         * O ID (numero do celular) do WhatsApp do cliente. Você pode enviar mensagens usando este wa_id.
         * @returns
         */
        get: function () {
            return this._wa_id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "messagesObject", {
        // MESSAGES
        /**
         * An array of message objects. Added to Webhooks for incoming message notifications.
         * Um array de objetos de mensagem. Adicionado aos Webhooks para notificações de mensagens recebidas.
         */
        get: function () {
            return this._messages;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "costumerFromNumber", {
        /**
         * The customer's phone number.
         * O número de telefone do cliente.
         * @returns
         */
        get: function () {
            return this._from;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "costumerMessageId", {
        /**
         * The unique identifier of incoming message, you can use messages endpoint to mark it as read.
         * O identificador único da mensagem recebida, você pode usar o endpoint de mensagens para marcá-la como lida.
         * @returns
         */
        get: function () {
            return this._MessageId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "timestampCostumer", {
        /**
         * The timestamp when a customer sends a message.
         * O horário em que um cliente envia uma mensagem.
         * @returns
         */
        get: function () {
            return this._timestamp;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "textMessage", {
        /**
         * The text of the text message.
         * O texto da mensagem de texto.
         * @returns
         */
        get: function () {
            return this._bodyText;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "typeMessage", {
        /**
         * The type of message being received.
         * O tipo da mensagem recebida.
         * @returns 'text'||'image'||'interactive'||'document'||'audio'||'sticker'||'order'||'video'||'button'||'contacts'||'location'||'unknown'||'system'
         */
        get: function () {
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "typeInteractive", {
        /**
         *
         */
        get: function () {
            return this._typeInteractive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "idButton", {
        /**
         *
         */
        get: function () {
            return this._idButton;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "titleButton", {
        /**
         *
         */
        get: function () {
            return this._titleButton;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "statusesObject", {
        // STATUSES
        /**
         * An array of message status objects. Added to Webhooks for message status update.
         * Uma matriz de objetos de status de mensagem. Adicionado aos Webhooks para atualização do status da mensagem.
         */
        get: function () {
            return this._statuses;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "sentMessageId", {
        /**
         * The message ID.
         * O ID da mensagem
         * @returns
         */
        get: function () {
            return this._sentMessageId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "messageStatus", {
        /**
         * The status of the message. Valid values are: read, delivered, sent, failed, or deleted.
         * O status da mensagem. Valores validos são: read, delivered, sent, failed, or deleted.
         * @returns
         */
        get: function () {
            return this._status;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "messageTimestamp", {
        /**
         * The timestamp of the status message.
         * O horário da mensagem de status.
         * @returns
         */
        get: function () {
            return this._timestamp;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "recipientId", {
        /**
         * The WhatsApp ID of the recipient.
         * ID do WhatsApp do destinatário.
         * @returns
         */
        get: function () {
            return this._recipient_id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "openConversationId", {
        /**
         * The conversation object tracks the attributes of your current conversation.
         * O objeto de conversa acompanha os atributos da sua conversa atual.
         * @returns
         */
        get: function () {
            return this._req.body.entry[0].changes[0].value.statuses[0].conversation.id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClientReq.prototype, "expirationTimestamp", {
        /**
         * The timestamp when the current ongoing conversation expires. This field is not present in all Webhook types.
         * O horário em que a conversa atual em andamento expira. Este campo não está presente em todos os tipos de Webhooks.
         * @returns
         */
        get: function () {
            return this._req.body.entry[0].changes[0].value.statuses[0].conversation.expiration_timestamp;
        },
        enumerable: false,
        configurable: true
    });
    return ClientReq;
}());
exports.default = ClientReq;
//# sourceMappingURL=client.js.map