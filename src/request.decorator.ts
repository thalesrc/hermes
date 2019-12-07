import { filter, takeWhile, pluck } from "rxjs/operators";

import { MessageClient } from "./message-client";
import { RESPONSES$, GET_NEW_ID, SEND } from "./selectors";

export function Request(path: string): MethodDecorator {
  return function(target: object, key: string, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> {
    descriptor.value = function(this: MessageClient, message: any) {
      const messageId = this[GET_NEW_ID]();

      this[SEND]({body: message, id: messageId, path});

      return this[RESPONSES$].pipe(
        filter(({id}) => id === messageId),
        takeWhile(({completed}) => !completed),
        pluck('body')
      );
    };

    return descriptor;
  }
}
