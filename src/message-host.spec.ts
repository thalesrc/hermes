// tslint:disable:max-classes-per-file no-empty ban-types
import { Context, marbles } from 'rxjs-marbles/jest';

import { GET_LISTENERS, MessageHost } from './message-host';
import { Message } from './message.interface';
import { MESSAGE_LISTENERS } from './selectors';

function asyncMarbles(callback: (m: Context, done: Function) => void) {
  return (done) => {
    marbles((m) => {
      callback(m, done);
    })();
  };
}

describe('Message Host', () => {
  it('should initialize properly', () => {
    class Foo extends MessageHost {
      public response() {}
    }

    expect(Foo).toBeTruthy();
  });

  it('should collect all listeners', () => {
    class Foo extends MessageHost {
      public static [MESSAGE_LISTENERS] = new Map([['a', 'a']]);

      public response() {}
    }

    class Bar extends Foo {
      public static [MESSAGE_LISTENERS] = new Map([['b', 'b']]);
    }

    const bar = new Bar();
    const listeners = [...bar[GET_LISTENERS]().entries()];

    expect(listeners).toEqual([['b', 'b'], ['a', 'a']]);
  });

  it('should start listening after listen method called', asyncMarbles((m, done) => {
    const reqs = m.cold('abcd|', {
      a: {path: 'a', id: '1', body: 'foo'} as Message,
      b: {path: 'b', id: '2', body: 'bar'} as Message,
      c: {path: 'c', id: '3', body: 'baz'} as Message,
      d: {path: 'a', id: '4', body: 'foo'} as Message,
    });

    function *aListener(message: string) {
      yield 'aListener';
    }

    function *bListener(message: string) {
      yield 'bListener';
    }

    class Foo extends MessageHost {
      public static [MESSAGE_LISTENERS] = new Map([['a', aListener], ['b', bListener]]);

      public response = jest.fn();

      constructor() {
        super();

        this.listen(reqs);
      }
    }

    const foo = new Foo();

    m.expect(reqs).toHaveSubscriptions(['^---!', '^---!']);

    setTimeout(() => {
      expect(foo.response).toHaveBeenCalledTimes(6);
      expect(foo.response).toHaveBeenNthCalledWith(1, {id: '1', body: 'aListener', completed: false});
      expect(foo.response).toHaveBeenNthCalledWith(2, {id: '2', body: 'bListener', completed: false});
      expect(foo.response).toHaveBeenNthCalledWith(3, {id: '4', body: 'aListener', completed: false});
      expect(foo.response).toHaveBeenNthCalledWith(4, {id: '1', completed: true});
      expect(foo.response).toHaveBeenNthCalledWith(5, {id: '2', completed: true});
      expect(foo.response).toHaveBeenNthCalledWith(6, {id: '4', completed: true});
      done();
    }, 60);
  }));
});
