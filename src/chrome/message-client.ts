import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import { MessageClient } from '../message-client';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { DEFAULT_CONNECTION_NAME } from './default-connection-name';
import { UniqueMessageIdHelper } from './unique-message-id.helper';

const PORT = Symbol('Port');
const ID_HELPER = Symbol('Id Helper');

interface Connection {
  port: chrome.runtime.Port;
  responses: Observable<MessageResponse>;
}

export class ChromeMessageClient extends MessageClient {
  private static readonly connections: {[key: string]: Connection} = {};

  private readonly [ID_HELPER] = new UniqueMessageIdHelper();
  public [RESPONSES$]: Observable<MessageResponse>;
  private [PORT]: chrome.runtime.Port;

  constructor(name = DEFAULT_CONNECTION_NAME) {
    super();

    if (!(name in ChromeMessageClient.connections)) {
      const port = chrome.runtime.connect({name});
      const responses = new Observable<MessageResponse>(subscriber => {
        port.onMessage.addListener((message: MessageResponse) => {
          subscriber.next(message);
        });
      }).pipe(share());

      ChromeMessageClient.connections[name] = {port, responses};
    }

    this[PORT] = ChromeMessageClient.connections[name].port;
    this[RESPONSES$] = ChromeMessageClient.connections[name].responses;
  }

  public [SEND]<T>(message: Message<T>) {
    this[PORT].postMessage(message);
  }

  protected [GET_NEW_ID](): string {
    return this[ID_HELPER].getId();
  }
}
