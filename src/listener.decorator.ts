import { MESSAGE_LISTENERS } from './selectors';
import { ListenerStorage } from './listener-storage.type';

/**
 * Decorate a generator method to listen messages of a domain and reply them by using `yield`
 *
 * @param path Acts like an api endpoint path of an XHR for extensions messaging
 */
export function Listener(path: string): MethodDecorator {
  return function(target, key, descriptor: TypedPropertyDescriptor<any>) {
    if (!target.constructor[MESSAGE_LISTENERS]) {
      target.constructor[MESSAGE_LISTENERS] = new Map<string, ListenerStorage>();
    }

    (<ListenerStorage>target.constructor[MESSAGE_LISTENERS]).set(path, (<Function>descriptor.value).bind(target));
  };
}
