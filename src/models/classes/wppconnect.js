import WppSender from "../../APIs/wppconnect-server/wpp-sender.js";
import sender from "./sender.js";

export class WppConnect extends WppSender {
  constructor(session) {
    super();
    this.secretKey = 'BIXTOKEN';
    this.session = session.replace(/\s+/g, '-');
    this.token = null;
  }

  async startNewSession() {
    try {
      //Verificar se a session ja existe
      const tokenData = await this.generateWPPToken();
      console.log("tokenData:\n", tokenData);
      this.token = tokenData.token;

      const sessionData = await this.startSession();
      this.qrcode = sessionData.qrcode;

      return sessionData.qrcode;
    } catch (error) {
      console.error("Error in WppConnect.startNewSession", error);
    }
  }

  async initializeGroupList () {
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
      let existingGroups = (await sender.sendGroupRequests(this, [{ type: "get-all-groups" }])).flat();
      console.log("existingGroups: ", JSON.stringify(existingGroups.map((group) => group.name)));

      /* Filtrar grupos que ja existem dos grupos pedidos pelo chatbot */
      const groupNames = this.config.groupNames.filter((name) => !existingGroups.some((group) => group.name === name));

      /* Criar os grupos faltantes */
      const groupList = [];
      groupNames.forEach((name) => {
        groupList.push({
          type: "create-group",
          name: name,
          participants: this.phoneNumber,
        });
      });
      // existingGroups = existingGroups.concat(await sender.sendGroupRequests(this, groupList));
      // console.log("existingGroups: ", existingGroups);

      /* Criar lista de grupos existentes */
      const newGroups = {};
      existingGroups.forEach((group) => {
        newGroups[group.name] = group;
      });
      this.groupList = newGroups;
      console.log("groupList: ", JSON.stringify(Object.keys(newGroups)));
      // console.log("groupList: ", newGroups);
      return;
    } catch (error) {
      console.error("Error in getGroupList:", error);
    }
  };

  generateSecretKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secretKey = '';
    for (let i = 0; i < 32; i++) {
      secretKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return secretKey;
  }
}
