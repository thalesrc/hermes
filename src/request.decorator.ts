import { filter, map, takeWhile } from 'rxjs/operators';

import { MessageClient } from './message-client';
import { GET_NEW_ID, RESPONSES$, SEND } from './selectors';
import { ErrorMessageResponse, SuccessfulMessageResponse, UncompletedMessageResponse } from './message-response.type';

export function Request(path: string): MethodDecorator {
  return function(target: object, key: string, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> {
    descriptor.value = function(this: MessageClient, message: any) {
      const messageId = this[GET_NEW_ID]();

      this[SEND]({body: message, id: messageId, path});

      return this[RESPONSES$].pipe(
        map((data) => {
          const {error} = data as ErrorMessageResponse;

          if (error) throw error;

          return data as SuccessfulMessageResponse;
        }),
        filter(({id}) => id === messageId),
        takeWhile(({completed}) => !completed),
        map(({body}: UncompletedMessageResponse) => body),
      );
    };

    return descriptor;
  };
}
