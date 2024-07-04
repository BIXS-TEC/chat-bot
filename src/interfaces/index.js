import df from "./default.js";
import mc from "./manychat.js";
import wpp from "./wppconnect.js";
import pw from "./printweb.js";

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
      return req;

    case 'printweb':
      return pw.PrintWebConfigToDefault(req);
    default:
      break;
  }
};
