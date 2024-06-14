import sender from "../classes/sender.js";

const Group = {};
export default Group;

Group.createGroup = function ({ chatId, name, admin, member = [] }) {
  if (!Array.isArray(admin)) throw new Error("admin must be an Array");
  if (!Array.isArray(member)) throw new Error("member must be an Array");

  return {
    chatId: chatId,
    name: name,
    participants: {
      admin: admin,
      member: member,
    },
  };
};

Group.initializeGroupList = async function (chatbot) {
  try {
    /**
     * [{
    contact: group.contact.id.user,
    name: contact.name,
    participants: groupMetadata.participants
  },
  {
    contact: group.contact.id.user,
    name: contact.name,
    participants: groupMetadata.participants
  }]
  */
    /* Buscar grupos existentes */
    let existingGroups = (await sender.sendGroupRequests([{ type: "get-all-groups" }])).flat();
    // console.log("existingGroups: ", JSON.stringify(existingGroups.map((group) => group.name)));

    /* Filtrar grupos que ja existem dos grupos pedidos pelo chatbot */
    const groupNames = chatbot.config.groupNames.filter((name) => !existingGroups.some((group) => group.name === name));

    /* Criar os grupos faltantes */
    const groupList = [];
    groupNames.forEach((name) => {
      groupList.push({
        type: "create-group",
        name: name,
        participants: chatbot.phoneNumber,
      });
    });
    existingGroups = existingGroups.concat(await sender.sendGroupRequests(groupList));
    // console.log("existingGroups: ", existingGroups);

    /* Criar lista de grupos existentes */
    const newGroups = {};
    existingGroups.forEach((group) => {
      newGroups[group.name] = group;
    });
    chatbot.groupList = newGroups;
    console.log("groupList: ", JSON.stringify(Object.keys(newGroups)));
    // console.log("groupList: ", newGroups);
    return;
  } catch (error) {
    console.error("Error in getGroupList:", error);
  }
};

function getDefaultCommands(groupList) {}
