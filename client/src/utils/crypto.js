
// TODO: convert this to window.crypto, but have to figure out how to scale it while maintaining entropy
export function RandomPrintableString(length) {
/*  let array = new int8Array(length/4);
  window.crypto.getRandomValues(array);
  array.forEach((uint) {
    let remainder = uint;
    for(let i = 0; i < 4; i++) {
      if (remainder > 64) {

      }
    }
  }
*/
  let charCodeMapping = function(num) {
    if (num === 0) {
      return 45;
    } else if (num === 1) {
      return 47;
    } else if (num > 1 && num <= 11) {
      return num + 46; // numbers
    } else if (num > 11 && num <= 37) {
      return num + 53; // uppercase
    } else if (num > 37) { 
      return num + 59; // lowercase
    }
  }

  let chars = '';
  for(let i = 0; i<length; i++) {
    let num = Math.floor(Math.random() * 64);
    chars += String.fromCharCode(charCodeMapping(num));
  }

  return chars;
}

/* 
// 62 printables, make it an even 64 for easy 256/4
0 45 // dash
1 47 // stroke
2-11 48-57 // numbers
12-37  65-90 // uppercase
38 - 64 97-122 // lowercase
*/
