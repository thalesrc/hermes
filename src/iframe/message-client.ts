import { uniqueId } from '@thalesrc/js-utils';
import { Subject } from 'rxjs';
import { MessageClient } from '../message-client';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { CHANNEL_PATH_SPLITTER } from './channel-path-splitter';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { Mixin } from '../mixin';
import { WithTarget, TARGET_FRAME } from './with-target';
import { IFrame } from './iframe.type';

interface HermesMessageEvent<T> extends MessageEvent {
  data: T;
}

// @ts-ignore
export class IframeMessageClient extends Mixin(MessageClient, WithTarget) {
  public [RESPONSES$] = new Subject<MessageResponse>();

  constructor(
    private channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrame
  ) {
    super([], [targetFrame]);

    window.addEventListener('message', ({data, source}: HermesMessageEvent<MessageResponse>) => {
      const target = this[TARGET_FRAME];

      if (target && source !== target.contentWindow) return;

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

    const target = this[TARGET_FRAME];

    if (target) {
      target.contentWindow.postMessage(message, '*');
    } else {
      window.parent.postMessage(message, '*');
    }
  }

  protected [GET_NEW_ID](): string {
    return uniqueId('hermes-iframe-message') as string;
  }
}
