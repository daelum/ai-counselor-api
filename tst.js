// square every digit in each of the numbers
// concatenate them
num = 9119
function squareDigits(num) {
  console.log(num)
  //  convert the number to a string (so it can be split)
  let stringy = num.toString()
  console.log(stringy)
  // split the number into an array
  let split = stringy.split('')
  console.log(split)
  //   loop through the array and sqaure each element
  let mapped = split.map((element) => {
    return element * element
  })
  console.log(mapped)
  // return each element concatenated
  let joined = mapped.join('')
  console.log(joined)
  return joined
}

squareDigits(num)
