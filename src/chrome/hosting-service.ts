import { Subject } from "rxjs";
import { share } from "rxjs/operators";

import { HostingService } from "../hosting-service.interface";
import { DEFAULT_CONNECTION_NAME } from "./default-connection-name";
import { Message } from "../message.interface";
import { MessageResponse } from "../message-response.type";

export class ChromeHostingService implements HostingService {
	private _ports: {[key: string]: chrome.runtime.Port} = {};
	private _requests$ = new Subject<Message>();

	public requests$ = this._requests$.asObservable().pipe(share());

	constructor(
		name = DEFAULT_CONNECTION_NAME
	) {
		chrome.runtime.onConnect.addListener(port => {
			if (port.name !== name) {
				return;
			}

			port.onMessage.addListener((message: Message, port: chrome.runtime.Port) => {
				this._ports[port.sender.tlsChannelId] = port;
				message.id = `${message.id}&portIdentifier=${port.sender.tab.id}`;

				this._requests$.next(message);
			});
		});
	}

	public response<T>(message: MessageResponse<T>): void {
		const [messageId, portId] = message.id.split('&portIdentifier=');

		message.id = messageId;
		this._ports[portId].postMessage(message);
	}
}
