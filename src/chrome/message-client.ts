import { Subject } from "rxjs";
import { share } from "rxjs/operators";

import { MessageClient } from "../message-client";
import { DEFAULT_CONNECTION_NAME } from "./default-connection-name";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { RESPONSES$, SEND, GET_NEW_ID } from "../selectors";

interface IdMessaging {
  lastId: number;
  lap: number;
}

class UniqueMessageIdHelper {
  private static PORT_ID = '__hermes_unique_message_id_port__';
  private port = chrome.runtime.connect({name: UniqueMessageIdHelper.PORT_ID});
  private lastId = Number.MIN_SAFE_INTEGER;
  private lap = 0;

  constructor() {
    this.port.onMessage.addListener(({lastId, lap}: IdMessaging) => {
      if (this.lastId < lastId) {
        this.lastId = lastId;
      }

      if (this.lap < lap) {
        this.lap = lap;
      }
    });
  }

  public getId(): string {
    let id: number;
    let lap = this.lap;

    if (this.lastId >= Number.MAX_SAFE_INTEGER) {
      id = Number.MIN_SAFE_INTEGER;
      lap = this.lap++;
    } else {
      id = this.lastId++;
    }

    this.port.postMessage({lap, lastId: id} as IdMessaging);

    return '*'.repeat(lap) + id;
  }
}

const PORT = Symbol('Port');
const RESPONSES_SUBJECT$ = Symbol('Responses Subject');

export class ChromeMessageClient extends MessageClient {
  private static readonly idHelper = new UniqueMessageIdHelper();

	private[PORT]: chrome.runtime.Port;
  private [RESPONSES_SUBJECT$] = new Subject<MessageResponse>();

	public [RESPONSES$] = this[RESPONSES_SUBJECT$].asObservable().pipe(share());

	constructor(name = DEFAULT_CONNECTION_NAME) {
		super();

    this[PORT] = chrome.runtime.connect({name});
    this[PORT].onMessage.addListener((message: MessageResponse) => {
      this[RESPONSES_SUBJECT$].next(message);
		});
	}

  public [SEND]<T>(message: Message<T>) {
    this[PORT].postMessage(message);
  }

  protected [GET_NEW_ID](): string {
    return ChromeMessageClient.idHelper.getId();
  }
}
