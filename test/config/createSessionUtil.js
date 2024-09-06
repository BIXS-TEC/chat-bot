"use strict";
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;

// node_modules/@wppconnect/server/dist/util/createSessionUtil.js
const PATH = 'http://atendi.bixs.com.br';
const axios = require('axios');
var _wppconnect = require("@wppconnect-team/wppconnect");


var _sessionController = require("../controller/sessionController");
var _chatWootClient = _interopRequireDefault(require("./chatWootClient"));
var _functions = require("./functions");
var _sessionUtil = require("./sessionUtil");
var _factory = _interopRequireDefault(require("./tokenStore/factory")); /*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CreateSessionUtil {startChatWootClient(client) {if (client.config.chatWoot && !client._chatWootClient) client._chatWootClient = new _chatWootClient.default(client.config.chatWoot, client.session);return client._chatWootClient;}async createSessionUtil(req, clientsArray,
  session,
  res)
  {
    try {
      let client = this.getClient(session);
      if (client.status != null && client.status !== 'CLOSED') return;
      client.status = 'INITIALIZING';
      client.config = req.body;

      const tokenStore = new _factory.default();
      const myTokenStore = tokenStore.createTokenStory(client);
      const tokenData = await myTokenStore.getToken(session);

      if (!tokenData) {
        myTokenStore.setToken(session, {});
      }

      this.startChatWootClient(client);

      if (req.serverOptions.customUserDataDir) {
        req.serverOptions.createOptions.puppeteerOptions = {
          userDataDir: req.serverOptions.customUserDataDir + session
        };
      }

      const wppClient = await (0, _wppconnect.create)(
        Object.assign(
          {},
          { tokenStore: myTokenStore },
          req.serverOptions.createOptions,
          {
            session: session,
            deviceName:
            client.config?.deviceName || req.serverOptions.deviceName,
            poweredBy:
            client.config?.poweredBy ||
            req.serverOptions.poweredBy ||
            'WPPConnect-Server',
            catchQR: (
            base64Qr,
            asciiQR,
            attempt,
            urlCode) =>
            {
              this.exportQR(req, base64Qr, urlCode, client, res);
            },
            onLoadingScreen: (percent, message) => {
              req.logger.info(`[${session}] ${percent}% - ${message}`);
            },
            statusFind: (statusFind) => {
              try {
                _sessionUtil.eventEmitter.emit(
                  `status-${client.session}`,
                  client,
                  statusFind
                );
                if (
                statusFind === 'autocloseCalled' ||
                statusFind === 'desconnectedMobile')
                {
                  client.status = 'CLOSED';
                  client.qrcode = null;
                  client.close();
                  clientsArray[session] = undefined;
                }
                (0, _functions.callWebHook)(client, req, 'status-find', {
                  status: statusFind,
                  session: client.session
                });
                req.logger.info(statusFind + '\n\n');
              } catch (error) {}
            }
          }
        )
      );

      client = clientsArray[session] = Object.assign(wppClient, client);
      await this.start(req, client);

      if (req.serverOptions.webhook.onParticipantsChanged) {
        await this.onParticipantsChanged(req, client);
      }

      if (req.serverOptions.webhook.onReactionMessage) {
        await this.onReactionMessage(client, req);
      }

      if (req.serverOptions.webhook.onRevokedMessage) {
        await this.onRevokedMessage(client, req);
      }

      if (req.serverOptions.webhook.onPollResponse) {
        await this.onPollResponse(client, req);
      }
      if (req.serverOptions.webhook.onLabelUpdated) {
        await this.onLabelUpdated(client, req);
      }

      console.log("\x1b[32;1m%s\x1b[0m", "Sessão conectada!", client.session);
      this.sessionConnected({session: client.session}); // Enviar notificação que a sessão foi inicializada
    } catch (e) {
      req.logger.error(e);
    }
  }

  async opendata(req, session, res) {
    await this.createSessionUtil(req, _sessionUtil.clientsArray, session, res);
  }

  exportQR(
  req,
  qrCode,
  urlCode,
  client,
  res)
  {
    _sessionUtil.eventEmitter.emit(`qrcode-${client.session}`, qrCode, urlCode, client);
    Object.assign(client, {
      status: 'QRCODE',
      qrcode: qrCode,
      urlcode: urlCode
    });

    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');

    req.io.emit('qrCode', {
      data: 'data:image/png;base64,' + imageBuffer.toString('base64'),
      session: client.session
    });

    (0, _functions.callWebHook)(client, req, 'qrcode', {
      qrcode: qrCode,
      urlcode: urlCode,
      session: client.session
    });
    if (res && !res._headerSent)
    res.status(200).json({
      status: 'qrcode',
      qrcode: qrCode,
      urlcode: urlCode,
      session: client.session
    });
  }

  async onParticipantsChanged(req, client) {
    await client.isConnected();
    await client.onParticipantsChanged((message) => {
      (0, _functions.callWebHook)(client, req, 'onparticipantschanged', message);
    });
  }

  // node_modules/@wppconnect/server/dist/util/createSessionUtil.js
  /**
   * Enviar a mensagem para ser tratada e pelo chatbot
   * @param {Object} message mensagem do wppconnect
   * @param {number} attempt Quantas vezes deve tentar reenviar a requisição em caso de falha
   * @returns 
   */
  async sendMessage(message, attempt = 1) {
    message.platform = "wppconnect";
    message.interaction = "cardapio-whatsapp";
    const url = PATH + '/message';

    try { 
        const response = await axios.post(url, message);
        console.log('Mensagem enviada com sucesso:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Tentativa ${attempt} falhou:`, error.message);
        if (attempt < 2) {
            return this.sendMessage(message, attempt + 1);
        } else {
            throw new Error('Falha ao enviar mensagem após 3 tentativas');
        }
    }
  }

  /**
   * Enviar requisição para notificar que a sessão finalizou a inicialização
   * @param {Object} message mensagem do wppconnect
   * @param {number} attempt Quantas vezes deve tentar reenviar a requisição em caso de falha
   * @returns 
   */
  async sessionConnected(message, attempt=0) {
    message.platform = "wppconnect";
    message.interaction = "session-connected";
    const url = PATH + '/config/sessionCreated';

    try { 
      const response = await axios.post(url, message);
      console.log('Evento [sessionConnected] enviado com sucesso:', response.data);
      return response.data;
    } catch (error) {
        console.error(`Tentativa ${attempt} falhou:`, error.message);
        if (attempt < 2) {
            return this.sessionConnected(message, attempt + 1);
        } else {
            throw new Error('Falha ao enviar evento [sessionConnected] após 3 tentativas');
        }
    }
  }

  async start(req, client) {
    try {
      await client.isConnected();
      Object.assign(client, { status: 'CONNECTED', qrcode: null });

      req.logger.info(`Started Session: ${client.session}`);
      //callWebHook(client, req, 'session-logged', { status: 'CONNECTED'});
      req.io.emit('session-logged', { status: true, session: client.session });
      (0, _functions.startHelper)(client, req);
    } catch (error) {
      req.logger.error(error);
      req.io.emit('session-error', client.session);
    }

    await this.checkStateSession(client, req);
    await this.listenMessages(client, req);

    if (req.serverOptions.webhook.listenAcks) {
      await this.listenAcks(client, req);
    }

    if (req.serverOptions.webhook.onPresenceChanged) {
      await this.onPresenceChanged(client, req);
    }
  }

  async checkStateSession(client, req) {
    await client.onStateChange((state) => {
      req.logger.info(`State Change ${state}: ${client.session}`);
      const conflits = [_wppconnect.SocketState.CONFLICT];

      if (conflits.includes(state)) {
        client.useHere();
      }
    });
  }

  async listenMessages(client, req) {
    await client.onMessage(async (message) => {
      _sessionUtil.eventEmitter.emit(`mensagem-${client.session}`, client, message);
      (0, _functions.callWebHook)(client, req, 'onmessage', message);
      if (message.type === 'location')
      client.onLiveLocation(message.sender.id, (location) => {
        (0, _functions.callWebHook)(client, req, 'location', location);
      });
    });

    await client.onAnyMessage(async (message) => {
      message.session = client.session;
      this.sendMessage(message); // Enviar mensagem para chatbot

      if (message.type === 'sticker') {
        (0, _sessionController.download)(message, client, req.logger);
      }

      if (
      req.serverOptions?.websocket?.autoDownload ||
      req.serverOptions?.webhook?.autoDownload && message.fromMe == false)
      {
        await (0, _functions.autoDownload)(client, req, message);
      }

      req.io.emit('received-message', { response: message });
      if (req.serverOptions.webhook.onSelfMessage && message.fromMe)
      (0, _functions.callWebHook)(client, req, 'onselfmessage', message);
    });

    await client.onIncomingCall(async (call) => {
      req.io.emit('incomingcall', call);
      (0, _functions.callWebHook)(client, req, 'incomingcall', call);
    });
  }

  async listenAcks(client, req) {
    await client.onAck(async (ack) => {
      req.io.emit('onack', ack);
      (0, _functions.callWebHook)(client, req, 'onack', ack);
    });
  }

  async onPresenceChanged(client, req) {
    await client.onPresenceChanged(async (presenceChangedEvent) => {
      req.io.emit('onpresencechanged', presenceChangedEvent);
      (0, _functions.callWebHook)(client, req, 'onpresencechanged', presenceChangedEvent);
    });
  }

  async onReactionMessage(client, req) {
    await client.isConnected();
    await client.onReactionMessage(async (reaction) => {
      req.io.emit('onreactionmessage', reaction);
      (0, _functions.callWebHook)(client, req, 'onreactionmessage', reaction);
    });
  }

  async onRevokedMessage(client, req) {
    await client.isConnected();
    await client.onRevokedMessage(async (response) => {
      req.io.emit('onrevokedmessage', response);
      (0, _functions.callWebHook)(client, req, 'onrevokedmessage', response);
    });
  }
  async onPollResponse(client, req) {
    await client.isConnected();
    await client.onPollResponse(async (response) => {
      req.io.emit('onpollresponse', response);
      (0, _functions.callWebHook)(client, req, 'onpollresponse', response);
    });
  }
  async onLabelUpdated(client, req) {
    await client.isConnected();
    await client.onUpdateLabel(async (response) => {
      req.io.emit('onupdatelabel', response);
      (0, _functions.callWebHook)(client, req, 'onupdatelabel', response);
    });
  }

  encodeFunction(data, webhook) {
    data.webhook = webhook;
    return JSON.stringify(data);
  }

  decodeFunction(text, client) {
    const object = JSON.parse(text);
    if (object.webhook && !client.webhook) client.webhook = object.webhook;
    delete object.webhook;
    return object;
  }

  getClient(session) {
    let client = _sessionUtil.clientsArray[session];

    if (!client)
    client = _sessionUtil.clientsArray[session] = {
      status: null,
      session: session
    };
    return client;
  }
}exports.default = CreateSessionUtil;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfd3BwY29ubmVjdCIsInJlcXVpcmUiLCJfc2Vzc2lvbkNvbnRyb2xsZXIiLCJfY2hhdFdvb3RDbGllbnQiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwiX2Z1bmN0aW9ucyIsIl9zZXNzaW9uVXRpbCIsIl9mYWN0b3J5IiwiQ3JlYXRlU2Vzc2lvblV0aWwiLCJzdGFydENoYXRXb290Q2xpZW50IiwiY2xpZW50IiwiY29uZmlnIiwiY2hhdFdvb3QiLCJjaGF0V29vdENsaWVudCIsInNlc3Npb24iLCJjcmVhdGVTZXNzaW9uVXRpbCIsInJlcSIsImNsaWVudHNBcnJheSIsInJlcyIsImdldENsaWVudCIsInN0YXR1cyIsImJvZHkiLCJ0b2tlblN0b3JlIiwiRmFjdG9yeSIsIm15VG9rZW5TdG9yZSIsImNyZWF0ZVRva2VuU3RvcnkiLCJ0b2tlbkRhdGEiLCJnZXRUb2tlbiIsInNldFRva2VuIiwic2VydmVyT3B0aW9ucyIsImN1c3RvbVVzZXJEYXRhRGlyIiwiY3JlYXRlT3B0aW9ucyIsInB1cHBldGVlck9wdGlvbnMiLCJ1c2VyRGF0YURpciIsIndwcENsaWVudCIsImNyZWF0ZSIsIk9iamVjdCIsImFzc2lnbiIsImRldmljZU5hbWUiLCJwb3dlcmVkQnkiLCJjYXRjaFFSIiwiYmFzZTY0UXIiLCJhc2NpaVFSIiwiYXR0ZW1wdCIsInVybENvZGUiLCJleHBvcnRRUiIsIm9uTG9hZGluZ1NjcmVlbiIsInBlcmNlbnQiLCJtZXNzYWdlIiwibG9nZ2VyIiwiaW5mbyIsInN0YXR1c0ZpbmQiLCJldmVudEVtaXR0ZXIiLCJlbWl0IiwicXJjb2RlIiwiY2xvc2UiLCJ1bmRlZmluZWQiLCJjYWxsV2ViSG9vayIsImVycm9yIiwic3RhcnQiLCJ3ZWJob29rIiwib25QYXJ0aWNpcGFudHNDaGFuZ2VkIiwib25SZWFjdGlvbk1lc3NhZ2UiLCJvblJldm9rZWRNZXNzYWdlIiwib25Qb2xsUmVzcG9uc2UiLCJvbkxhYmVsVXBkYXRlZCIsImUiLCJvcGVuZGF0YSIsInFyQ29kZSIsInVybGNvZGUiLCJyZXBsYWNlIiwiaW1hZ2VCdWZmZXIiLCJCdWZmZXIiLCJmcm9tIiwiaW8iLCJkYXRhIiwidG9TdHJpbmciLCJfaGVhZGVyU2VudCIsImpzb24iLCJpc0Nvbm5lY3RlZCIsInN0YXJ0SGVscGVyIiwiY2hlY2tTdGF0ZVNlc3Npb24iLCJsaXN0ZW5NZXNzYWdlcyIsImxpc3RlbkFja3MiLCJvblByZXNlbmNlQ2hhbmdlZCIsIm9uU3RhdGVDaGFuZ2UiLCJzdGF0ZSIsImNvbmZsaXRzIiwiU29ja2V0U3RhdGUiLCJDT05GTElDVCIsImluY2x1ZGVzIiwidXNlSGVyZSIsIm9uTWVzc2FnZSIsInR5cGUiLCJvbkxpdmVMb2NhdGlvbiIsInNlbmRlciIsImlkIiwibG9jYXRpb24iLCJvbkFueU1lc3NhZ2UiLCJkb3dubG9hZCIsIndlYnNvY2tldCIsImF1dG9Eb3dubG9hZCIsImZyb21NZSIsInJlc3BvbnNlIiwib25TZWxmTWVzc2FnZSIsIm9uSW5jb21pbmdDYWxsIiwiY2FsbCIsIm9uQWNrIiwiYWNrIiwicHJlc2VuY2VDaGFuZ2VkRXZlbnQiLCJyZWFjdGlvbiIsIm9uVXBkYXRlTGFiZWwiLCJlbmNvZGVGdW5jdGlvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJkZWNvZGVGdW5jdGlvbiIsInRleHQiLCJvYmplY3QiLCJwYXJzZSIsImV4cG9ydHMiLCJkZWZhdWx0Il0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvY3JlYXRlU2Vzc2lvblV0aWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDIxIFdQUENvbm5lY3QgVGVhbVxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHsgY3JlYXRlLCBTb2NrZXRTdGF0ZSB9IGZyb20gJ0B3cHBjb25uZWN0LXRlYW0vd3BwY29ubmVjdCc7XG5pbXBvcnQgeyBSZXF1ZXN0IH0gZnJvbSAnZXhwcmVzcyc7XG5cbmltcG9ydCB7IGRvd25sb2FkIH0gZnJvbSAnLi4vY29udHJvbGxlci9zZXNzaW9uQ29udHJvbGxlcic7XG5pbXBvcnQgeyBXaGF0c0FwcFNlcnZlciB9IGZyb20gJy4uL3R5cGVzL1doYXRzQXBwU2VydmVyJztcbmltcG9ydCBjaGF0V29vdENsaWVudCBmcm9tICcuL2NoYXRXb290Q2xpZW50JztcbmltcG9ydCB7IGF1dG9Eb3dubG9hZCwgY2FsbFdlYkhvb2ssIHN0YXJ0SGVscGVyIH0gZnJvbSAnLi9mdW5jdGlvbnMnO1xuaW1wb3J0IHsgY2xpZW50c0FycmF5LCBldmVudEVtaXR0ZXIgfSBmcm9tICcuL3Nlc3Npb25VdGlsJztcbmltcG9ydCBGYWN0b3J5IGZyb20gJy4vdG9rZW5TdG9yZS9mYWN0b3J5JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3JlYXRlU2Vzc2lvblV0aWwge1xuICBzdGFydENoYXRXb290Q2xpZW50KGNsaWVudDogYW55KSB7XG4gICAgaWYgKGNsaWVudC5jb25maWcuY2hhdFdvb3QgJiYgIWNsaWVudC5fY2hhdFdvb3RDbGllbnQpXG4gICAgICBjbGllbnQuX2NoYXRXb290Q2xpZW50ID0gbmV3IGNoYXRXb290Q2xpZW50KFxuICAgICAgICBjbGllbnQuY29uZmlnLmNoYXRXb290LFxuICAgICAgICBjbGllbnQuc2Vzc2lvblxuICAgICAgKTtcbiAgICByZXR1cm4gY2xpZW50Ll9jaGF0V29vdENsaWVudDtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZVNlc3Npb25VdGlsKFxuICAgIHJlcTogYW55LFxuICAgIGNsaWVudHNBcnJheTogYW55LFxuICAgIHNlc3Npb246IHN0cmluZyxcbiAgICByZXM/OiBhbnlcbiAgKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBjbGllbnQgPSB0aGlzLmdldENsaWVudChzZXNzaW9uKSBhcyBhbnk7XG4gICAgICBpZiAoY2xpZW50LnN0YXR1cyAhPSBudWxsICYmIGNsaWVudC5zdGF0dXMgIT09ICdDTE9TRUQnKSByZXR1cm47XG4gICAgICBjbGllbnQuc3RhdHVzID0gJ0lOSVRJQUxJWklORyc7XG4gICAgICBjbGllbnQuY29uZmlnID0gcmVxLmJvZHk7XG5cbiAgICAgIGNvbnN0IHRva2VuU3RvcmUgPSBuZXcgRmFjdG9yeSgpO1xuICAgICAgY29uc3QgbXlUb2tlblN0b3JlID0gdG9rZW5TdG9yZS5jcmVhdGVUb2tlblN0b3J5KGNsaWVudCk7XG4gICAgICBjb25zdCB0b2tlbkRhdGEgPSBhd2FpdCBteVRva2VuU3RvcmUuZ2V0VG9rZW4oc2Vzc2lvbik7XG5cbiAgICAgIGlmICghdG9rZW5EYXRhKSB7XG4gICAgICAgIG15VG9rZW5TdG9yZS5zZXRUb2tlbihzZXNzaW9uLCB7fSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhcnRDaGF0V29vdENsaWVudChjbGllbnQpO1xuXG4gICAgICBpZiAocmVxLnNlcnZlck9wdGlvbnMuY3VzdG9tVXNlckRhdGFEaXIpIHtcbiAgICAgICAgcmVxLnNlcnZlck9wdGlvbnMuY3JlYXRlT3B0aW9ucy5wdXBwZXRlZXJPcHRpb25zID0ge1xuICAgICAgICAgIHVzZXJEYXRhRGlyOiByZXEuc2VydmVyT3B0aW9ucy5jdXN0b21Vc2VyRGF0YURpciArIHNlc3Npb24sXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHdwcENsaWVudCA9IGF3YWl0IGNyZWF0ZShcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB7fSxcbiAgICAgICAgICB7IHRva2VuU3RvcmU6IG15VG9rZW5TdG9yZSB9LFxuICAgICAgICAgIHJlcS5zZXJ2ZXJPcHRpb25zLmNyZWF0ZU9wdGlvbnMsXG4gICAgICAgICAge1xuICAgICAgICAgICAgc2Vzc2lvbjogc2Vzc2lvbixcbiAgICAgICAgICAgIGRldmljZU5hbWU6XG4gICAgICAgICAgICAgIGNsaWVudC5jb25maWc/LmRldmljZU5hbWUgfHwgcmVxLnNlcnZlck9wdGlvbnMuZGV2aWNlTmFtZSxcbiAgICAgICAgICAgIHBvd2VyZWRCeTpcbiAgICAgICAgICAgICAgY2xpZW50LmNvbmZpZz8ucG93ZXJlZEJ5IHx8XG4gICAgICAgICAgICAgIHJlcS5zZXJ2ZXJPcHRpb25zLnBvd2VyZWRCeSB8fFxuICAgICAgICAgICAgICAnV1BQQ29ubmVjdC1TZXJ2ZXInLFxuICAgICAgICAgICAgY2F0Y2hRUjogKFxuICAgICAgICAgICAgICBiYXNlNjRRcjogYW55LFxuICAgICAgICAgICAgICBhc2NpaVFSOiBhbnksXG4gICAgICAgICAgICAgIGF0dGVtcHQ6IGFueSxcbiAgICAgICAgICAgICAgdXJsQ29kZTogc3RyaW5nXG4gICAgICAgICAgICApID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5leHBvcnRRUihyZXEsIGJhc2U2NFFyLCB1cmxDb2RlLCBjbGllbnQsIHJlcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25Mb2FkaW5nU2NyZWVuOiAocGVyY2VudDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgcmVxLmxvZ2dlci5pbmZvKGBbJHtzZXNzaW9ufV0gJHtwZXJjZW50fSUgLSAke21lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdHVzRmluZDogKHN0YXR1c0ZpbmQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KFxuICAgICAgICAgICAgICAgICAgYHN0YXR1cy0ke2NsaWVudC5zZXNzaW9ufWAsXG4gICAgICAgICAgICAgICAgICBjbGllbnQsXG4gICAgICAgICAgICAgICAgICBzdGF0dXNGaW5kXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICBzdGF0dXNGaW5kID09PSAnYXV0b2Nsb3NlQ2FsbGVkJyB8fFxuICAgICAgICAgICAgICAgICAgc3RhdHVzRmluZCA9PT0gJ2Rlc2Nvbm5lY3RlZE1vYmlsZSdcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIGNsaWVudC5zdGF0dXMgPSAnQ0xPU0VEJztcbiAgICAgICAgICAgICAgICAgIGNsaWVudC5xcmNvZGUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgY2xpZW50LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICBjbGllbnRzQXJyYXlbc2Vzc2lvbl0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnc3RhdHVzLWZpbmQnLCB7XG4gICAgICAgICAgICAgICAgICBzdGF0dXM6IHN0YXR1c0ZpbmQsXG4gICAgICAgICAgICAgICAgICBzZXNzaW9uOiBjbGllbnQuc2Vzc2lvbixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXEubG9nZ2VyLmluZm8oc3RhdHVzRmluZCArICdcXG5cXG4nKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKTtcblxuICAgICAgY2xpZW50ID0gY2xpZW50c0FycmF5W3Nlc3Npb25dID0gT2JqZWN0LmFzc2lnbih3cHBDbGllbnQsIGNsaWVudCk7XG4gICAgICBhd2FpdCB0aGlzLnN0YXJ0KHJlcSwgY2xpZW50KTtcblxuICAgICAgaWYgKHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2sub25QYXJ0aWNpcGFudHNDaGFuZ2VkKSB7XG4gICAgICAgIGF3YWl0IHRoaXMub25QYXJ0aWNpcGFudHNDaGFuZ2VkKHJlcSwgY2xpZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2sub25SZWFjdGlvbk1lc3NhZ2UpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5vblJlYWN0aW9uTWVzc2FnZShjbGllbnQsIHJlcSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLm9uUmV2b2tlZE1lc3NhZ2UpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5vblJldm9rZWRNZXNzYWdlKGNsaWVudCwgcmVxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2sub25Qb2xsUmVzcG9uc2UpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5vblBvbGxSZXNwb25zZShjbGllbnQsIHJlcSk7XG4gICAgICB9XG4gICAgICBpZiAocmVxLnNlcnZlck9wdGlvbnMud2ViaG9vay5vbkxhYmVsVXBkYXRlZCkge1xuICAgICAgICBhd2FpdCB0aGlzLm9uTGFiZWxVcGRhdGVkKGNsaWVudCwgcmVxKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIG9wZW5kYXRhKHJlcTogUmVxdWVzdCwgc2Vzc2lvbjogc3RyaW5nLCByZXM/OiBhbnkpIHtcbiAgICBhd2FpdCB0aGlzLmNyZWF0ZVNlc3Npb25VdGlsKHJlcSwgY2xpZW50c0FycmF5LCBzZXNzaW9uLCByZXMpO1xuICB9XG5cbiAgZXhwb3J0UVIoXG4gICAgcmVxOiBhbnksXG4gICAgcXJDb2RlOiBhbnksXG4gICAgdXJsQ29kZTogYW55LFxuICAgIGNsaWVudDogV2hhdHNBcHBTZXJ2ZXIsXG4gICAgcmVzPzogYW55XG4gICkge1xuICAgIGV2ZW50RW1pdHRlci5lbWl0KGBxcmNvZGUtJHtjbGllbnQuc2Vzc2lvbn1gLCBxckNvZGUsIHVybENvZGUsIGNsaWVudCk7XG4gICAgT2JqZWN0LmFzc2lnbihjbGllbnQsIHtcbiAgICAgIHN0YXR1czogJ1FSQ09ERScsXG4gICAgICBxcmNvZGU6IHFyQ29kZSxcbiAgICAgIHVybGNvZGU6IHVybENvZGUsXG4gICAgfSk7XG5cbiAgICBxckNvZGUgPSBxckNvZGUucmVwbGFjZSgnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcsICcnKTtcbiAgICBjb25zdCBpbWFnZUJ1ZmZlciA9IEJ1ZmZlci5mcm9tKHFyQ29kZSwgJ2Jhc2U2NCcpO1xuXG4gICAgcmVxLmlvLmVtaXQoJ3FyQ29kZScsIHtcbiAgICAgIGRhdGE6ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlQnVmZmVyLnRvU3RyaW5nKCdiYXNlNjQnKSxcbiAgICAgIHNlc3Npb246IGNsaWVudC5zZXNzaW9uLFxuICAgIH0pO1xuXG4gICAgY2FsbFdlYkhvb2soY2xpZW50LCByZXEsICdxcmNvZGUnLCB7XG4gICAgICBxcmNvZGU6IHFyQ29kZSxcbiAgICAgIHVybGNvZGU6IHVybENvZGUsXG4gICAgICBzZXNzaW9uOiBjbGllbnQuc2Vzc2lvbixcbiAgICB9KTtcbiAgICBpZiAocmVzICYmICFyZXMuX2hlYWRlclNlbnQpXG4gICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgICAgIHN0YXR1czogJ3FyY29kZScsXG4gICAgICAgIHFyY29kZTogcXJDb2RlLFxuICAgICAgICB1cmxjb2RlOiB1cmxDb2RlLFxuICAgICAgICBzZXNzaW9uOiBjbGllbnQuc2Vzc2lvbixcbiAgICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgb25QYXJ0aWNpcGFudHNDaGFuZ2VkKHJlcTogYW55LCBjbGllbnQ6IGFueSkge1xuICAgIGF3YWl0IGNsaWVudC5pc0Nvbm5lY3RlZCgpO1xuICAgIGF3YWl0IGNsaWVudC5vblBhcnRpY2lwYW50c0NoYW5nZWQoKG1lc3NhZ2U6IGFueSkgPT4ge1xuICAgICAgY2FsbFdlYkhvb2soY2xpZW50LCByZXEsICdvbnBhcnRpY2lwYW50c2NoYW5nZWQnLCBtZXNzYWdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0KHJlcTogUmVxdWVzdCwgY2xpZW50OiBXaGF0c0FwcFNlcnZlcikge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjbGllbnQuaXNDb25uZWN0ZWQoKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oY2xpZW50LCB7IHN0YXR1czogJ0NPTk5FQ1RFRCcsIHFyY29kZTogbnVsbCB9KTtcblxuICAgICAgcmVxLmxvZ2dlci5pbmZvKGBTdGFydGVkIFNlc3Npb246ICR7Y2xpZW50LnNlc3Npb259YCk7XG4gICAgICAvL2NhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnc2Vzc2lvbi1sb2dnZWQnLCB7IHN0YXR1czogJ0NPTk5FQ1RFRCd9KTtcbiAgICAgIHJlcS5pby5lbWl0KCdzZXNzaW9uLWxvZ2dlZCcsIHsgc3RhdHVzOiB0cnVlLCBzZXNzaW9uOiBjbGllbnQuc2Vzc2lvbiB9KTtcbiAgICAgIHN0YXJ0SGVscGVyKGNsaWVudCwgcmVxKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XG4gICAgICByZXEuaW8uZW1pdCgnc2Vzc2lvbi1lcnJvcicsIGNsaWVudC5zZXNzaW9uKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmNoZWNrU3RhdGVTZXNzaW9uKGNsaWVudCwgcmVxKTtcbiAgICBhd2FpdCB0aGlzLmxpc3Rlbk1lc3NhZ2VzKGNsaWVudCwgcmVxKTtcblxuICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLmxpc3RlbkFja3MpIHtcbiAgICAgIGF3YWl0IHRoaXMubGlzdGVuQWNrcyhjbGllbnQsIHJlcSk7XG4gICAgfVxuXG4gICAgaWYgKHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2sub25QcmVzZW5jZUNoYW5nZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMub25QcmVzZW5jZUNoYW5nZWQoY2xpZW50LCByZXEpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrU3RhdGVTZXNzaW9uKGNsaWVudDogV2hhdHNBcHBTZXJ2ZXIsIHJlcTogUmVxdWVzdCkge1xuICAgIGF3YWl0IGNsaWVudC5vblN0YXRlQ2hhbmdlKChzdGF0ZSkgPT4ge1xuICAgICAgcmVxLmxvZ2dlci5pbmZvKGBTdGF0ZSBDaGFuZ2UgJHtzdGF0ZX06ICR7Y2xpZW50LnNlc3Npb259YCk7XG4gICAgICBjb25zdCBjb25mbGl0cyA9IFtTb2NrZXRTdGF0ZS5DT05GTElDVF07XG5cbiAgICAgIGlmIChjb25mbGl0cy5pbmNsdWRlcyhzdGF0ZSkpIHtcbiAgICAgICAgY2xpZW50LnVzZUhlcmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGxpc3Rlbk1lc3NhZ2VzKGNsaWVudDogV2hhdHNBcHBTZXJ2ZXIsIHJlcTogUmVxdWVzdCkge1xuICAgIGF3YWl0IGNsaWVudC5vbk1lc3NhZ2UoYXN5bmMgKG1lc3NhZ2U6IGFueSkgPT4ge1xuICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoYG1lbnNhZ2VtLSR7Y2xpZW50LnNlc3Npb259YCwgY2xpZW50LCBtZXNzYWdlKTtcbiAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnb25tZXNzYWdlJywgbWVzc2FnZSk7XG4gICAgICBpZiAobWVzc2FnZS50eXBlID09PSAnbG9jYXRpb24nKVxuICAgICAgICBjbGllbnQub25MaXZlTG9jYXRpb24obWVzc2FnZS5zZW5kZXIuaWQsIChsb2NhdGlvbikgPT4ge1xuICAgICAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnbG9jYXRpb24nLCBsb2NhdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgYXdhaXQgY2xpZW50Lm9uQW55TWVzc2FnZShhc3luYyAobWVzc2FnZTogYW55KSA9PiB7XG4gICAgICBtZXNzYWdlLnNlc3Npb24gPSBjbGllbnQuc2Vzc2lvbjtcblxuICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ3N0aWNrZXInKSB7XG4gICAgICAgIGRvd25sb2FkKG1lc3NhZ2UsIGNsaWVudCwgcmVxLmxvZ2dlcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgcmVxLnNlcnZlck9wdGlvbnM/LndlYnNvY2tldD8uYXV0b0Rvd25sb2FkIHx8XG4gICAgICAgIChyZXEuc2VydmVyT3B0aW9ucz8ud2ViaG9vaz8uYXV0b0Rvd25sb2FkICYmIG1lc3NhZ2UuZnJvbU1lID09IGZhbHNlKVxuICAgICAgKSB7XG4gICAgICAgIGF3YWl0IGF1dG9Eb3dubG9hZChjbGllbnQsIHJlcSwgbWVzc2FnZSk7XG4gICAgICB9XG5cbiAgICAgIHJlcS5pby5lbWl0KCdyZWNlaXZlZC1tZXNzYWdlJywgeyByZXNwb25zZTogbWVzc2FnZSB9KTtcbiAgICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLm9uU2VsZk1lc3NhZ2UgJiYgbWVzc2FnZS5mcm9tTWUpXG4gICAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnb25zZWxmbWVzc2FnZScsIG1lc3NhZ2UpO1xuICAgIH0pO1xuXG4gICAgYXdhaXQgY2xpZW50Lm9uSW5jb21pbmdDYWxsKGFzeW5jIChjYWxsKSA9PiB7XG4gICAgICByZXEuaW8uZW1pdCgnaW5jb21pbmdjYWxsJywgY2FsbCk7XG4gICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ2luY29taW5nY2FsbCcsIGNhbGwpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgbGlzdGVuQWNrcyhjbGllbnQ6IFdoYXRzQXBwU2VydmVyLCByZXE6IFJlcXVlc3QpIHtcbiAgICBhd2FpdCBjbGllbnQub25BY2soYXN5bmMgKGFjaykgPT4ge1xuICAgICAgcmVxLmlvLmVtaXQoJ29uYWNrJywgYWNrKTtcbiAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnb25hY2snLCBhY2spO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgb25QcmVzZW5jZUNoYW5nZWQoY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XG4gICAgYXdhaXQgY2xpZW50Lm9uUHJlc2VuY2VDaGFuZ2VkKGFzeW5jIChwcmVzZW5jZUNoYW5nZWRFdmVudCkgPT4ge1xuICAgICAgcmVxLmlvLmVtaXQoJ29ucHJlc2VuY2VjaGFuZ2VkJywgcHJlc2VuY2VDaGFuZ2VkRXZlbnQpO1xuICAgICAgY2FsbFdlYkhvb2soY2xpZW50LCByZXEsICdvbnByZXNlbmNlY2hhbmdlZCcsIHByZXNlbmNlQ2hhbmdlZEV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIG9uUmVhY3Rpb25NZXNzYWdlKGNsaWVudDogV2hhdHNBcHBTZXJ2ZXIsIHJlcTogUmVxdWVzdCkge1xuICAgIGF3YWl0IGNsaWVudC5pc0Nvbm5lY3RlZCgpO1xuICAgIGF3YWl0IGNsaWVudC5vblJlYWN0aW9uTWVzc2FnZShhc3luYyAocmVhY3Rpb246IGFueSkgPT4ge1xuICAgICAgcmVxLmlvLmVtaXQoJ29ucmVhY3Rpb25tZXNzYWdlJywgcmVhY3Rpb24pO1xuICAgICAgY2FsbFdlYkhvb2soY2xpZW50LCByZXEsICdvbnJlYWN0aW9ubWVzc2FnZScsIHJlYWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIG9uUmV2b2tlZE1lc3NhZ2UoY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XG4gICAgYXdhaXQgY2xpZW50LmlzQ29ubmVjdGVkKCk7XG4gICAgYXdhaXQgY2xpZW50Lm9uUmV2b2tlZE1lc3NhZ2UoYXN5bmMgKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgIHJlcS5pby5lbWl0KCdvbnJldm9rZWRtZXNzYWdlJywgcmVzcG9uc2UpO1xuICAgICAgY2FsbFdlYkhvb2soY2xpZW50LCByZXEsICdvbnJldm9rZWRtZXNzYWdlJywgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG4gIGFzeW5jIG9uUG9sbFJlc3BvbnNlKGNsaWVudDogV2hhdHNBcHBTZXJ2ZXIsIHJlcTogUmVxdWVzdCkge1xuICAgIGF3YWl0IGNsaWVudC5pc0Nvbm5lY3RlZCgpO1xuICAgIGF3YWl0IGNsaWVudC5vblBvbGxSZXNwb25zZShhc3luYyAocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgcmVxLmlvLmVtaXQoJ29ucG9sbHJlc3BvbnNlJywgcmVzcG9uc2UpO1xuICAgICAgY2FsbFdlYkhvb2soY2xpZW50LCByZXEsICdvbnBvbGxyZXNwb25zZScsIHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxuICBhc3luYyBvbkxhYmVsVXBkYXRlZChjbGllbnQ6IFdoYXRzQXBwU2VydmVyLCByZXE6IFJlcXVlc3QpIHtcbiAgICBhd2FpdCBjbGllbnQuaXNDb25uZWN0ZWQoKTtcbiAgICBhd2FpdCBjbGllbnQub25VcGRhdGVMYWJlbChhc3luYyAocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgcmVxLmlvLmVtaXQoJ29udXBkYXRlbGFiZWwnLCByZXNwb25zZSk7XG4gICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ29udXBkYXRlbGFiZWwnLCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH1cblxuICBlbmNvZGVGdW5jdGlvbihkYXRhOiBhbnksIHdlYmhvb2s6IGFueSkge1xuICAgIGRhdGEud2ViaG9vayA9IHdlYmhvb2s7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICB9XG5cbiAgZGVjb2RlRnVuY3Rpb24odGV4dDogYW55LCBjbGllbnQ6IGFueSkge1xuICAgIGNvbnN0IG9iamVjdCA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgaWYgKG9iamVjdC53ZWJob29rICYmICFjbGllbnQud2ViaG9vaykgY2xpZW50LndlYmhvb2sgPSBvYmplY3Qud2ViaG9vaztcbiAgICBkZWxldGUgb2JqZWN0LndlYmhvb2s7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuXG4gIGdldENsaWVudChzZXNzaW9uOiBhbnkpIHtcbiAgICBsZXQgY2xpZW50ID0gY2xpZW50c0FycmF5W3Nlc3Npb25dO1xuXG4gICAgaWYgKCFjbGllbnQpXG4gICAgICBjbGllbnQgPSBjbGllbnRzQXJyYXlbc2Vzc2lvbl0gPSB7XG4gICAgICAgIHN0YXR1czogbnVsbCxcbiAgICAgICAgc2Vzc2lvbjogc2Vzc2lvbixcbiAgICAgIH0gYXMgYW55O1xuICAgIHJldHVybiBjbGllbnQ7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsSUFBQUEsV0FBQSxHQUFBQyxPQUFBOzs7QUFHQSxJQUFBQyxrQkFBQSxHQUFBRCxPQUFBOztBQUVBLElBQUFFLGVBQUEsR0FBQUMsc0JBQUEsQ0FBQUgsT0FBQTtBQUNBLElBQUFJLFVBQUEsR0FBQUosT0FBQTtBQUNBLElBQUFLLFlBQUEsR0FBQUwsT0FBQTtBQUNBLElBQUFNLFFBQUEsR0FBQUgsc0JBQUEsQ0FBQUgsT0FBQSwwQkFBMkMsQ0F2QjNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQVdlLE1BQU1PLGlCQUFpQixDQUFDLENBQ3JDQyxtQkFBbUJBLENBQUNDLE1BQVcsRUFBRSxDQUMvQixJQUFJQSxNQUFNLENBQUNDLE1BQU0sQ0FBQ0MsUUFBUSxJQUFJLENBQUNGLE1BQU0sQ0FBQ1AsZUFBZSxFQUNuRE8sTUFBTSxDQUFDUCxlQUFlLEdBQUcsSUFBSVUs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