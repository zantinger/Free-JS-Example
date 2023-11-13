export const compose2 =
  <T1, T2, T3>(f: (x: T2) => T3, g: (x: T1) => T2) =>
  (x: T1) =>
    f(g(x));

export const compose3 =
  <T1, T2, T3, T4>(f: (x: T3) => T4, g: (x: T2) => T3, h: (x: T1) => T2) =>
  (x: T1) =>
    f(g(h(x)));

export const composeMany =
  <T>(...functions: Array<(arg: T) => T>) =>
  (arg: any) =>
    functions.reduceRight((prev, curr) => {
      return curr(prev);
    }, arg);

export const map =
  <A, B, F extends { map: (fn: (val: A) => B) => F }>(fn: (val: A) => B) =>
  (f: F) =>
    f.map(fn);

export const chain = (fn: any) => (m: any) => m.chain(fn);

export const forkJoin =
  <T1, T2, R1, R2, R3>(
    join: (x: R1, y: R2) => R3,
    func1: (x: T1) => R1,
    func2: (x: T2) => R2
  ) =>
  (val: any) =>
    join(func1(val), func2(val));

