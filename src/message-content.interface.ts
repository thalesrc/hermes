export interface MessageContent<T = any> {
  path: string;
  body: T;
  id: string;
}
