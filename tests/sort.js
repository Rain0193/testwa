const arr = Array(50)
  .fill(0)
  .map(() => Math.floor(Math.random() * 10000));
console.log(arr.toString());

let bubble = [...arr];
for (let i = 0; i < bubble.length - 1; i++) {
  for (let j = 0; j < bubble.length - (i + 1); j++) {
    if (bubble[j] > bubble[j + 1])
      [bubble[j], bubble[j + 1]] = [bubble[j + 1], bubble[j]];
  }
}
console.log("==========================");
console.log(bubble.toString());

const select = [...arr];
for (let i = 0; i < select.length - 1; i++) {
  let index = i;
  for (let j = i + 1; j < select.length; j++) {
    if (select[j] < select[index]) index = j;
  }
  if (index != i) [select[i], select[index]] = [select[index], select[i]];
}
console.log("==========================");
console.log(select.toString());
console.log(select.toString() === bubble.toString());
