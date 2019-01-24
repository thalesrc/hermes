import { Omit } from "utility-types";

import { Message } from './message.interface';

type UncompletedMessageResponse<T = any> = Omit<Message<T>, 'path'> & { completed: false; };
type CompletedMessageResponse = Omit<Message, 'body' | 'path'> & { completed: true; };

export type MessageResponse<T = any> = UncompletedMessageResponse<T> | CompletedMessageResponse;
