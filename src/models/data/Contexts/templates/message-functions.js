import CryptoJS from "crypto-js";
import { type } from "os";

export function buildSection(chatbot, title, sectionsName, args = {}) {
  try {
    const sectionMappings = {
      cardapio: {
        rowId: "cardapio",
        title: "Ver cardápio 🍔",
        description: "Fazer um pedido",
      },
      "voltar-cardapio": {
        rowId: "cardapio",
        title: "Ver cardápio 🍔",
        description: "Volte ao cardápio para adicionar mais itens em seu pedido",
      },
      atendente: {
        rowId: "atendente",
        title: "Falar com um atendente 📲",
        description: "Transferir para um atendente, caso precise resolver um problema específico",
      },
      garcom: {
        rowId: "garcom",
        title: "Solicitar garçom à mesa 🤵",
        description: "Chame um garçom se precisar de algo que não esta no menu",
      },
      faq: {
        rowId: "faq",
        title: "Perguntas Frequentes ❔",
        description: "Horário de funcionamento, localização, eventos etc...",
      },
      adicionais: {
        rowId: "adicionais",
        title: "Finalizar e incluir adicionais ⭐️",
        description: "Inclua adicionais em seu pedido",
      },
      "recomendar-produto": {
        rowId: "recomendar-produto",
        title: "Finalizar pedido ✅",
        description: "Se estiver tudo pronto, finalize seu pedido",
      },
      "editar-pedido": {
        rowId: "editar-pedido",
        title: "Remover item ✏️",
        description: "Mudou de ideia? Remova um item da sua lista",
      },
      "finalizar-pedido": {
        rowId: "finalizar-pedido",
        title: "Finalizar pedido ✅",
        description: "Se estiver tudo pronto, finalize seu pedido",
      },
    };

    // Adiciona as seções de incluir recomendado dinamicamente
    if (sectionsName.includes("incluir-recomendado")) {
      const rows = Array.from({ length: args.qtdRecommended }, (_, index) => ({
        rowId: `incluir-recomendado${index + 1}`,
        title: `Incluir +${index + 1} no meu pedido`,
        description: `+R$ ${args.recommended.price.toFixed(2).replace(".", ",")} cada`,
      }));
      sectionMappings["incluir-recomendado"] = rows;
    }

    const rows = sectionsName
      .flatMap((name) => {
        if (sectionMappings[name] && (chatbot.config[name] || chatbot.config[name] === undefined)) {
          return sectionMappings[name];
        }
        return [];
      })
      .filter((row) => row !== null);

    return {
      title: title,
      rows: rows,
    };
  } catch (error) {
    console.log("Error in buildSection: ", error);
  }
}

export function checkMessageIDCode(currentMessage) {
  try {
    console.log('typeof currentMessage:', typeof currentMessage);
    if (typeof currentMessage === 'string') {
      const info = currentMessage.replace(/\s/g, "").split("#");
      console.log('info: ', info);
      if (info.length > 1) {
        const [modality, idNum] = info[info.length - 2].split(":");
        const [, code] = info[info.length - 1].split(":");
        if (modality && idNum && code) {
          const hash = CryptoJS.MD5(idNum).toString();
          console.log(`checkMessageIDCode:  int:${modality} - id:${idNum} - code:${code} - hash:${hash}`);
          if (code === hash.slice(-5)) return [modality, idNum];
        }
      }
    }
    return [false, false];
  } catch (error) {
    console.error("Error in checkMessageIDCode:", error);
    return [false, false];
  }
}
