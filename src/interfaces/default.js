const dfInterface = {};
export default dfInterface;

dfInterface.standardizeMessageToDefault = function (req) {
  try {
    const client = {
      id: req.message.id,
      name: req.message.name,
      phoneNumber: req.message.phoneNumber,
      chatbotPhoneNumber: req.message.chatbotPhoneNumber,
      message: req.message.message,
    };
    // console.log("\n\n\nUnknown Client:", client, "\n\n\n");
    return client;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a requisição desconhecida!");
  }
};
