import { Request } from 'express';

export default class ClientReq {
    private _req: Request
    private _idWABA: string
    private _messagingProduct: string
    private _display_phone_number: string
    private _phone_number_id: string

    private _contacts: boolean = false
    private _name: string
    private _wa_id: string

    private _messages: boolean = false
    private _from: string
    private _MessageId: string
    private _timestamp: string
    private _bodyText: string
    private _type: string

    private _interactive: string
    private _typeInteractive: string
    private _idButton: string
    private _titleButton: string

    private _statuses: boolean = false
    private _sentMessageId: string
    private _status: string
    private _recipient_id: string
    private _idConversation: string
    private _expiration_timestamp: string // Sent
    private _typeOrigin: string
    private _billable: boolean
    private _pricing_model: string
    private _category: string

    constructor(request, response) {
        this._req = request
        const __entry = this._req.body.entry[0]
        this._idWABA = __entry.id
        this._messagingProduct = __entry.changes[0].value.messaging_product
        this._display_phone_number = __entry.changes[0].value.metadata.display_phone_number
        this._phone_number_id = __entry.changes[0].value.metadata.phone_number_id
        if (__entry.changes[0].value.contacts && __entry.changes[0].value.contacts[0]) {
            this._contacts = true
            const __contacts = __entry.changes[0].value.contacts[0]
            this._name = __contacts.profile.name
            this._wa_id = __contacts.wa_id
        }
        if (__entry.changes[0].value.messages && __entry.changes[0].value.messages[0]) {
            this._messages = true
            const __messages = __entry.changes[0].value.messages[0]
            this._from = __messages.from
            this._MessageId = __messages.id
            this._timestamp = __messages.timestamp
            this._type = __messages.type
            if (this._type === "text") {
                this._bodyText = __messages.text.body
            } else if (this._type === "interactive") {
                this._typeInteractive = __messages.interactive.type
                this._interactive = JSON.stringify(__messages.interactive)
                if (this._typeInteractive === "button_reply") {
                    this._idButton = __messages.interactive.button_reply.id
                    this._titleButton = __messages.interactive.button_reply.title
                }
            }
        } else if (__entry.changes[0].value.statuses && __entry.changes[0].value.statuses[0]) {
            this._statuses = true
            const __statuses = __entry.changes[0].value.statuses[0]
            this._sentMessageId = __statuses.id
            this._status = __statuses.status
            this._recipient_id = __statuses.recipient_id
            if (__statuses.conversation) {
                if (this._status === "sent") this._expiration_timestamp = __statuses.conversation.expiration_timestamp
                this._idConversation = __statuses.conversation.id
                this._typeOrigin = __statuses.conversation.origin.type
            }
            if (__statuses.pricing) {
                this._billable = __statuses.pricing.billable
                this._pricing_model = __statuses.pricing.pricing_model
                this._category = __statuses.pricing.category
            }
        }
    }

    /**
     * The ID of Whatsapp Business Accounts this Webhook belongs to.
     * O ID das Contas Empresariais do WhatsApp a que pertence este Webhook.
     * @returns
     */
    public get idWABA(): string {
        return this._idWABA;
    }

    private set idWABA(id: string) {
        this._idWABA = id
    }

    /**
     * The messaging service used for Webhooks. For WhatsApp messages, this value needs to be set to “whatsapp”.
     * O serviço de mensagens usado para os Webhooks. Para mensagens do WhatsApp, este valor precisa ser definido como "whatsapp".
     * @returns
     */
    public get messagingProduct(): string {
        return this._messagingProduct;
    }
    private set messagingProduct(messaging_product: string) {
        this._messagingProduct = messaging_product
    }

    // METADATA
    /**
     * The phone number of the business account that is receiving the Webhooks.
     * O número de telefone da conta empresarial que está recebendo os Webhooks.
     * @returns
     */
    public get botNumber(): string {
        return this._display_phone_number
    }
    private set botNumber(display_phone_number: string) {
        this._display_phone_number = display_phone_number
    }

    /**
     * The ID of the phone number receiving the Webhooks. You can use this phone_number_id to send messages back to customers.
     * O ID do número de telefone que está recebendo os Webhooks. Você pode usar este phone_number_id para enviar mensagens de volta para os clientes.
     * curl -i -X POST `  https://graph.facebook.com/v17.0/phone_number_id/messages ` [...]
     * @returns
     */
    public get botNumberID(): string {
        return this._phone_number_id
    }
    private set botNumberID(phone_number_id: string) {
        this._phone_number_id = phone_number_id
    }

    // CONTACTS
    /**
     * Specifies the sender's profile name.
     * Especifica o nome do perfil do remetente.
     * @returns
     */
    public get costumerName(): string {
        return this._name
    }

    /**
     * The WhatsApp ID (phone number) of the customer. You can send messages using this wa_id.
     * O ID (numero do celular) do WhatsApp do cliente. Você pode enviar mensagens usando este wa_id.
     * @returns
     */
    public get costumerWAId(): string {
        return this._wa_id
    }

    // MESSAGES
    /**
     * An array of message objects. Added to Webhooks for incoming message notifications.
     * Um array de objetos de mensagem. Adicionado aos Webhooks para notificações de mensagens recebidas.
     */
    public get messagesObject(): boolean {
        return this._messages
    }
    /**
     * The customer's phone number.
     * O número de telefone do cliente.
     * @returns
     */
    public get costumerFromNumber(): string {
        return this._from
    }

    /**
     * The unique identifier of incoming message, you can use messages endpoint to mark it as read.
     * O identificador único da mensagem recebida, você pode usar o endpoint de mensagens para marcá-la como lida.
     * @returns
     */
    public get costumerMessageId(): string {
        return this._MessageId
    }

    /**
     * The timestamp when a customer sends a message.
     * O horário em que um cliente envia uma mensagem.
     * @returns
     */
    public get timestampCostumer(): string {
        return this._timestamp
    }

    /**
     * The text of the text message.
     * O texto da mensagem de texto.
     * @returns
     */
    public get textMessage(): string {
        return this._bodyText
    }

    /**
     * The type of message being received.
     * O tipo da mensagem recebida.
     * @returns 'text'||'image'||'interactive'||'document'||'audio'||'sticker'||'order'||'video'||'button'||'contacts'||'location'||'unknown'||'system'
     */
    public get typeMessage(): string {
        return this._type;
    }

    /**
     * 
     */
    public get typeInteractive(): string {
        return this._typeInteractive
    }

    /**
     * 
     */
    public get interactive(): string {
        return this._interactive
    }

    /**
     * 
     */
    public get idButton(): string {
        return this._idButton
    }

    /**
     * 
     */
    public get titleButton(): string {
        return this._titleButton
    }

    // STATUSES
    /**
     * An array of message status objects. Added to Webhooks for message status update.
     * Uma matriz de objetos de status de mensagem. Adicionado aos Webhooks para atualização do status da mensagem.
     */
    public get statusesObject(): boolean {
        return this._statuses
    }
    /**
     * The message ID.
     * O ID da mensagem
     * @returns
     */
    public get sentMessageId(): string {
        return this._sentMessageId
    }

    /**
     * The status of the message. Valid values are: read, delivered, sent, failed, or deleted.
     * O status da mensagem. Valores validos são: read, delivered, sent, failed, or deleted.
     * @returns
     */
    public get messageStatus(): string {
        return this._status
    }

    /**
     * The timestamp of the status message.
     * O horário da mensagem de status.
     * @returns
     */
    public get messageTimestamp(): string {
        return this._timestamp;
    }

    /**
     * The WhatsApp ID of the recipient.
     * ID do WhatsApp do destinatário.
     * @returns
     */
    public get recipientId(): string {
        return this._recipient_id;
    }

    /**
     * The conversation object tracks the attributes of your current conversation.
     * O objeto de conversa acompanha os atributos da sua conversa atual.
     * @returns
     */
    public get openConversationId(): string {
        return this._req.body.entry[0].changes[0].value.statuses[0].conversation.id;
    }

    /**
     * The timestamp when the current ongoing conversation expires. This field is not present in all Webhook types.
     * O horário em que a conversa atual em andamento expira. Este campo não está presente em todos os tipos de Webhooks.
     * @returns
     */
    public get expirationTimestamp(): string {
        return this._req.body.entry[0].changes[0].value.statuses[0].conversation.expiration_timestamp
    }
}