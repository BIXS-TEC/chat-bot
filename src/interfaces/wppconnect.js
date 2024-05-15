const wppInterface = {};
export default wppInterface;

////////////////////////////////////* Messages *////////////////////////////////////

wppInterface.WPPConnectMessageToDefault = function (req) {
  try {
    switch (req.type) {
      case "list_response":
      case "chat": {
        return wppInterface.WPPConnectTextToDefault(req);
      }
      default: {
        return;
      }
    }
  } catch (error) {
    console.log("Não foi possivel padronizar a requisição de WPPConnect!\n", error);
  }
};

wppInterface.WPPConnectTextToDefault = function (req) {
  try {
    if (req.sender.isMe) {
      return {
        id: req.from,
        name: req.sender.pushname,
        phoneNumber: formatPhoneWPPConnect(req.from),
        platform: req.platform,
        timestamp: req.t,
        isChatbot: true,
        chatbot: {
          currentMessage: req.body,
          messageType: req.type,
          messageTo: formatPhoneWPPConnect(req.to),
          interaction: "admin",
          chatbotPhoneNumber: formatPhoneWPPConnect(req.from),
          itemId: req.type === "list_response" ? req.listResponse.singleSelectReply.selectedRowId : "",
        },
      };
    } else {
      return {
        id: req.from,
        name: req.notifyName,
        phoneNumber: formatPhoneWPPConnect(req.from),
        platform: req.platform,
        timestamp: req.t,
        isChatbot: false,
        chatbot: {
          currentMessage: req.body,
          messageType: req.type,
          messageTo: formatPhoneWPPConnect(req.to),
          interaction: req.interaction || "cardapio-whatsapp",
          chatbotPhoneNumber: formatPhoneWPPConnect(req.to),
          itemId: req.type === "list_response" ? req.listResponse.singleSelectReply.selectedRowId : "",
        },
      };
    }
  } catch (error) {
    console.log("Não foi possivel padronizar a mensagem Text de WPPConnect!\n", error);
  }
};

/**
  {
    phone: '55DD########',
    message: 'Text Message',
    isNewsletter: false,
    isGroup: false
  }
*/
wppInterface.defaultToWPPConnectResponseTextMessage = function (response) {
  try {
    const wppRes = {
      message: response.message,
      isNewsletter: response.isNewsletter || false,
      isGroup: response.isGroup || false,
    };
    console.log(`\nwppRes: ${JSON.stringify(wppRes)}\n`);

    return wppRes;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a mensagem de WPPConnect! [TextMessage]\n", error);
  }
};

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
wppInterface.defaultToWPPConnectResponseListMessage = function (response) {
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
};

wppInterface.defaultToWPPConnectResponseReplyMessage = function (response) {
  try {
    const wppRes = {
      message: response.message,
      messageId: response.messageId,
    };

    console.log(`\nwppRes: ${JSON.stringify(wppRes)}\n`);
    return wppRes;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a mensagem de WPPConnect! [ReplyMessage]\n", error);
  }
};

wppInterface.defaultToWPPConnectResponseLinkPreview = function (response) {
  try {
    const wppRes = {
      url: response.url,
    };
    if (response.caption) wppRes.caption = response.caption;

    console.log(`\nwppRes: ${JSON.stringify(wppRes)}\n`);
    return wppRes;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a mensagem de WPPConnect! [PreviewLink]\n", error);
  }
};

wppInterface.defaultToWPPConnectContactVcard = function (response) {
  try {
    const wppRes = {
      contactsId: response.contactsId,
      isGroup: response.isGroup || false,
    };

    console.log(`\nwppRes: ${JSON.stringify(wppRes)}\n`);
    return wppRes;
  } catch (error) {
    throw new Error("Não foi possivel padronizar a mensagem de WPPConnect! [ContactVcard]\n", error);
  }
};

function formatPhoneWPPConnect(phoneNumber) {
  return phoneNumber.slice(0, phoneNumber.indexOf("@"));
}

////////////////////////////////////* Groups *////////////////////////////////////

wppInterface.WppGroupsToDefault = function (response) {
  try {
    let groups = [];
    for (let group of response) {
      const participants = { admin: [], member: [] };
      for (let participant of group.groupMetadata.participants) {
        if (participant.isAdmin || participant.isSuperAdmin) {
          participants.admin.push(participant.id.user);
        } else {
          participants.member.push(participant.id.user);
        }
      }

      groups.push({
        contact: group.contact.id.user,
        name: group.contact.name,
        participants: participants,
      });
    }
    return groups;
  } catch (error) {
    console.error("Error in WppGroupsToDefault", error);
  }
};

wppInterface.WppCreatedGroupToDefault = function (response, participant) {
  try {
    if (response.statusText !== "Created") throw new Error("statusText is not 'Created'");
    response = response.data.response;

    const participants = { admin: [participant], member: [] };

    return {
      contact: response.groupInfo[0].id,
      name: response.groupInfo[0].name,
      participants: participants,
    };
  } catch (error) {
    console.error("Error in WppGroupsToDefault", error);
  }
};

const all = {
  status: "success",
  response: [
    {
      id: {
        server: "g.us",
        user: "120363274514421739",
        _serialized: "120363274514421739@g.us",
      },
      lastReceivedKey: {
        fromMe: false,
        remote: {
          server: "g.us",
          user: "120363274514421739",
          _serialized: "120363274514421739@g.us",
        },
        id: "3288048817create1714512550",
        participant: {
          server: "c.us",
          user: "554891487526",
          _serialized: "554891487526@c.us",
        },
        _serialized: "false_120363274514421739@g.us_3288048817create1714512550_554891487526@c.us",
      },
      t: 1714512550,
      unreadCount: 0,
      unreadDividerOffset: 0,
      isReadOnly: false,
      isAnnounceGrpRestrict: false,
      muteExpiration: 0,
      isAutoMuted: false,
      hasUnreadMention: false,
      archiveAtMentionViewedInDrawer: false,
      hasChatBeenOpened: false,
      isDeprecated: false,
      pendingInitialLoading: false,
      celebrationAnimationLastPlayed: 0,
      hasRequestedWelcomeMsg: false,
      msgs: null,
      kind: "group",
      isBroadcast: false,
      isGroup: true,
      isUser: false,
      contact: {
        id: {
          server: "g.us",
          user: "120363274514421739",
          _serialized: "120363274514421739@g.us",
        },
        name: "Garçom",
        type: "in",
        privacyMode: null,
        textStatusLastUpdateTime: -1,
        formattedName: "Garçom",
        isMe: false,
        isMyContact: false,
        isPSA: false,
        isUser: false,
        isWAContact: false,
        profilePicThumbObj: {
          id: {
            server: "g.us",
            user: "120363274514421739",
            _serialized: "120363274514421739@g.us",
          },
          tag: "",
        },
        msgs: null,
      },
      groupMetadata: {
        id: {
          server: "g.us",
          user: "120363274514421739",
          _serialized: "120363274514421739@g.us",
        },
        creation: 1714512550,
        owner: {
          server: "c.us",
          user: "554891487526",
          _serialized: "554891487526@c.us",
        },
        subject: "Garçom",
        subjectTime: 1714512550,
        restrict: false,
        announce: false,
        noFrequentlyForwarded: false,
        ephemeralDuration: 0,
        membershipApprovalMode: false,
        size: 1,
        support: false,
        suspended: false,
        terminated: false,
        uniqueShortNameMap: {},
        isLidAddressingMode: false,
        isParentGroup: false,
        isParentGroupClosed: false,
        defaultSubgroup: false,
        generalSubgroup: false,
        generalChatAutoAddDisabled: false,
        allowNonAdminSubGroupCreation: false,
        incognito: false,
        participants: [
          {
            id: {
              server: "c.us",
              user: "554891487526",
              _serialized: "554891487526@c.us",
            },
            isAdmin: true,
            isSuperAdmin: true,
          },
        ],
        pendingParticipants: [],
        pastParticipants: [],
        membershipApprovalRequests: [],
        subgroupSuggestions: [],
      },
      presence: {
        id: {
          server: "g.us",
          user: "120363274514421739",
          _serialized: "120363274514421739@g.us",
        },
        chatstates: [
          {
            id: {
              server: "c.us",
              user: "554891487526",
              _serialized: "554891487526@c.us",
            },
          },
        ],
      },
    },
    {
      id: {
        server: "g.us",
        user: "120363273408609842",
        _serialized: "120363273408609842@g.us",
      },
      lastReceivedKey: {
        fromMe: false,
        remote: {
          server: "g.us",
          user: "120363273408609842",
          _serialized: "120363273408609842@g.us",
        },
        id: "878279633create1714394290",
        participant: {
          server: "c.us",
          user: "554891487526",
          _serialized: "554891487526@c.us",
        },
        _serialized: "false_120363273408609842@g.us_878279633create1714394290_554891487526@c.us",
      },
      t: 1714394290,
      unreadCount: 0,
      unreadDividerOffset: 0,
      isReadOnly: false,
      isAnnounceGrpRestrict: false,
      muteExpiration: 0,
      isAutoMuted: false,
      unreadMentionsOfMe: [],
      hasUnreadMention: false,
      archiveAtMentionViewedInDrawer: false,
      hasChatBeenOpened: false,
      isDeprecated: false,
      pendingInitialLoading: false,
      celebrationAnimationLastPlayed: 0,
      hasRequestedWelcomeMsg: false,
      msgs: null,
      kind: "group",
      isBroadcast: false,
      isGroup: true,
      isUser: false,
      contact: {
        id: {
          server: "g.us",
          user: "120363273408609842",
          _serialized: "120363273408609842@g.us",
        },
        name: "Cozinha",
        type: "in",
        textStatusLastUpdateTime: -1,
        formattedName: "Cozinha",
        isMe: false,
        isMyContact: false,
        isPSA: false,
        isUser: false,
        isWAContact: false,
        profilePicThumbObj: {
          eurl: null,
          id: {
            server: "g.us",
            user: "120363273408609842",
            _serialized: "120363273408609842@g.us",
          },
          tag: "",
        },
        msgs: null,
      },
      groupMetadata: {
        id: {
          server: "g.us",
          user: "120363273408609842",
          _serialized: "120363273408609842@g.us",
        },
        creation: 1714394290,
        owner: {
          server: "c.us",
          user: "554891487526",
          _serialized: "554891487526@c.us",
        },
        subject: "Cozinha",
        subjectTime: 1714394290,
        descTime: 0,
        restrict: false,
        announce: false,
        noFrequentlyForwarded: false,
        ephemeralDuration: 0,
        membershipApprovalMode: false,
        memberAddMode: "admin_add",
        reportToAdminMode: false,
        size: 1,
        support: false,
        suspended: false,
        terminated: false,
        uniqueShortNameMap: {},
        isLidAddressingMode: false,
        isParentGroup: false,
        isParentGroupClosed: false,
        defaultSubgroup: false,
        generalSubgroup: false,
        generalChatAutoAddDisabled: false,
        allowNonAdminSubGroupCreation: false,
        lastActivityTimestamp: 0,
        lastSeenActivityTimestamp: 0,
        incognito: false,
        participants: [
          {
            id: {
              server: "c.us",
              user: "554891487526",
              _serialized: "554891487526@c.us",
            },
            isAdmin: true,
            isSuperAdmin: false,
          },
        ],
        pendingParticipants: [],
        pastParticipants: [],
        membershipApprovalRequests: [],
        subgroupSuggestions: [],
      },
      presence: {
        id: {
          server: "g.us",
          user: "120363273408609842",
          _serialized: "120363273408609842@g.us",
        },
        chatstates: [],
      },
    },
  ],
  session: "NERDWHATS_AMERICA",
};
