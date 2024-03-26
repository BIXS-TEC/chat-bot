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
    console.log("Não foi possivel padronizar a requisição de WPPConnect!\n", error);
  }
}

export function defaultToWPPConnectResponse(res) {
  try {
    console.log(`\n default res: ${JSON.stringify(res, null, 2)}\n`);

    const wppRes = {};
    wppRes.message = res.message;
    if (res.buttons) {

      // Buttons formatter
      wppRes.buttonsConfig = {buttons: []};
      res.buttons.forEach((button) => {
        const wppButton = {};
        if (button.id && button.text) {
          wppButton.id = button.id;
          wppButton.text = button.text;
        } else if (button.url && button.text) {
          wppButton.url = button.url;
          wppButton.text = button.text;
        } else if (button.phoneNumber && button.text) {
          wppButton.phoneNumber = button.phoneNumber;
          wppButton.text = button.text;
        }
        wppRes.buttonsConfig.buttons.push(wppButton);
      });

      // Config
      wppRes.buttonsConfig.useTemplateButtons = true; // False for legacy
      if (res.title) wppRes.buttonsConfig.title = res.title; // Optional
      if (res.footer) wppRes.buttonsConfig.footer = res.footer; // Optional
    }
    console.log(`\nwppRes: ${JSON.stringify(wppRes, null, 2)}\n`);
    return wppRes;
  } catch (error) {
    throw new Error("Erro na função defaultToWPPConnectResponse: \n", error);
  }
}

function formatPhoneWPPConnect(phoneNumber) {
  return phoneNumber.slice(0, phoneNumber.indexOf("@"));
}

/*
  {
    useTemplateButtons: true, // False for legacy
    buttons: [
      {
        url: 'https://wppconnect.io/',
        text: 'WPPConnect Site'
      },
      {
        phoneNumber: '+55 11 22334455',
        text: 'Call me'
      },
      {
        id: 'your custom id 1',
        text: 'Some text'
      },
      {
        id: 'another id 2',
        text: 'Another text'
      }
    ],
    title: 'Title text' // Optional
    footer: 'Footer text' // Optional
   }*/
