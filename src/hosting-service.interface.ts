import { Observable } from "rxjs";

import { MessageResponse } from "./message-response.type";
import { Message } from "./message.interface";

export interface HostingService {
	response(message: MessageResponse): void;
  requests$: Observable<Message>;
}