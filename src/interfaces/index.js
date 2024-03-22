import { ManychatRequestToDefault } from "./manychat.js";
import { WPPConnectRequestToDefault } from "./wppconnect.js";
import { standardizeDefaultRequest } from "./default.js";

export default function standardizeRequestToClientObject(req) {
  switch (req.platform) {
    case undefined:
      return standardizeDefaultRequest(req);

    case 'manychat':
      return ManychatRequestToDefault(req);

    case 'wppconnect':
      return WPPConnectRequestToDefault(req);
    default:
      break;
  }
};