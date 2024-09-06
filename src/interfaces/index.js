import df from "./default.js";
import mc from "./manychat.js";
import wpp from "./wppconnect.js";
import pw from "./printweb.js";

// Funções de padronização de mensagens dependendo da plataforma origem e do remetente
// Os nomes das funções são auto explicativos

export function standardizeMessageRequestToDefault(req) {
  switch (req.platform) {
    case undefined:
      return df.standardizeMessageToDefault(req);

    case 'manychat':
      return mc.ManychatMessageToDefault(req);

    case 'wppconnect':
      return wpp.WPPConnectMessageToDefault(req);
    default:
      break;
  }
};

export function standardizeConfigRequestToDefault(req) {
  switch (req.platform) {
    case undefined:
      return ;

    case 'manychat':
      return ;

    case 'wppconnect':
      return wpp.WppConnectConfigToDefault(req);

    case 'printweb':
      return pw.PrintWebConfigToDefault(req);
    default:
      break;
  }
};