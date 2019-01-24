import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MESSAGE_LISTENERS } from './selectors';
import { ListenerStorage } from './listener-storage.type';
import { Message } from './message.interface';

/**
 * Constructs a decorator to obtain functionality of message hosting to a class
 * @param supplier A `GatewayMessage` observable to supply created class decorator
 *
 * ### Example
 * ```
 * import { messages$ } from './somewhere';
 *
 * const MessageHost = messageHostFactory(messages$);
 *
 * @MessageHost('domain-name')
 * class MailsHost {
 *   @Listener('what-is-your-name')
 *   public *answerName() {
 *     yield 'hermes';
 *   }
 * }
 * ```
 */
export function messageHostFactory(supplier: Observable<Message>): (domain: string) => ClassDecorator {
  return function MessageHost(domain: string) {
    return function(Constructor: any) {

      if (!Constructor[MESSAGE_LISTENERS]) {
        Constructor[MESSAGE_LISTENERS] = new Map<string, Function>();
      }

      const events = supplier.pipe(filter(({domain: _domain}) => domain === _domain));

      return class extends Constructor {
        constructor() {
          super(...arguments);

          for (const [path, method] of <ListenerStorage>Constructor[MESSAGE_LISTENERS]) {
            events
              .pipe(filter(({message: {path: _path}}) => path === _path))
              .subscribe(async ({ message: {body, id}, responseMethod }) => {

                for await (const result of method(body)) {
                  responseMethod({completed: false, id, body: result});
                }

                responseMethod({completed: true, id });
              });
          }
        }
      } as any;
    };
  };
}
