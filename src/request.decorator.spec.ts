import { Request } from "./request.decorator";

describe('Request Decorator', () => {
  it('should initialize properly', () => {
    class Foo {
      @Request('bar')
      public baz() {}
    }

    expect(Foo.prototype.baz).toBeTruthy();
  });
});
