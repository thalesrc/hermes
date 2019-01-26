import { Subject } from "rxjs";
import { share } from "rxjs/operators";

import { MessageResponse } from "../message-response.type";
import { SendingService } from "../sending-service.interface";
import { Message } from "../message.interface";
import { DEFAULT_CONNECTION_NAME } from "./default-connection-name";

/**
 * Chrome Sending Service
 */
export class ChromeSendingService implements SendingService {
  private _port: chrome.runtime.Port;
  private _responses$ = new Subject<MessageResponse>();

  public responses$ = this._responses$.asObservable().pipe(share());

  /**
   * Create chrome sending service
   * @param name Port name
   */
  constructor(
    name = DEFAULT_CONNECTION_NAME
  ) {
    this._port = chrome.runtime.connect({name});
    this._port.onMessage.addListener((message: MessageResponse) => {
      this._responses$.next(message);
    });
  }

  public send<T>(message: Message<T>) {
    this._port.postMessage(message);
  }
}
