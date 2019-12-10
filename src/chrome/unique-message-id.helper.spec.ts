// tslint:disable:no-string-literal
import 'jest';

import { UniqueMessageIdHelper } from './unique-message-id.helper';

describe('Chrome / Unique Message Id Helper', () => {
  let port: {
    onMessage: {
      addListener: jest.Mock,
    },
    postMessage: jest.Mock,
  };

  beforeEach(() => {
    port = {
      onMessage: {
        addListener: jest.fn(),
      },
      postMessage: jest.fn(),
    };

    global['chrome'] = {
      runtime: {
        connect: jest.fn().mockReturnValue(port),
      },
    };
  });

  it('should initialize properly', () => {
    const helper = new UniqueMessageIdHelper();

    expect(helper).toBeTruthy();
  });

  it('should connect to the runtime port', () => {
    const helper = new UniqueMessageIdHelper();

    expect(global['chrome'].runtime.connect).toBeCalledTimes(1);
    expect(global['chrome'].runtime.connect).toBeCalledWith({name: UniqueMessageIdHelper['PORT_ID']});
  });

  it('should increase lastId and lap whenever an event fired with bigger numbers', () => {
    let listener: (e: {lastId: number, lap: number}) => void;
    port.onMessage.addListener = jest.fn(l => listener = l);

    const helper = new UniqueMessageIdHelper();

    expect(helper['lastId']).toBe(Number.MIN_SAFE_INTEGER);
    expect(helper['lap']).toBe(0);

    listener({lap: 0, lastId: 0});

    expect(helper['lastId']).toBe(0);
    expect(helper['lap']).toBe(0);

    listener({lap: 0, lastId: -100});

    expect(helper['lastId']).toBe(0);
    expect(helper['lap']).toBe(0);

    listener({lap: 1, lastId: 100});

    expect(helper['lastId']).toBe(100);
    expect(helper['lap']).toBe(1);

    listener({lap: 0, lastId: 200});

    expect(helper['lastId']).toBe(200);
    expect(helper['lap']).toBe(1);
  });

  it('should get new id and should emit it to the channel', () => {
    const listeners: Array<(e: {lastId: number, lap: number}) => void> = [];
    port.onMessage.addListener = jest.fn(l => listeners.push(l));
    port.postMessage = jest.fn(e => listeners.forEach(l => l(e)));

    const foo = new UniqueMessageIdHelper();
    const bar = new UniqueMessageIdHelper();

    let id = foo.getId();
    let expectedId = Number.MIN_SAFE_INTEGER + 1 + '';

    expect(id).toBe(expectedId);
    expect(foo['lastId']).toBe(Number.MIN_SAFE_INTEGER + 1);
    expect(bar['lastId']).toBe(Number.MIN_SAFE_INTEGER + 1);

    id = bar.getId();
    expectedId = Number.MIN_SAFE_INTEGER + 2 + '';

    expect(id).toBe(expectedId);
    expect(foo['lastId']).toBe(Number.MIN_SAFE_INTEGER + 2);
    expect(bar['lastId']).toBe(Number.MIN_SAFE_INTEGER + 2);
  });

  it('should increase lap whenever lastId reach max safe integer', () => {
    const listeners: Array<(e: {lastId: number, lap: number}) => void> = [];
    port.onMessage.addListener = jest.fn(l => listeners.push(l));
    port.postMessage = jest.fn(e => listeners.forEach(l => l(e)));

    const foo = new UniqueMessageIdHelper();
    const bar = new UniqueMessageIdHelper();

    foo['lastId'] = Number.MAX_SAFE_INTEGER;

    const id = foo.getId();

    expect(id).toBe('*' + Number.MIN_SAFE_INTEGER);
    expect(foo['lastId']).toBe(Number.MIN_SAFE_INTEGER);
    expect(bar['lastId']).toBe(Number.MIN_SAFE_INTEGER);
    expect(foo['lap']).toBe(1);
    expect(bar['lap']).toBe(1);
  });
});
