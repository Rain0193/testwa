export function f(x: i32): i32 {
  if (x === 1 || x === 2) {
    return 2;
  }
  return f(x - 1) + f(x - 2);
}
