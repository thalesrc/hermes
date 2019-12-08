import { Message } from './message.interface';

type Omit<ObjectType, KeysType extends keyof ObjectType> = Pick<ObjectType, Exclude<keyof ObjectType, KeysType>>;

type UncompletedMessageResponse<T = any> = Omit<Message<T>, 'path'> & { completed: false; };
type CompletedMessageResponse = Omit<Message, 'body' | 'path'> & { completed: true; };

export type MessageResponse<T = any> = UncompletedMessageResponse<T> | CompletedMessageResponse;
