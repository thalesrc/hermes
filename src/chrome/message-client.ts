import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { MessageClient } from '../message-client';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { DEFAULT_CONNECTION_NAME } from './default-connection-name';
import { UniqueMessageIdHelper } from './unique-message-id.helper';

const PORT = Symbol('Port');
const RESPONSES_SUBJECT$ = Symbol('Responses Subject');

export class ChromeMessageClient extends MessageClient {
  private static readonly idHelper = new UniqueMessageIdHelper();

  public [RESPONSES$] = this[RESPONSES_SUBJECT$].asObservable().pipe(share());

  private[PORT]: chrome.runtime.Port;
  private [RESPONSES_SUBJECT$] = new Subject<MessageResponse>();

  constructor(name = DEFAULT_CONNECTION_NAME) {
    super();

    this[PORT] = chrome.runtime.connect({name});
    this[PORT].onMessage.addListener((message: MessageResponse) => {
      this[RESPONSES_SUBJECT$].next(message);
    });
  }

  public [SEND]<T>(message: Message<T>) {
    this[PORT].postMessage(message);
  }

  protected [GET_NEW_ID](): string {
    return ChromeMessageClient.idHelper.getId();
  }
}
