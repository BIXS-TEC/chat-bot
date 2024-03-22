import getChatbotList from "../../models/data/chatbot.js";

export default function creator(){
    const chatbotList = getChatbotList();
    return chatbotList;
}