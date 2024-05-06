import { sendGroupRequests } from "../classes/sender.js";

export default async function getGroupList(chatbot) {
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
    const existingGroups = (await sendGroupRequests([{ type: "get-all-groups" }])).flat();
    console.log('existingGroups: ', existingGroups.map(group => group.name));
    
    const groupNames = chatbot.config.groupNames.filter(name => !existingGroups.some(group => group.name === name));

    const groupList = [];
    groupNames.forEach(name => {
      groupList.push({
        type: 'create-group',
        name: name,
        participants: chatbot.phoneNumber,
      });
    });
    const newGroups = await sendGroupRequests(groupList);
    existingGroups.forEach(group => {
      newGroups.push(group);
    });
    console.log('newGroups: ', newGroups.map(group => group.name));
    return newGroups;

  } catch (error) {
    console.error("Error in getGroupList:", error);
  }
}
