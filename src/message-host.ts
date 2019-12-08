import { mapMerge } from '@thalesrc/js-utils/map-merge';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ListenerStorage } from './listener-storage.type';
import { MessageResponse } from './message-response.type';
import { Message } from './message.interface';
import { MESSAGE_LISTENERS } from './selectors';

/**
 * Listeners property symbol
 */
export const GET_LISTENERS: unique symbol = Symbol('Message Host Listeners');

/**
 * Message Host
 */
export abstract class MessageHost {

  /**
   * Run this method to start listening the requests
   */
  protected readonly listen = (messages$: Observable<Message>): void => {
    for (const [path, listener] of this[GET_LISTENERS]()) {
      messages$
        .pipe(filter(({path: messagePath}) => path === messagePath))
        .subscribe(async ({body, id}) => {

          for await (const result of listener.call(this, body)) {
            this.response({completed: false, id, body: result});
          }

          this.response({completed: true, id });
        });
    }
  }

  /**
   * Build a reponse method to send the responses to the requests by using the communication methods of the platform
   *
   * @param message Incoming response message
   */
  protected abstract response(message: MessageResponse): void;

  /**
   * All inherited listeners
   */
  private [GET_LISTENERS](): ListenerStorage {
    let map: ListenerStorage = new Map();

    let currentProto = this['__proto__' + ''];

    while (currentProto.constructor !== Object) {
      if (currentProto.constructor[MESSAGE_LISTENERS]) {
        map = mapMerge(map, currentProto.constructor[MESSAGE_LISTENERS] as ListenerStorage);
      }

      currentProto = currentProto.__proto__;
    }

    return map;
  }
}
