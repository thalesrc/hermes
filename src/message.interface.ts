import { MessageContent } from './message-content.interface';
import { MessageResponse } from './message-response.type';

/**
 * Message interface
 */
export interface Message<T = any> {
  /**
   * Selector of a messaging port
   */
  domain: string;

  /**
   * Message Content
   */
  message: MessageContent<T>;

  /**
   * Response method
   */
  responseMethod<U = any>(message: MessageResponse<U>): void;
}
