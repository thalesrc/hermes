import { uniqueId } from "@thalesrc/js-utils";
import { filter, takeWhile, pluck } from "rxjs/operators";

import { SendingService } from "./sending-service.interface";
import { SENDING_SERVICE } from "./selectors";

export function Requester(path: string): MethodDecorator {
	return function(target: object, key: string, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> {
		descriptor.value = function(message: any) {
			const service: SendingService = target.constructor[SENDING_SERVICE];
			const messageId = <string>uniqueId('hermes-message');

			service.send({body: message, id: messageId, path});

			return service.responses$.pipe(
				filter(({id}) => id === messageId),
				takeWhile(({completed}) => !completed),
				pluck('body')
			);
		};

		return descriptor;
	}
}
