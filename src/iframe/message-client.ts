import { uniqueId } from '@thalesrc/js-utils';
import { Subject } from 'rxjs';
import { MessageClient } from '../message-client';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { CHANNEL_PATH_SPLITTER } from './channel-path-splitter';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';

interface MessageEvent<T> {
  data: T;
}

export class IframeMessageClient extends MessageClient {
  public [RESPONSES$] = new Subject<MessageResponse>();

  constructor(private channelName = DEFAULT_CHANNEL_NAME) {
    super();

    window.addEventListener('message', ({data}: MessageEvent<MessageResponse>) => {
      if (!data
        || typeof data !== 'object'
        || typeof data.id === 'undefined'
        || typeof data.completed === 'undefined'
      ) {
        return;
      }

      this[RESPONSES$].next(data);
    });
  }

  public [SEND]<T>(message: Message<T>) {
    message = {...message, path: `${this.channelName}${CHANNEL_PATH_SPLITTER}${message.path}`};

    window.parent.postMessage(message, '*');
  }

  protected [GET_NEW_ID](): string {
    return uniqueId('hermes-iframe-message') as string;
  }
}
