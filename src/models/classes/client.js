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

    whoIsThere() {
        console.log(`Hello, im ${this.name}\nMy phone number is ${this.phoneNumber}`); 
        return this.name;
    }
}