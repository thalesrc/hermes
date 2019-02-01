import { Subject } from "rxjs";

import { MessageHost } from "../message-host";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { DEFAULT_CONNECTION_NAME } from "./default-connection-name";

export class ChromeMessageHost extends MessageHost {
	private static readonly PORT_IDENTIFIER = 'portIdentifier';

	private _ports: {[key: string]: chrome.runtime.Port} = {};
	private _requests$ = new Subject<Message>();

	constructor(name = DEFAULT_CONNECTION_NAME) {
		super();

		chrome.runtime.onConnect.addListener(port => {
			if (port.name !== name) {
				return;
			}

			port.onMessage.addListener((message: Message, port: chrome.runtime.Port) => {
				this._ports[port.sender.tab.id] = port;
				message.id = `${message.id}&${ChromeMessageHost.PORT_IDENTIFIER}=${port.sender.tab.id}`;

				this._requests$.next(message);
			});
		});

		this.listen(this._requests$);
	}

	protected response(message: MessageResponse): void {
		const [messageId, portId] = message.id.split(`&${ChromeMessageHost.PORT_IDENTIFIER}=`);

		message.id = messageId;
		this._ports[portId].postMessage(message);
	}
}