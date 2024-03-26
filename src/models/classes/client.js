export default class Client{

    constructor(id, name, phoneNumber, platform, chatbotPhoneNumber){
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.platform = platform;
        this.chatbot = {};
        this.chatbot.chatbotPhoneNumber = chatbotPhoneNumber;
        this.chatbot.context = 'nenhum';
    }

    changeContext(context){
        try {
            if(typeof context === 'string')
                this.chatbot.context = context;
            else throw new Error('Nome do context deve ser uma string');
        } catch (error) {
            console.log('Erro em changeContext da classe Client', error);
        }
    }

    whoIsThere() {
        console.log(`Hello, im ${this.name}\nMy phone number is ${this.phoneNumber}`); 
        return this.name;
    }
}