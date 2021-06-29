import { IFrame } from "./iframe.type";

export const TARGET_FRAME = Symbol('Target Frame');
const _TARGET_FRAME = Symbol('_ Target Frame');

export class WithTarget {
  private [_TARGET_FRAME]: IFrame;

  protected get [TARGET_FRAME](): null | HTMLIFrameElement {
    return typeof this[_TARGET_FRAME] === 'function'
      ? (this[_TARGET_FRAME] as () => HTMLIFrameElement)() || null
      : this[_TARGET_FRAME] as HTMLIFrameElement || null;
  }

  constructor(targetFrame?: IFrame) {
    this[_TARGET_FRAME] = targetFrame;
  }
}
