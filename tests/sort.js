function sort(){
  const arr = Array(50)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10000));

  let bubble = [...arr];
  for (let i = 0; i < bubble.length - 1; i++) {
    for (let j = 0; j < bubble.length - (i + 1); j++)
      if (bubble[j] > bubble[j + 1])
        [bubble[j], bubble[j + 1]] = [bubble[j + 1], bubble[j]];
  }

  const select = [...arr];
  for (let i = 0; i < select.length - 1; i++) {
    let index = i;
    for (let j = i + 1; j < select.length; j++) 
      if (select[j] < select[index]) index = j;
    if (index != i) [select[i], select[index]] = [select[index], select[i]];
  }

  const insert = [...arr];
  for (let i=1; i < insert.length; i++) {
    for (j=i; j > 0 && insert[j-1] > insert[i]; j--) {}
    insert.splice(j,0,insert.splice(i,1))
  }

  console.assert(select.toString() === bubble.toString());
  console.assert(insert.toString() === bubble.toString());
}
for(let i=100;i;i--)sort()
