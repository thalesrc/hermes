import { Subject } from "rxjs";
import { share } from "rxjs/operators";

import { MessageClient } from "../message-client";
import { DEFAULT_CONNECTION_NAME } from "./default-connection-name";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";

export class ChromeMessageClient extends MessageClient {
	private _port: chrome.runtime.Port;
  private _responses$ = new Subject<MessageResponse>();

	public responses$ = this._responses$.asObservable().pipe(share());

	constructor(name = DEFAULT_CONNECTION_NAME) {
		super();

    this._port = chrome.runtime.connect({name});
    this._port.onMessage.addListener((message: MessageResponse) => {
      this._responses$.next(message);
		});
	}

  public send<T>(message: Message<T>) {
    this._port.postMessage(message);
  }
}
