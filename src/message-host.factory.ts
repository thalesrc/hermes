import { filter } from 'rxjs/operators';

import { MESSAGE_LISTENERS } from './selectors';
import { ListenerStorage } from './listener-storage.type';
import { HostingService } from './hosting-service.interface';

/**
 * Constructs a decorator to obtain functionality of message hosting to a class
 * @param service A `HostingService` instance to manage messaging
 *
 * ### Example
 * ```
 * import { hostingService } from './somewhere';
 *
 * const MessageHost = messageHostFactory(hostingService);
 *
 * @MessageHost()
 * class PersonHost {
 *   @Listener('what-is-your-name')
 *   public *answerName() {
 *     yield 'hermes';
 *   }
 * }
 * ```
 */
export function messageHostFactory(service: HostingService): () => ClassDecorator {
  return function() {
    return function(Constructor) {
      if (!Constructor[MESSAGE_LISTENERS]) {
        Constructor[MESSAGE_LISTENERS] = new Map<string, Function>();
      }

      return class extends Constructor {
        constructor() {
          super(...arguments);

          for (const [path, method] of <ListenerStorage>Constructor[MESSAGE_LISTENERS]) {
            service.requests$
              .pipe(filter(({path: _path}) => path === _path))
              .subscribe(async ({body, id}) => {

                for await (const result of method(body)) {
                  service.response({completed: false, id, body: result});
                }

                service.response({completed: true, id });
              });
          }
        }
      }
    } as any;
  }
}
