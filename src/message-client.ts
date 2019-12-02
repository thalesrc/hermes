import { Observable } from "rxjs";

import { Message } from "./message.interface";
import { MessageResponse } from "./message-response.type";

export abstract class MessageClient {
	protected abstract responses$: Observable<MessageResponse>;

	// TODO: use Omit<Message, 'id'> type to start refactoring of making message client responsible for defining message id
	protected abstract send(message: Message): void;

	// TODO: make extended classes responsible to create message id
	// protected abstract getNewMessageId(): string {}
}
