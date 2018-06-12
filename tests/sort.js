function bubbleSort(bubble) {
  console.time("bubble");
  let start = 0;
  let end = bubble.length - 1;
  while (start < end) {
    let endPos = 0;
    let startPos = 0;
    for (let i = start; i < end; i++) {
      if (bubble[i] > bubble[i + 1]) {
        endPos = i;
        [bubble[i], bubble[i + 1]] = [bubble[i + 1], bubble[i]];
      }
    }
    end = endPos;
    for (let i = end; i > start; i--) {
      if (bubble[i - 1] > bubble[i]) {
        startPos = i;
        [bubble[i - 1], bubble[i]] = [bubble[i], bubble[i - 1]];
      }
    }
    start = startPos;
  }
  console.timeEnd("bubble");
  return bubble;
}
function selectionSort(select) {
  console.time("select");
  for (let i = 0; i < select.length - 1; i++) {
    let index = i;
    for (let j = i + 1; j < select.length; j++)
      if (select[j] < select[index]) index = j;
    if (index != i) [select[i], select[index]] = [select[index], select[i]];
  }
  console.timeEnd("select");
  return select;
}
function insertionSort(arr) {
  function binarySearch(arr, maxIndex, value) {
    let min = 0;
    let max = maxIndex;

    while (min <= max) {
      const mid = Math.floor((min + max) / 2);

      if (arr[mid] <= value) {
        min = mid + 1;
      } else {
        max = mid - 1;
      }
    }

    return min;
  }
  console.time("insert");
  for (let i = 1, len = arr.length; i < len; i++) {
    const temp = arr[i];
    const insertIndex = binarySearch(arr, i - 1, arr[i]);

    for (let preIndex = i - 1; preIndex >= insertIndex; preIndex--) {
      arr[preIndex + 1] = arr[preIndex];
    }
    arr[insertIndex] = temp;
  }

  console.timeEnd("insert");
  return arr;
}
function shellSort(arr) {
  console.time("shellSort");

  const len = arr.length;
  let gap = 1;

  while (gap < len / 3) {
    gap = gap * 3 + 1;
  }
  while (gap > 0) {
    for (let i = gap; i < len; i++) {
      const temp = arr[i];
      let preIndex = i - gap;

      while (arr[preIndex] > temp) {
        arr[preIndex + gap] = arr[preIndex];
        preIndex -= gap;
      }
      arr[preIndex + gap] = temp;
    }
    gap = Math.floor(gap / 2);
  }
  console.timeEnd("shellSort");

  return arr;
}
function mergeSort(arr) {
  const len = arr.length;

  if (len < 2) {
    return arr;
  }

  const mid = Math.floor(len / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  return merge(mergeSort(left), mergeSort(right));
}
function merge(left, right) {
  const result = [];

  while (left.length > 0 && right.length > 0) {
    result.push(left[0] <= right[0] ? left.shift() : right.shift());
  }

  return result.concat(left, right);
}
function heapSort(arr) {
  function heapify(start, end) {
    // 建立父节点下标和子节点下标
    const dad = start;
    let son = dad * 2 + 1;

    if (son >= end) {
      return 0;
    }

    if (son + 1 < end && arr[son] < arr[son + 1]) {
      son += 1;
    }
    if (arr[dad] <= arr[son]) {
      [arr[dad], arr[son]] = [arr[son], arr[dad]];

      heapify(son, end);
    }

    return 0;
  }
  console.time("heapSort");
  const size = arr.length;

  // 初始化 heap，i 从最后一个父节点开始调整，直到节点均调整完毕
  for (let i = Math.floor(size / 2) - 1; i >= 0; i--) {
    heapify(i, size);
  }
  // 堆排序：先将第一个元素和已拍好元素前一位作交换，再重新调整，直到排序完毕
  for (let i = size - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(0, i);
  }
  console.timeEnd("heapSort");

  return arr;
}
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    // const pivot = left + Math.ceil((right - left) * 0.5);
    const pivot = Math.floor((right + left) / 2);
    const newPivot = partition(arr, pivot, left, right);

    quickSort(arr, left, newPivot - 1);
    quickSort(arr, newPivot + 1, right);
  }

  return arr;
}
function partition(arr, pivot, left, right) {
  const pivotValue = arr[pivot];
  let newPivot = left;
  [arr[pivot], arr[right]] = [arr[right], arr[pivot]];

  for (let i = left; i < right; i++) {
    if (arr[i] < pivotValue) {
      [arr[i], arr[newPivot]] = [arr[newPivot], arr[i]];

      newPivot += 1;
    }
  }
  [arr[right], arr[newPivot]] = [arr[newPivot], arr[right]];

  return newPivot;
}
for (let i = 10; i; i--) {
  const arr = Array(10000)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10000));
  console.time("mergeSort");
  const merge = mergeSort([...arr]).toString();
  console.timeEnd("mergeSort");
  console.time("quickSort");
  const quick = quickSort([...arr]).toString();
  console.timeEnd("quickSort");
  console.assert(quick === merge);
  console.assert(bubbleSort([...arr]).toString() === merge);
  console.assert(selectionSort([...arr]).toString() === quick);
  console.assert(insertionSort([...arr]).toString() === quick);
  console.assert(shellSort([...arr]).toString() === quick);
  console.assert(heapSort([...arr]).toString() === quick);
  console.log("******************************");
}
