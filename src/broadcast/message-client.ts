import { Subject } from "rxjs";
import { MessageClient } from "../message-client";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { GET_NEW_ID, RESPONSES$, SEND } from "../selectors";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";

interface MessageEvent<T> {
  data: T;
}

const CHANNEL = Symbol('Broadcast Channel');
const HANDLER = Symbol('Handler');

export class BroadcastMessageClient extends MessageClient {
  public [RESPONSES$] = new Subject<MessageResponse>();

  private [CHANNEL] = new BroadcastChannel(this.channelName);

  constructor(private channelName = DEFAULT_CHANNEL_NAME) {
    super();

    this[CHANNEL].addEventListener('message', this[HANDLER]);
  }

  public [SEND]<T>(message: Message<T>) {
    this[CHANNEL].postMessage(message);
  }

  protected [HANDLER] = (event: MessageEvent<MessageResponse>) => {
    this[RESPONSES$].next(event.data);
  }

  protected [GET_NEW_ID](): string {
    const key = 'Hermes/Broadcast/' + this.channelName;
    const lastId = +(localStorage.getItem(key) || '0');
    const newId = (lastId + 1) + '';

    localStorage.setItem(key, newId);

    return newId;
  }
}