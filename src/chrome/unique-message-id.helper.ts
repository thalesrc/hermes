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
    let id: number;
    let lap = this.lap;

    if (this.lastId >= Number.MAX_SAFE_INTEGER) {
      id = Number.MIN_SAFE_INTEGER;
      lap = this.lap++;
    } else {
      id = this.lastId++;
    }

    this.port.postMessage({lap, lastId: id} as IdMessaging);

    return '*'.repeat(lap) + id;
  }
}
