import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { mapMerge } from "@thalesrc/js-utils/map-merge";

import { Message } from "./message.interface";
import { MessageResponse } from "./message-response.type";
import { MESSAGE_LISTENERS } from "./selectors";
import { ListenerStorage } from "./listener-storage.type";

/**
 * Listeners property symbol
 */
const LISTENERS: unique symbol = Symbol('Message Host Listeners');

/**
 * Message Host
 */
export abstract class MessageHost {

	/**
	 * Run this method to start listening the requests
	 */
	protected readonly listen = (messages$: Observable<Message>): void => {
		for (const [path, listener] of this[LISTENERS]) {
			messages$
				.pipe(filter(({path: _path}) => path === _path))
				.subscribe(async ({body, id}) => {

					for await (const result of listener.call(this, body)) {
						this.response({completed: false, id, body: result});
					}

					this.response({completed: true, id });
				});
		}
	}

	/**
	 * All inherited listeners
	 */
	private get [LISTENERS](): ListenerStorage {
		let map: ListenerStorage = new Map();

		let currentProto = this['__proto__'];

		while (currentProto.constructor !== Object) {
			if (currentProto.constructor[MESSAGE_LISTENERS]) {
				map = mapMerge(map, <ListenerStorage>currentProto.constructor[MESSAGE_LISTENERS]);
			}

			currentProto = currentProto['__proto__'];
		}

		return map;
	}

	/**
	 * Build a reponse method to send responses to requests by the way of the platform
	 * @param message Incoming response message
	 */
	protected abstract response(message: MessageResponse): void;
}