import { Observable } from "rxjs";

import { Message } from "./message.interface";
import { MessageResponse } from "./message-response.type";
import { RESPONSES$, SEND, GET_NEW_ID } from "./selectors";

/**
 * Message Client
 */
export abstract class MessageClient {
	/**
	 * Emits all messages got from hosts
	 */
	protected abstract readonly [RESPONSES$]: Observable<MessageResponse>;

	/**
	 * Request decorators use this method to send messages
	 *
	 * @param message Message payload to send
	 */
	protected abstract [SEND](message: Message): void;

	/**
	 * Request decorators use this method to get unique message id all accross the platform
	 */
	protected abstract [GET_NEW_ID](): string;
}
