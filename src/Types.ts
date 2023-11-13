// identity :: x -> x
const identity = (x: any) => x;
// compose :: ((y -> z), (x -> y),  ..., (a -> b)) -> a -> z
const compose =
  (...fns: any) =>
  (...args: any) =>
    fns.reduceRight((res: any, fn: any) => [fn.call(null, ...res)], args)[0];

export type Ctx = {
  todos: string[];
  page?: string;
  idx?: number;
};

class Id {
  constructor(public x: any) {
    this.x = x;
  }

  static of(x: any) {
    return new Id(x);
  }

  map<T, TMap>(fn: (x: T) => TMap): Id {
    return new Id(fn(this.x));
  }

  chain(f: any) {
    return f(this.x);
  }

  extract() {
    return this.x;
  }

  foldMap() {}

  //concat: (o) => Id(x.concat(o.extract()))
}

type ForkFunction = (
  reject: (error: any) => void,
  resolve: <T>(result: T) => void
) => void;

class Task {
  fork: ForkFunction;

  constructor(fork: ForkFunction) {
    this.fork = fork;
  }

  static rejected(x: any) {
    return new Task((reject, _) => reject(x));
  }

  static of(x: any) {
    return new Task((_, resolve) => resolve(x));
  }

  map<T, TMap>(fn: (val: T) => TMap): Task {
    return new Task((reject, resolve) =>
      this.fork(reject, compose(resolve, fn))
    );
  }

  chain(fn: (val: any) => Task): Task {
    return new Task((reject, resolve) =>
      this.fork(reject, (result: any) => fn(result).fork(reject, resolve))
    );
  }

  ap<TMap>(f: Task): Task {
    return this.chain((fn: (val: any) => TMap) => f.map(fn));
  }

  join() {
    return this.chain(identity);
  }

  foldMap() {}
}

const kleisli_comp = (f: any, g: any) => (x: any) => f(x).chain(g);

class Free<T> {
  //constructor(public value: T) {}

  map<U>(f: (val: T) => U): Free<U> {
    if (this instanceof Impure) {
      return Free.Impure(this.x, (y: any) =>
        (this as this & Impure<any, any>).f(y).map(f)
      );
    } else if (this instanceof Pure) {
      return Free.Pure(f(this.x));
    }

    throw new Error('Unknown value type');
  }

  chain(f:any) {
    if (this instanceof Impure) {
      return Free.Impure(this.x, kleisli_comp(this.f, f));
    } else if (this instanceof Pure) {
      return f(this.x);
    }

    throw new Error('Unknown value type');
  }

  foldMap<U, V>(interpreter: (val: U) => Free<V>, of: (val: V) => Free<V>) {
    if (this instanceof Impure) {
      return (interpreter(this.x) as any).chain((result: any) => {
        return (this as this & Impure<U, Pure<any>>)
          .f(result)
          .foldMap(interpreter, of);
      });
    } else if (this instanceof Pure) {
      return of(this.x);
    }
  }

  static Impure<U, V>(x: U, f: (val: U) => Free<V>): Free<V> {
    return new Impure(x, f);
  }

  static Pure<U>(x: U): Free<U> {
    return new Pure(x);
  }
}

class Impure<U, V> extends Free<V> {
  constructor(public x: U, public f: (val: U) => Free<V>) {
    super();
    this.x = x;
    this.f = f;
  }
}

class Pure<U> extends Free<U> {
  constructor(public x: U) {
    super();
    this.x = x;
  }
}

const liftF = (command: any) => {
  return Free.Impure(command, Free.Pure);
};

class HandleEvent {
  constructor() {}

  static of() {
    return new HandleEvent();
  }
}

class RenderApp {
  constructor(public ctx: Ctx) {}

  static of(ctx: Ctx) {
    return new RenderApp(ctx);
  }
}

class GetTodos {
  constructor() {}

  static of() {
    return new GetTodos();
  }
}

class SaveTodos {
  constructor(public ctx: Ctx) {}

  static of(ctx: Ctx) {
    return new SaveTodos(ctx);
  }
}

class RemoveTodo {
  constructor(public ctx: Ctx) {}

  static of(ctx: Ctx) {
    return new RemoveTodo(ctx);
  }
}

export {
  Id,
  Task,
  Free,
  Pure,
  Impure,
  liftF,
  HandleEvent,
  RenderApp,
  GetTodos,
  SaveTodos,
  RemoveTodo,
};

