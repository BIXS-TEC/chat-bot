export function WPPConnectRequestToDefault(req) {
  try {
    const client = {
      id: req.id,
      name: req.notifyName,
      phoneNumber: formatPhoneWPPConnect(req.from),
      platform: req.platform,
      chatbot: {
        currentMessage: req.body,
        interaction: req.interaction || "adicionais",
        chatbotPhoneNumber: formatPhoneWPPConnect(req.to),
      },
    };
    return client;
  } catch (error) {
    console.log("Não foi possivel padronizar a requisição de WPPConnect!\n",error);
  }
}

function formatPhoneWPPConnect(phoneNumber) {
  return phoneNumber.slice(0, phoneNumber.indexOf("@"));
}
