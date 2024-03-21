const env = {
  "+": (numbers) => {
    return numbers.reduce((a, b) => a + b);
  },
  "-": (numbers) => {
    return numbers.reduce((a, b) => a - b);
  },
  "*": (numbers) => {
    return numbers.reduce((a, b) => a * b);
  },
  "/": (numbers) => {
    return numbers[0] / numbers[1];
  },
  "%": (numbers) => {
    return numbers[0] % numbers[1];
  },
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
  pi: 3.14,
  "#t": true,
  "#f": false,
  // funct1: function testLambda(args){
  //   return lispInter(express);
  // }
};
const lispInter = (input, localEnv = env) => { 
  if (input.startsWith("(")) return expParser(input.slice(1).trim(), localEnv);
  if (input.startsWith(")")) return "unexpected";
  return localEnv[input] || valueparser(input);
};
const expParser = (input, localEnv) => {
  let operator = "",
    variable = "",
    numbers = [];
  if (input[0] == "(") return lispInter(input.trim(), localEnv); 
  while (input[0] != " " && input[0] != "(") {
    operator += input[0];
    input = input.slice(1);
  }
  if (localEnv[operator]) {
    while (input[0] != ")") {
      variable = "";
      input = input.trim()
      if (input.trim().startsWith("(")) {
        input = lispInter(input.trim(), localEnv);
        numbers.push(input[0]);
        input = input[1].trim();
      } else if (numparser(input)) {
        [value, input] = numparser(input);
        numbers.push(value);
      } else {
        while (input[0] !== " " && input[0] !== ")") {
          variable += input[0];
          input = input.slice(1);
        }
        rest = input.trim();
        if (localEnv[variable]) {
          numbers.push(localEnv[variable]);
        }
      }
      input = input.trim();
    }
    input = input.slice(1).trim();
    if (numbers.length == 1 && operator == "-" && input) return [-numbers[0], input];
    if (numbers.length == 1 && operator == "-") return -numbers[0];
    if (input) return [localEnv[operator](numbers), input];
    return localEnv[operator](numbers); 
  }
  return splParser(operator, input, localEnv);
};

const splParser = (operator, input, localEnv) => {
  input = input.trim();
  if (operator.startsWith("if")) return iflisp(input, localEnv);
  if (operator.startsWith("define")) return definelisp(input, localEnv);
  if (operator.startsWith("set!")) return setlisp(input, localEnv);
  if (operator.startsWith("begin")) return beginlisp(input, localEnv);
  if (operator.startsWith("lambda")) return lambdalisp(input, localEnv);

};
//If
function iflisp(input, localEnv) {
  let value, rest, i = 0, a, b, c;
  while (!input.startsWith(")")) {
    [value, rest] = lispInter(input, localEnv);
    if (i == 0) a = value;
    if (i == 1) b = value;
    if (i == 2) c = value;
    i++;
    input = rest.trim();
  }
  input = input.slice(1);
  if (i == 3) {
    if (input)
      return [a ? b : c, input];
    return a ? b : c;
  }
  return "arguments error";
}
//define
function definelisp(input, localEnv) {
  let variable = "", rest;
  while (input[0] != " ") {
    variable += input[0];
    input = input.slice(1);
  } 
  value = lispInter(input.trim(), localEnv); 
  localEnv[variable] = value;
}
//set!
function setlisp(input, localEnv) {
  let variable = "", rest;
  while (input[0] != " ") {
    variable += input[0];
    input = input.slice(1);
  }
  [value, rest] = valueparser(input.trim());
  console.log(variable)
  if (localEnv[variable]) {
    localEnv[variable] = value;
    return [value, rest.slice(1).trim()];
  }
  return "Not Found";
}
//begin
function beginlisp(input, localEnv) {
  let result;
  while (input != ")") {
    console.log(lispInter(input, localEnv));
    [result, input] = lispInter(input, localEnv);
  }
  return result;
}
//lambda
function lambdalisp(input, localEnv) {
  let variable = "", count = 0, expression = "", array = [];
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
  } 
  array.push(variable);

  input = input.slice(1).trim();
  while (count != -1) {
    if (input[0] == "(") count++;
    if (input[0] == ")") count--;
    expression += input[0];
    input=input.slice(1);
  }

  // Return a function that evaluates the expression with the provided arguments
  return (...args) => {
    const localScope = { ...localEnv }; // Create a local scope
    array.forEach((arg, index) => {
      localScope[arg] = args[index]; // Bind arguments to corresponding variables
    });
    return lispInter(expression, localScope); // Evaluate the expression with the local scope
  };
}

const valueparser = (input) => {
  input = input.trim();
  const value =
    nullparser(input) ||
    boolparser(input) ||
    stringparser(input) ||
    numparser(input);
  if (value && value[1] == "") {
    return value[0];
  }
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
    //056, 09.43, 0. are not valid
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
console.log(lispInter("(define circle-area (lambda (r) (* pi (* r r))))"));
console.log(env);
console.log(lispInter("(circle-area 3)"))
