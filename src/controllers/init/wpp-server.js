import _interopRequireDefault from '@babel/runtime/helpers/interopRequireDefault';
import _config from '@wppconnect/server/dist/config';
import { initServer as _initServer } from '@wppconnect/server/dist/index';

export const initServer = () => {
  return _initServer(_interopRequireDefault(_config).default);
};
