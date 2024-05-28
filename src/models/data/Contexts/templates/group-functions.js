const atendente = {};

const caixa = {
  fecha: function (context, chatbot, client) {
    const modalityId = client.chatbot.currentMessage.split(" ")[1];
    const user = Object.values(chatbot.clientList).find((client) => client.chatbot.modalityId === modalityId);
    chatbot.sendContextMessage('pesquisa-satisfacao', chatbot.clientList[user.phoneNumber]);
    return {
      responseObjects: [
        {
          type: "text",
          isGroup: true,
          message: `Conta [${user.phoneNumber}] ${chatbot.config.modality[0]}:${user.chatbot.modalityId} fechada!`,
        },
      ],
    };
  },
  invalido: function() {
    return {
      responseObjects: [
        {
          type: "text",
          isGroup: true,
          message: `Comando inválido!`,
        },
      ],
    };
  },
};

export { atendente, caixa };
