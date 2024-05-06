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

export function standardizeDataRequestToDefault(req) {
  switch (req.platform) {
    case undefined:
      return ;

    case 'manychat':
      return ;

    case 'wppconnect':
      return ;

    case 'printweb':
      return pw.PrintWebDataToDefault(req);
    default:
      break;
  }
};
