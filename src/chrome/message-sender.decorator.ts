import { messageSenderFactory } from "../message-sender.factory";
import { ChromeSendingService } from "./sending-service";

/**
 * Default Sending Service
 */
const defaultSendingService = new ChromeSendingService();

/**
 * Chrome message sender decorator
 * 
 * Example:
 * ```
import { Requester } from '@thalesrc/hermes';
import { MessageSender } from '@thalesrc/hermes/chrome';

@MessageSender()
export class BgScriptConnection {
	@Requester('say-hi')
	public sayHi(message: string): Observable<string> {
		return null;
	}
}

const connection = new BgScriptConnection();

connection.sayHi('hello background script').subscribe(response => {
	console.log(response);
});
```
 */
export const MessageSender = messageSenderFactory(defaultSendingService);
