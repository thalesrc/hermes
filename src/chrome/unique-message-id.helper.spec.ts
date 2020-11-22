// tslint:disable:no-string-literal
import 'jest';

import { UniqueMessageIdHelper } from './unique-message-id.helper';

describe('Chrome / Unique Message Id Helper', () => {
  let onMessageCallback: (message: any) => any;

  beforeEach(() => {
    global['chrome' + ''] = {
      runtime: {
        onMessage: {
          addListener: jest.fn().mockImplementation(func => onMessageCallback = func),
        },
        sendMessage: jest.fn(),
      },
    };
  });

  it('should initialize properly', () => {
    const helper = new UniqueMessageIdHelper();

    expect(helper).toBeTruthy();
  });

  it('should connect to the runtime port', () => {
    const helper = new UniqueMessageIdHelper();

    expect(global['chrome'].runtime.onMessage.addListener).toBeCalledTimes(1);
    expect(global['chrome'].runtime.sendMessage).toBeCalledTimes(1);
    expect(global['chrome'].runtime.sendMessage)
      .toBeCalledWith({type: 'postMeLastIds', to: '__hermes_unique_message_id_port__'});
  });

  it('shouldn\'t listen other types of messages', () => {
    const helper = new UniqueMessageIdHelper();

    helper['updateLastId' + ''] = jest.fn();

    onMessageCallback(null);
    onMessageCallback('foo');
    onMessageCallback(1);
    onMessageCallback({to: 'some-other-message'});

    expect(global['chrome'].runtime.sendMessage).toBeCalledTimes(1);
    expect(helper['updateLastId' + '']).toBeCalledTimes(0);
  });

  it('should increase lastId and lap whenever an event fired with bigger numbers', () => {
    const helper = new UniqueMessageIdHelper();

    expect(helper['lastId']).toBe(Number.MIN_SAFE_INTEGER);
    expect(helper['lap']).toBe(0);

    onMessageCallback({type: 'newId', lap: 0, lastId: 0, to: '__hermes_unique_message_id_port__'});

    expect(helper['lastId']).toBe(0);
    expect(helper['lap']).toBe(0);

    onMessageCallback({type: 'newId', lap: 0, lastId: -100, to: '__hermes_unique_message_id_port__'});

    expect(helper['lastId']).toBe(0);
    expect(helper['lap']).toBe(0);

    onMessageCallback({type: 'newId', lap: 1, lastId: 100, to: '__hermes_unique_message_id_port__'});

    expect(helper['lastId']).toBe(100);
    expect(helper['lap']).toBe(1);

    onMessageCallback({type: 'newId', lap: 0, lastId: 200, to: '__hermes_unique_message_id_port__'});

    expect(helper['lastId']).toBe(200);
    expect(helper['lap']).toBe(1);
  });

  it('should get new id and should emit it to the channel', () => {
    const foo = new UniqueMessageIdHelper();
    expect(global['chrome'].runtime.sendMessage).toBeCalledWith({type: 'postMeLastIds', to: '__hermes_unique_message_id_port__'});

    let id = foo.getId();
    let expectedId = Number.MIN_SAFE_INTEGER + 1 + '';

    expect(id).toBe(expectedId);
    expect(foo['lastId']).toBe(Number.MIN_SAFE_INTEGER + 1);
    expect(global['chrome'].runtime.sendMessage).toBeCalledWith({lap: 0, lastId: Number.MIN_SAFE_INTEGER + 1, type: 'newId', to: '__hermes_unique_message_id_port__'});

    const fooListener = onMessageCallback;
    const bar = new UniqueMessageIdHelper();
    const barListener = onMessageCallback;
    expect(global['chrome'].runtime.sendMessage).toBeCalledWith({type: 'postMeLastIds', to: '__hermes_unique_message_id_port__'});

    barListener({type: 'newId', lastId: Number.MIN_SAFE_INTEGER + 1, lap: 0, to: '__hermes_unique_message_id_port__'});
    expect(bar['lastId']).toBe(Number.MIN_SAFE_INTEGER + 1);

    id = bar.getId();
    expectedId = Number.MIN_SAFE_INTEGER + 2 + '';
    expect(id).toBe(expectedId);
    expect(global['chrome'].runtime.sendMessage).toBeCalledWith({lap: 0, lastId: Number.MIN_SAFE_INTEGER + 2, type: 'newId', to: '__hermes_unique_message_id_port__'});
  });

  it('should increase lap whenever lastId reach max safe integer', () => {
    const foo = new UniqueMessageIdHelper();

    foo['lastId'] = Number.MAX_SAFE_INTEGER;

    const id = foo.getId();

    expect(id).toBe('*' + Number.MIN_SAFE_INTEGER);
    expect(foo['lastId']).toBe(Number.MIN_SAFE_INTEGER);
    expect(foo['lap']).toBe(1);
  });
});
