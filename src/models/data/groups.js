import sender from "../classes/sender.js";

const group = {};
export default group;

group.initializeGroupList = async function (chatbot) {
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
    let existingGroups = (await sender.sendGroupRequests([{ type: "get-all-groups" }])).flat();
    console.log('existingGroups: ', JSON.stringify(existingGroups.map(group => group.name)));
    
    const groupNames = chatbot.config.groupNames.filter(name => !existingGroups.some(group => group.name === name));

    const groupList = [];
    groupNames.forEach(name => {
      groupList.push({
        type: 'create-group',
        name: name,
        participants: chatbot.phoneNumber,
      });
    });
    existingGroups = existingGroups.concat(await sender.sendGroupRequests(groupList));

    const newGroups = {};
    existingGroups.forEach(group => {
      newGroups[group.name] = group;
    });
    chatbot.groupList = newGroups;
    // console.log('groupList: ', chatbot.groupList);
    return;

  } catch (error) {
    console.error("Error in getGroupList:", error);
  }
}
