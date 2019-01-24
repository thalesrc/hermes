import { Observable } from "rxjs";

import { Message } from "./message.interface";
import { MessageResponse } from "./message-response.type";

export interface SendingService {
	send(message: Message): void;
	responses$: Observable<MessageResponse>;
}