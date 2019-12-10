interface IdMessaging {
  lastId: number;
  lap: number;
}

export class UniqueMessageIdHelper {
  private static PORT_ID = '__hermes_unique_message_id_port__';
  private port = chrome.runtime.connect({name: UniqueMessageIdHelper.PORT_ID});
  private lastId = Number.MIN_SAFE_INTEGER;
  private lap = 0;

  constructor() {
    this.port.onMessage.addListener(({lastId, lap}: IdMessaging) => {
      if (this.lastId < lastId) {
        this.lastId = lastId;
      }

      if (this.lap < lap) {
        this.lap = lap;
      }
    });
  }

  public getId(): string {
    if (this.lastId >= Number.MAX_SAFE_INTEGER) {
      this.lastId = Number.MIN_SAFE_INTEGER;
      this.lap = this.lap + 1;
    } else {
      this.lastId = this.lastId + 1;
    }

    this.port.postMessage({lap: this.lap, lastId: this.lastId} as IdMessaging);

    return '*'.repeat(this.lap) + this.lastId;
  }
}
