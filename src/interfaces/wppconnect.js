export function WPPConnectMessageToDefault(req) {
  try {
    // console.log('original request: ', req);

    const client = {
      id: req.id,
      name: req.notifyName,
      phoneNumber: formatPhoneWPPConnect(req.from),
      platform: req.platform,
      timestamp: req.t,
      chatbot: {
        currentMessage: req.body,
        messageType: req.type,
        interaction: req.interaction || "cardapio-whatsapp",
        chatbotPhoneNumber: formatPhoneWPPConnect(req.to),
        itemId: '',
      },
    };
    if (req.type === "list_response") {
      client.chatbot.itemId = req.listResponse.singleSelectReply.selectedRowId;
    }

    return client;
  } catch (error) {
    console.log("Não foi possivel padronizar a requisição de WPPConnect!\n", error);
  }
}

/**
  {
    phone: '55DD########',
    message: 'Text Message',
    isNewsletter: false,
    isGroup: false
  }
*/
export function defaultToWPPConnectResponseTextMessage(response) {
  try {
    const wppRes = {
      message: response.message,
      isNewsletter: false,
      isGroup: false,
    };
    console.log(`\nwppRes: ${JSON.stringify(wppRes)}\n`);

    return wppRes;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a mensagem de WPPConnect! [TextMessage]\n", error);
  }
}

/**
{
  phone: phone,
  isGroup: isGroup,
  description: description,
  buttonText: buttonText,
  sections: [
    {
      title: 'Section 1',
      rows: [
        {
          rowId: 'my_custom_id',
          title: 'Test 1',
          description: 'Description 1'
        },
        {
          rowId: '2',
          title: 'Test 11',
          description: 'Description 2'
        }
      ]
    }
  ]
}
*/
export function defaultToWPPConnectResponseListMessage(response) {
  try {
    const wppRes = {
      isGroup: false,
      description: response.description,
      buttonText: response.buttonText,
      sections: response.sections,
    };

    console.log(`\nwppRes: ${JSON.stringify(wppRes)}\n`);
    return wppRes;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a mensagem de WPPConnect! [ListMessage]\n", error);
  }
}

export function defaultToWPPConnectResponseReplyMessage(response) {
  try {
    const wppRes = {
      message: response.message,
      messageId: response.messageId
    };
    
    console.log(`\nwppRes: ${JSON.stringify(wppRes)}\n`);
    return wppRes;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a mensagem de WPPConnect! [ReplyMessage]\n", error);
  }
}

export function defaultToWPPConnectResponseLinkPreview(response) {
  try {
    const wppRes = {
      url: response.url,
    };
    if (response.caption)
      wppRes.caption = response.caption;
    
    console.log(`\nwppRes: ${JSON.stringify(wppRes)}\n`);
    return wppRes;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a mensagem de WPPConnect! [PreviewLink]\n", error);
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
