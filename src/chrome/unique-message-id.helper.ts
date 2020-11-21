import { defer } from '@thalesrc/js-utils';

interface IdMessaging {
  type: 'newId' | 'postMeLastIds';
  lastId: number;
  lap: number;
}

export class UniqueMessageIdHelper {
  private static PORT_ID = '__hermes_unique_message_id_port__';
  private port$ = defer().then(() => chrome.runtime.connect({name: UniqueMessageIdHelper.PORT_ID}));
  private lastId = Number.MIN_SAFE_INTEGER;
  private lap = 0;

  constructor() {
    this.port$.then(port => {
      port.onMessage.addListener(({type, lastId, lap}: IdMessaging) => {
        switch (type) {
          case 'newId':
            this.updateLastId(lastId, lap);
            break;
          case 'postMeLastIds':
            port.postMessage({lap: this.lap, lastId: this.lastId, type: 'newId'} as IdMessaging);
            break;
        }
      });

      port.postMessage({type: 'postMeLastIds'} as IdMessaging);
    });
  }

  public getId(): string {
    if (this.lastId >= Number.MAX_SAFE_INTEGER) {
      this.lastId = Number.MIN_SAFE_INTEGER;
      this.lap = this.lap + 1;
    } else {
      this.lastId = this.lastId + 1;
    }

    this.port$.then(port => port.postMessage({lap: this.lap, lastId: this.lastId, type: 'newId'} as IdMessaging));

    return '*'.repeat(this.lap) + this.lastId;
  }

  private updateLastId(id: number, lap: number): void {
    if (this.lastId < id) {
      this.lastId = id;
    }

    if (this.lap < lap) {
      this.lap = lap;
    }
  }
}
