import { Omit } from "utility-types";

import { MessageContent } from './message-content.interface';

type UncompletedMessageResponse<T = any> = Omit<MessageContent<T>, 'path'> & { completed: false; };
type CompletedMessageResponse = Omit<MessageContent, 'body' | 'path'> & { completed: true; };

export type MessageResponse<T = any> = UncompletedMessageResponse<T> | CompletedMessageResponse;
