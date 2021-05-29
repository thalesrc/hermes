type Constructor<T extends {}, U extends any[] = any[]> = new (...args: U) => T;

type ConstructorProps<T> = T extends {new (...args: infer U): any;} ? U : never;
type Instance<T> = T extends {new (...args: any[]): infer U;} ? U : never;

export function Mixin<T extends Constructor<any>, U extends Constructor<any>>(
  First: T,
  Second: U
): Constructor<Instance<T> & Instance<U>, [ConstructorProps<T>, ConstructorProps<U>]> {
  // @ts-ignore
  class Result extends First implements U {

    constructor(firstArgs: ConstructorProps<T>, secondArgs: ConstructorProps<U>) {
      super(...firstArgs);

      const secondInstance = new Second(...secondArgs);

      for (const key in secondArgs) {
        this[key] = secondInstance[key];
      }
    }
  }

  Result.prototype = {...First.prototype, ...Second.prototype};

  return Result;
}
