interface IdMessaging {
  type: 'newId' | 'postMeLastIds';
  lastId: number;
  lap: number;
  to: string;
}

export class UniqueMessageIdHelper {
  private static PORT_ID = '__hermes_unique_message_id_port__';
  private lastId = Number.MIN_SAFE_INTEGER;
  private lap = 0;

  constructor() {
    chrome.runtime.onMessage.addListener((message: IdMessaging) => {
      if (!message || !(message instanceof Object) || message.to !== UniqueMessageIdHelper.PORT_ID) {
        return;
      }

      const {type, lastId, lap} = message;

      switch (type) {
        case 'newId':
          this.updateLastId(lastId, lap);
          break;
        case 'postMeLastIds':
          chrome.runtime.sendMessage(
            {lap: this.lap, lastId: this.lastId, type: 'newId', to: UniqueMessageIdHelper.PORT_ID} as IdMessaging,
          );
          break;
      }
    });

    chrome.runtime.sendMessage({type: 'postMeLastIds', to: UniqueMessageIdHelper.PORT_ID} as IdMessaging);
  }

  public getId(): string {
    if (this.lastId >= Number.MAX_SAFE_INTEGER) {
      this.lastId = Number.MIN_SAFE_INTEGER;
      this.lap = this.lap + 1;
    } else {
      this.lastId = this.lastId + 1;
    }

    chrome.runtime.sendMessage(
      {lap: this.lap, lastId: this.lastId, type: 'newId', to: UniqueMessageIdHelper.PORT_ID} as IdMessaging,
    );

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
