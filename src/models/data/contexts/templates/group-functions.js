const atendente = {};

const caixa = {
  fecha: function (context, chatbot, client) {
    const modalityId = client.chatbot.currentMessage.split(" ")[1];
    if (chatbot.modalityIdList[modalityId].inactive) return caixa.inativo(chatbot.config.modality[0], modalityId);
    if (!chatbot.modalityIdList[modalityId].occupied) return caixa.nao_ocupado(chatbot.config.modality[0], modalityId);
    const user = Object.values(chatbot.clientList).find((client) => client.chatbot.modalityId === modalityId);
    chatbot.clientList[user.phoneNumber].chatbot.interaction = "cardapio-whatsapp";
    chatbot.sendContextMessage("pesquisa-satisfacao", chatbot.clientList[user.phoneNumber]);
    return {
      responseObjects: [
        {
          type: "text",
          isGroup: true,
          message: `# Conta [${user.phoneNumber}] ${chatbot.config.modality[0]}:${user.chatbot.modalityId} fechada!`,
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
          message: `# Comando inválido!`,
        },
      ],
    };
  },
  nao_ocupado: function(modality, modalityId) {
    return {
      responseObjects: [
        {
          type: "text",
          isGroup: true,
          message: `# ${modality} ${modalityId} não possiu cliente ativo!`,
        },
      ],
    }
  },
  inativo: function(modality, modalityId) {
    return {
      responseObjects: [
        {
          type: "text",
          isGroup: true,
          message: `# ${modality} ${modalityId} esta inativa!`,
        },
      ],
    }
  },
};

export { atendente, caixa };
