import { Observable } from "rxjs";

import { Message } from "./message.interface";
import { MessageResponse } from "./message-response.type";

export abstract class MessageClient {
	protected abstract responses$: Observable<MessageResponse>;

	protected abstract send(message: Message): void;
}
