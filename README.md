# hermes
![publish build](https://github.com/thalesrc/hermes/workflows/Node.js%20Package/badge.svg)
[![npm](https://img.shields.io/npm/v/@thalesrc/hermes.svg)](https://www.npmjs.com/package/@thalesrc/hermes)
[![npm](https://img.shields.io/npm/dw/@thalesrc/hermes.svg)](https://www.npmjs.com/package/@thalesrc/hermes)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://www.typescriptlang.org/)

Javascript messaging library

## Installation
`npm i @thalesrc/hermes` or `yarn add @thalesrc/hermes`

## Usage

The main concept is sending messages via `MessageClient`'s and answering them via `MessageHost`'s.

------------------------------------------------------------------

### Chrome Extensions

Send and recieve messages accross tabs, background-scripts, content-scripts etc.

```typescript
// content-script or a page etc.
import { ChromeMessageClient, Request } from '@thalesrc/hermes/chrome';

class MessageSenderService extends ChromeMessageClient {
  @Request('hello')
  public sayHello(name: string): Observable<string> {
    return null;
  }
}

const service = new MessageSenderService();

service.sayHello('John').subscribe(messages => {
  console.log(todos);
});

// 'Hi John'
// 'Let me send you some data'
// {a: 1, b: false, c: 'some string'}

```

```typescript
// background-script etc.
import { ChromeMessageHost, Listen } from '@thalesrc/hermes/chrome';

class MessageListenerService extends ChromeMessageHost {
  @Listen('hello')
  public async *listenHello(name: string) {
    yield 'Hi ' + name;
    yield 'Let me send you some data';

    yield await someAsyncFunc();
  }
}

const listener = new MessageListener();

```

