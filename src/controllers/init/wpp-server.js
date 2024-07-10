import _interopRequireDefault from '@babel/runtime/helpers/interopRequireDefault';
import _config from '@wppconnect/server/dist/config.js'; // Especificando o arquivo .js
import { initServer as _initServer } from '@wppconnect/server/dist/index.js'; // Especificando o arquivo .js

const config = _interopRequireDefault(_config).default;

export const initServer = () => {
  return _initServer(config);
};
