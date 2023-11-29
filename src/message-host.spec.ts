// tslint:disable:max-classes-per-file no-empty ban-types
import 'jest';

import { of } from 'rxjs';
import { Context, marbles } from 'rxjs-marbles/jest';

import { MessageHost } from './message-host';
import { Message } from './message.interface';
import { MESSAGE_LISTENERS } from './selectors';

function asyncMarbles(callback: (m: Context, done: Function) => void) {
  return (done) => {
    marbles((m) => {
      callback(m, done);
    })();
  };
}

describe.only('Message Host', () => {
  it('should initialize properly', () => {
    class Foo extends MessageHost {
      public response() {}
    }

    expect(Foo).toBeTruthy();
  });

  it('should start listening after listen method called', asyncMarbles((m, done) => {
    const reqs = m.cold('abcd|', {
      a: {path: 'a', id: '1', body: 'foo'} as Message,
      b: {path: 'b', id: '2', body: 'bar'} as Message,
      c: {path: 'c', id: '3', body: 'baz'} as Message,
      d: {path: 'a', id: '4', body: 'foo'} as Message,
    });

    function aListener(message: string) {
      return of('aListener');
    }

    function bListener(message: string) {
      return of('bListener');
    }

    class Foo extends MessageHost {
      public static [MESSAGE_LISTENERS] = new Map([['a', [aListener]], ['b', [bListener]]]);

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
      expect(foo.response).toHaveBeenNthCalledWith(2, {id: '1', completed: true});
      expect(foo.response).toHaveBeenNthCalledWith(3, {id: '2', body: 'bListener', completed: false});
      expect(foo.response).toHaveBeenNthCalledWith(4, {id: '2', completed: true});
      expect(foo.response).toHaveBeenNthCalledWith(5, {id: '4', body: 'aListener', completed: false});
      expect(foo.response).toHaveBeenNthCalledWith(6, {id: '4', completed: true});
      done();
    }, 60);
  }));

  it('should work with class extensioning', asyncMarbles((m, done) => {
    const reqs = m.cold('abcd|', {
      a: {path: 'foo', id: '1', body: 'foo'} as Message,
      b: {path: 'bar', id: '2', body: 'bar'} as Message,
      c: {path: 'baz', id: '3', body: 'baz'} as Message,
      d: {path: 'foo', id: '4', body: 'foo'} as Message,
    });

    const fooListener = jest.fn(() => of('fooListener'));
    const barListener = jest.fn(() => of('barListener'));
    const bazListener = jest.fn(() => of('bazListener'));
    const superBarListener = jest.fn(() => of('superBarListener'));

    class Foo extends MessageHost {
      public static [MESSAGE_LISTENERS] = new Map([['foo', [fooListener]]]);

      public response = jest.fn();

      constructor() {
        super();

        this.listen(reqs);
      }
    }

    class Bar extends Foo {
      public static [MESSAGE_LISTENERS] = new Map([['bar', [barListener]]]);
    }

    class Baz extends Foo {
      public static [MESSAGE_LISTENERS] = new Map([['baz', [bazListener]]]);
    }

    class SuperBar extends Bar {
      public static [MESSAGE_LISTENERS] = new Map([['bar', [superBarListener]]]);
    }

    const bar = new Bar();
    const baz = new Baz();
    const superBar = new SuperBar();

    m.expect(reqs).toHaveSubscriptions(['^---!', '^---!', '^---!', '^---!', '^---!', '^---!']);

    setTimeout(() => {
      expect(bar.response).toHaveBeenCalledTimes(6);
      expect(baz.response).toHaveBeenCalledTimes(6);
      expect(superBar.response).toHaveBeenCalledTimes(8);

      expect(bar.response).toHaveBeenNthCalledWith(1, {id: '1', body: 'fooListener', completed: false});
      expect(bar.response).toHaveBeenNthCalledWith(2, {id: '1', completed: true});
      expect(bar.response).toHaveBeenNthCalledWith(3, {id: '2', body: 'barListener', completed: false});
      expect(bar.response).toHaveBeenNthCalledWith(4, {id: '2', completed: true});
      expect(bar.response).toHaveBeenNthCalledWith(5, {id: '4', body: 'fooListener', completed: false});
      expect(bar.response).toHaveBeenNthCalledWith(6, {id: '4', completed: true});

      expect(baz.response).toHaveBeenNthCalledWith(1, {id: '1', body: 'fooListener', completed: false});
      expect(baz.response).toHaveBeenNthCalledWith(2, {id: '1', completed: true});
      expect(baz.response).toHaveBeenNthCalledWith(3, {id: '3', body: 'bazListener', completed: false});
      expect(baz.response).toHaveBeenNthCalledWith(4, {id: '3', completed: true});
      expect(baz.response).toHaveBeenNthCalledWith(5, {id: '4', body: 'fooListener', completed: false});
      expect(baz.response).toHaveBeenNthCalledWith(6, {id: '4', completed: true});

      expect(superBar.response).toHaveBeenNthCalledWith(1, {id: '1', body: 'fooListener', completed: false});
      expect(superBar.response).toHaveBeenNthCalledWith(2, {id: '1', completed: true});
      expect(superBar.response).toHaveBeenNthCalledWith(3, {id: '2', body: 'superBarListener', completed: false});
      expect(superBar.response).toHaveBeenNthCalledWith(4, {id: '2', completed: true});
      expect(superBar.response).toHaveBeenNthCalledWith(5, {id: '2', body: 'barListener', completed: false});
      expect(superBar.response).toHaveBeenNthCalledWith(6, {id: '2', completed: true});
      expect(superBar.response).toHaveBeenNthCalledWith(7, {id: '4', body: 'fooListener', completed: false});
      expect(superBar.response).toHaveBeenNthCalledWith(8, {id: '4', completed: true});

      done();
    }, 60);
  }));
});
