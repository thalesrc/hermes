import { MESSAGE_LISTENERS } from './selectors';
import { ListenerStorage } from './listener-storage.type';

/**
 * Decorate a generator method to listen messages of a domain and reply them by using `yield`
 *
 * @param path Acts like an api endpoint path of an XHR for extensions messaging
 */
export function Listen(path?: string): MethodDecorator {
  return function(target, key: string, descriptor: TypedPropertyDescriptor<any>) {
    if (!target.constructor[MESSAGE_LISTENERS]) {
      target.constructor[MESSAGE_LISTENERS] = new Map();
    }

    (<ListenerStorage>target.constructor[MESSAGE_LISTENERS]).set(path || key, <any>descriptor.value);
  };
}
