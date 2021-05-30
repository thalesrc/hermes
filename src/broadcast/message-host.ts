import { Subject } from "rxjs";
import { MessageHost } from "../message-host";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";

interface MessageEvent<T> {
  data: T;
}

const REQUESTS$ = Symbol('Requests');
const HANDLER = Symbol('Handler');
const CHANNEL = Symbol('Broadcast Channel');

export class BroadcastMessageHost extends MessageHost {
  private [REQUESTS$] = new Subject<Message>();
  private [CHANNEL] = new BroadcastChannel(this.channelName);

  constructor(private channelName = DEFAULT_CHANNEL_NAME) {
    super();

    this[CHANNEL].addEventListener('message', this[HANDLER]);

    this.listen(this[REQUESTS$]);
  }

  protected response(message: MessageResponse) {
    this[CHANNEL].postMessage(message);
  }

  public terminate() {
    this[CHANNEL].removeEventListener('message', this[HANDLER]);
    this[CHANNEL].close();
  }

  private [HANDLER] = (event: MessageEvent<Message>) => {
    this[REQUESTS$].next(event.data);
  }
}