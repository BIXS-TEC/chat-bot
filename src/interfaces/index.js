import { standardizeMessageToDefault } from "./default.js";
import { ManychatMessageToDefault } from "./manychat.js";
import { WPPConnectMessageToDefault } from "./wppconnect.js";
import { PrintWebDataToDefault } from "./printweb.js";

export function standardizeMessageRequestToDefault(req) {
  switch (req.platform) {
    case undefined:
      return standardizeMessageToDefault(req);

    case 'manychat':
      return ManychatMessageToDefault(req);

    case 'wppconnect':
      return WPPConnectMessageToDefault(req);
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
      return PrintWebDataToDefault(req);
    default:
      break;
  }
};
