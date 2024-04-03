const env = {
  "+": (numbers) => numbers.reduce((a, b) => a + b),
  "-": (numbers) => {
    if (numbers.length == 1) return -numbers[0];
    return numbers.reduce((a, b) => a - b);
  },
  "*": (numbers) => numbers.reduce((a, b) => a * b),
  "/": (numbers) => numbers[0] / numbers[1],
  "%": (numbers) => numbers[0] % numbers[1],
  "<": (numbers) => {
    if (numbers[0] < numbers[1]) return true;
    return false;
  },
  ">": (numbers) => {
    if (numbers[0] > numbers[1]) return true;
    return false;
  },
  ">=": (numbers) => {
    if (numbers[0] >= numbers[1]) return true;
    return false;
  },
  "<=": (numbers) => {
    if (numbers[0] <= numbers[1]) return true;
    return false;
  },
  "=": (numbers) => {
    if (numbers[0] == numbers[1]) return true;
    return false;
  },
  max: (numbers) => {
    return numbers.reduce((a, b) => Math.max(a, b));
  },
  min: (numbers) => {
    return numbers.reduce((a, b) => Math.min(a, b));
  },
  sqrt: (numbers) => {
    return Math.sqrt(numbers[0]);
  },
  pow: (numbers) => {
    return Math.pow(numbers[0], numbers[1]);
  },
  list: (numbers) => {
    return [...numbers];
  },
  pi: 3.14,
  "#t": true,
  "#f": false,
};
const symParser= (input, localEnv) =>{
  let operator="";
  while(input[0]!=" " && input[0]!="(" && input[0]!= ")"){
    operator+=input[0];
    input=input.slice(1);
  }
  input=input.slice(1).trim();
  if(localEnv[operator])
    return [localEnv[operator], input];
  if((operator === "define"||operator === "begin"||operator === "if"||operator === "set!"||operator === "lambda"||operator === "let"))
    return [operator, input];
return null;
}
const lispEntry=(input, localEnv=env) =>{
    output=lispInter(input, localEnv);
    if(output)return output;
    return null
}
const lispInter = (input, localEnv = env) => {
  return expParser(input, localEnv) || symParser(input, localEnv) || valueparser(input);
};

const expParser = (input, localEnv) => {
  let value="";
  if (!input.startsWith("(")) return null;
  if (input[1] == ")") return input;
  input = input.slice(1).trim();
  if (!input) return null;
 if(input[0]=="("){
 }
 [operator, input]= symParser(input.trim(), localEnv);
 if(!operator) return null;
 if(typeof operator !=="function") return splParser(input, localEnv)
 [value, input]=lispInter(input) ;
if(value){
  arguments.push(value);
}
  return [operator(arguments), input];
};

const splParser = (operator, input, localEnv) => {
  if (operator == "if") return ifParser(input, localEnv);
  if (operator == "define") return defineParser(input, localEnv);
  if (operator == "set!") return setParser(input, localEnv);
  if (operator == "begin") return beginParser(input, localEnv);
  if (operator == "lambda") return lambdaParser(input, localEnv);
  if (operator == "let") return letParser(input, localEnv);
  return null;
};
//If
function ifParser(input, localEnv) {
  let value, result;
  let rest;
  let condition;
  let arg1;
  let arg2;
  let countArg = 0;
  while (!input.startsWith(")")) {
    [value, rest] = lispInter(input, localEnv);
    if (countArg == 0) condition = value;
    if (countArg == 1) arg1 = value;
    if (countArg == 2) arg2 = value;
    countArg++;
    input = rest.trim();
    if (
      (countArg == 2 && condition == true) ||
      (countArg == 3 && condition == false)
    ) {
      result = condition ? arg1 : arg2;
      break;
    }
  }
  input = input.trim().slice(1);
  return [result, input];
}
//define
function defineParser(input, localEnv) {
  let value;
  const variable = input.match(/^[^\s(]+/)[0];
  input = input.slice(variable.length).trim();

  [value, input] = lispInter(input.trim(), localEnv);

  localEnv[variable] = value;
  input = input.trim().slice(1);
  return [value, input];
  
}
//set!
function setParser(input, localEnv) {
  let variable = "";
  while (input[0] != " ") {
    variable += input[0];
    input = input.slice(1);
  }
  [value, input] = lispInter(input.trim(), localEnv);
  if (localEnv[variable]) {
    localEnv[variable] = value;
    input = input.slice(1).trim();
    return [value, input];
  } else throw "NotFound";
}
//begin
function beginParser(input, localEnv) {
  let result;
  while (input[0] != ")") {
    [result, input] = lispInter(input.trim(), localEnv);
  }
  input = input.slice(1).trim();
  return result;
}
//lambda
function lambdaParser(input, localEnv) {
  let variable = "";
  let count = 0;
  let expression = "";
  let array = [];
  let argument = [];
  if (input.trim().startsWith("(")) {
    input = input.slice(1);
    while (input[0] !== ")") {
      if (input[0] == " ") {
        array.push(variable);
        variable = "";
      }
      variable += input[0].trim();
      input = input.slice(1);
    }
    input = input.slice(1).trim();
  }
  array.push(variable);
  while (count != -1) {
    if (input[0] == "(") count++;
    if (input[0] == ")") count--;
    if (count === -1) break;
    expression += input[0];
    input = input.slice(1);
  }
  input = input.trim().slice(1);
  return [
    (...argument) => {
      array.forEach((arg, index) => {
        localEnv[arg] = argument[0][index];
      });
      return lispInter(expression, localEnv);
    },
    input,
  ];
}
//let
function letParser(input, localEnv) {
  if (!input.startsWith("(")) return null;
  input = input.slice(1).trim();
  while (input[0] != ")") {
    if (input[0] !== "(") return null;
    let variable = "";
    input = input.trim().slice(1);
    while (input[0] != " ") {
      variable += input[0];
      input = input.slice(1);
    }
    [value, input] = lispInter(input.trim(), localEnv);
    localEnv[variable] = value;
    input = input.slice(1).trim();
  }
  return expParser(input.trim(), localEnv);
}
//valueparser
const valueparser = (input) => {
  input = input.trim();
  const value =
    nullparser(input) ||
    boolparser(input) ||
    stringparser(input) ||
    numparser(input);
  return value;
};
const nullparser = (input) => {
  if (!input.startsWith(null)) return null;
  return [null, input.slice(4)];
};
const boolparser = (input) => {
  if (input.startsWith("true")) return [true, input.slice(4)];
  if (input.startsWith("#t")) return [true, input.slice(2)];
  if (input.startsWith("false")) return [false, input.slice(5)];
  if (input.startsWith("#f")) return [false, input.slice(2)];
  return null;
};
const numparser = (input) => {
  input = input.trim();
  let regX = /(^-?[0-9]*\.?[0-9]+[Ee]?[-+]?[0-9]*)/;
  if (!regX.test(input)) return null;
  let num = input.match(regX);
  if (
    (input.startsWith(0) && input[1] != "." && num[0].length > 1) ||
    (input.startsWith(0) && input[1] == "." && num[0].length < 2)
  )
    throw new SyntaxError("Not a valid number");
  return [Number(num[0]), input.slice(num[0].length)];
};
const stringparser = (input) => {
  if (!input.startsWith('"')) return null;
  let string = "";
  let escapeChar = false; //if any escape char is found, changes to true
  let strPosition = 1;
  let str, rest;
  for (let index = 1; index < input.length; index++) {
    if (
      (input[index - 2] == "\\" &&
        input[index - 1] == "\\" &&
        input[index] == '"') || // to avoid \\"
      (input[index] == '"' && input[index - 1] != "\\")
    ) {
      [str, rest] = [input.slice(0, index), input.slice(index + 1)];
      break;
    }
  }
  while (strPosition < str.length) {
    const char = str[strPosition];
    if (escapeChar) {
      switch (char) {
        case '"':
          string += '"';
          break;
        case "\\":
          string += "\\\\";
          break;
        case "/":
          string += "/";
          break;
        case "b":
          string += "\\b";
          break;
        case "f":
          string += "\\f";
          break;
        case "n":
          string += "\\n";
          break;
        case "r":
          string += "\\r";
          break;
        case "t":
          string += "\\t";
          break;
        case "u": {
          const hexCodePoint = str.substring(strPosition + 1, strPosition + 5); //it holds value like 0032 (\\u0032)
          const char_unicode = String.fromCharCode(parseInt(hexCodePoint, 16)); //converts unicode to a character
          string += char_unicode.toString();
          strPosition = strPosition + 4; //to skip  4 digits of unicode
          break;
        }
        default:
          throw new SyntaxError("Invalid escape sequence");
      }
      escapeChar = false; //to change it for every loop
    } else if (char === '"') {
      break;
    } else if (char === "\\") {
      escapeChar = true;
    } else if (char.match(/[\n\t\r\f]/)) {
      throw new SyntaxError("Bad control character in string literal");
    } else {
      string += char;
    }
    strPosition++;
  }
  return [string, rest];
};
// console.log(lispEntry("(define circle-area (lambda (r) (* pi (* r r))))"));
// console.log(lispEntry("(circle-area 3)"));

// console.log(
//   lispEntry("(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))")
// );
// console.log(lispEntry("(fact 2)"));
// console.log(lispEntry("(fact 100)"));
// console.log(lispEntry("(circle-area (fact 10))"));

// lispEntry("(define twice (lambda (x) (* 2 x)))");
// console.log(lispEntry("(twice 5)"));
// console.log(lispEntry("((lambda (x) (+ x x)) 4)"));

// console.log(lispEntry("( + ( + ( + 9 ( + 2 2)) 2) ( - 3 4) )"));
console.log(lispEntry("(+ 5 2)"))
// lispEntry("(define repeat (lambda (f) (lambda (x) (f (f x)))))");

// console.log(lispEntry("((repeat twice) 10)"));
// console.log(lispEntry("((repeat (repeat twice)) 10)"));
