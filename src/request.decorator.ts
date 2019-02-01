import { uniqueId } from "@thalesrc/js-utils";
import { filter, takeWhile, pluck } from "rxjs/operators";

import { MessageClient } from "./message-client";

export function Request(path: string): MethodDecorator {
	return function(target: object, key: string, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> {
		descriptor.value = function(this: MessageClient, message: any) {
			const messageId = <string>uniqueId('hermes-message');

			this.send({body: message, id: messageId, path});

			return this.responses$.pipe(
				filter(({id}) => id === messageId),
				takeWhile(({completed}) => !completed),
				pluck('body')
			);
		};

		return descriptor;
	}
}
