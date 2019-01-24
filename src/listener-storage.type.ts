export type ListenerStorage<T = any> = Map<string, (message: any) => AsyncIterable<T>>;
