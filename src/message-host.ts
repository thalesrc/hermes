import { noop } from '@thalesrc/js-utils';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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
   * Message Terminator Subject
   *
   * Use `next(messageId)` method to terminate a message connection
   */
  protected readonly terminateMessage$ = new Subject<string>();

  /**
   * Run this method to start listening the requests
   */
  protected readonly listen = (messages$: Observable<Message>): void => {
    for (const [path, listeners] of this[GET_LISTENERS]()) {
      messages$
        .pipe(filter(({path: messagePath}) => path === messagePath))
        .subscribe(({body, id}) => {
          for (const listener of listeners) {
            (listener.call(this, body) as Observable<any>).pipe(
              takeUntil(this.terminateMessage$.pipe(filter(terminatedMessageId => terminatedMessageId === id))),
            ).subscribe(result => {
              this.response({completed: false, id, body: result});
            }, noop, () => {
              this.response({completed: true, id });
            });
          }
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
    const map: ListenerStorage = new Map();

    let currentProto = this['__proto__' + ''];

    while (currentProto.constructor !== Object) {
      if (currentProto.constructor[MESSAGE_LISTENERS]) {
        for (const [key, handlers] of currentProto.constructor[MESSAGE_LISTENERS] as ListenerStorage) {
          map.set(key, [...(map.get(key) || []), ...handlers]);
        }
      }

      currentProto = currentProto.__proto__;
    }

    return map;
  }
}
