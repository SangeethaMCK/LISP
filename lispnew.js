const env = {
    "+": (numbers) => numbers.reduce((a, b) => a + b),
    "-": (numbers) => {
        if (numbers.length == 1) return -numbers[0];
        return numbers.reduce((a, b) => a - b);
    },
    "*": (numbers) => {
        if (numbers.includes(0)) return 0;
        return numbers.reduce((a, b) => a * b);
    },
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
    max: (numbers) => numbers.reduce((a, b) => Math.max(a, b)),
    min: (numbers) => numbers.reduce((a, b) => Math.min(a, b)),
    sqrt: (numbers) => Math.sqrt(numbers[0]),
    pow: (numbers) => Math.pow(numbers[0], numbers[1]),
    list: (numbers) => [...numbers],
    pi: 3.14,
    "#t": true,
    "#f": false,
};
const splitParser = (input, localEnv) => {
    let operator = "";
    while (
        input[0] != " " &&
        input[0] != "(" &&
        input[0] != ")" &&
        input[0] != undefined
    ) {
        operator += input[0];
        input = input.slice(1);
    }
    return [operator, input.trim(), localEnv];
}
const symParser = (input, localEnv) => {

    [operator, input, localEnv] = splitParser(input, localEnv);

    if (!localEnv[operator] && localEnv[operator] !== 0) return null;
    return [localEnv[operator], input.trim()];
};
const bracketParser = (input, localEnv) => {
    let count = 1;
    let expression = "";
    while (count) {
        if (input[0] == "(") count++;
        if (input[0] == ")") count--;
        expression += input[0];
        input = input.slice(1);
        if (count === 1) break;
    }
    return [expression, input.trim()];
};
const lispEntry = (input, localEnv = env) => {
    let array = [];
    [output, input] = lispInter(input.trim(), localEnv);
    if (!input) return output;
    array.push(output);
    while (input) {
        [output, input] = lispInter(input.trim(), localEnv);
        array.push(output);
    }
    return array;
};
const lispInter = (input, localEnv) => {
    return (
        expParser(input.trim(), localEnv) ||
        symParser(input.trim(), localEnv) ||
        valueparser(input.trim())
    );
};
const expParser = (input, localEnv) => {
    let value; let argument = [];
    if (!input.startsWith("(")) return null;
    if (input[1] == ")") return ["()", input.slice(2).trim()];
    input = input.slice(1).trim();
    if (!input) return null;
    value = splParser(input.trim(), localEnv);
    if (value) return value;
    const opParsed = expParser(input.trim(), localEnv) || symParser(input.trim(), localEnv);
    const operator = opParsed[0];
    input = opParsed[1];
    if (!operator) return null;
    while (input[0] != ")") {
        [value, input] = lispInter(input.trim(), localEnv);
        input = input.trim();
        if (value || value === 0) argument.push(value);
    }
    input = input.slice(1).trim();
    return [operator(argument), input];
};
const splParser = (input, localEnv) => {

    [parserName, input, localEnv] = splitParser(input, localEnv);

    return ifParser(parserName, input, localEnv) || defineParser(parserName, input, localEnv)||setParser(parserName, input, localEnv)||beginParser(parserName, input, localEnv)||lambdaParser(parserName, input, localEnv) || letParser(parserName, input, localEnv);

};
//If
const ifParser = (op, input, localEnv) => {
    if(op!=="if") return null;
    let value, result, condition;
    [value, input] = lispInter(input, localEnv);
    condition = value;
    while (!input.startsWith(")")) {
        if (condition === true) {
            [result, input] = lispInter(input.trim(), localEnv);
            
            if (input.trim().startsWith("("))
                [expression, input] = bracketParser(input.trim(), localEnv);
            else[value, input] = splitParser(input.trim(), localEnv);
        } 
        else {
            if (input.trim().startsWith("("))
                [expression, input] = bracketParser(input.trim(), localEnv);
            else[value, input] = splitParser(input.trim(), localEnv);
            
            [result, input] = lispInter(input.trim(), localEnv);
        }
    }
    input = input.trim().slice(1);
    return [result, input];
}
//define
const defineParser = (op, input, localEnv) => {
    if(op!=="define") return null;
    let value, variable = "";
    while (input[0] != " " && input[0] != "(" && input[0] != ")") {
        if (/[0-9]/.test(input[0])) throw "error";
        variable += input[0];
        input = input.slice(1);
    }
    input = input.slice(1);
    [value, input] = lispInter(input.trim(), localEnv);
    localEnv[variable] = value;
    input = input.trim().slice(1);
    return [value, input.trim()];
}
//set!
const setParser = (op, input, localEnv) => {
    if(op!=="set!") return null;
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
const beginParser = (op, input, localEnv) => {
    if(op!=="begin") return null;
    let result;
    while (input[0] != ")") {
        [result, input] = lispInter(input.trim(), localEnv);
    }
    input = input.slice(1).trim();
    return [result, input];
}
//lambda
const lambdaParser = (op, input, localEnv) => {
    if(op!=="lambda") return null;
    let variable = "",
        expression = "",
        array = [];
    if (input.trim().startsWith("(")) {
        input = input.slice(1).trim();
        while (input[0] !== ")") {
            if (input[0] !== " ") {
                variable += input[0].trim();
                input = input.slice(1);
            }
            array.push(variable);
            variable = "";
        }
        input = input.slice(1).trim();
        array.push(variable);
    }
    [expression, input] = bracketParser(input.trim(), localEnv);
    input = input.slice(1).trim();
    return [
        (argument) => {
            let lambdaEnv = Object.assign({}, localEnv);
            array.forEach((arg, index) => {
                lambdaEnv[arg] = argument[index];
            });
            return lispInter(expression, lambdaEnv)[0];
        },
        input,
    ];
}
//let : (let ((x 2) (y 3))(* x y))
const letParser = (op, input, localEnv) => {
    if(op!=="let") return null;
    if (!input.startsWith("(")) return null;
    input = input.slice(1).trim();
    while (input[0] != ")") {
        if (input[0] !== "(") return null;
        let variable = ""; let value;
        input = input.trim().slice(1);
        while (input[0] != " ") {
            variable += input[0];
            input = input.slice(1);
        }
        [value, input] = lispInter(input.trim(), localEnv);
        localEnv[variable] = value;
        input = input.slice(1).trim();
    }
    input = input.slice(1).trim();
    [value, input] = expParser(input.trim(), localEnv);
    input = input.slice(1).trim();
    return [value, input];
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
    if (input.startsWith("false")) return [false, input.slice(5)];
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

console.log(lispEntry("(define twice (lambda (x) (* 2 x)))"));
console.log(lispEntry("(twice 5)"));
console.log(lispEntry("(define repeat (lambda (f) (lambda (x) (f (f x)))))"));
console.log(lispEntry("((repeat twice) 10)"));
console.log(lispEntry("((repeat (repeat twice)) 10)"));
console.log(lispEntry("((repeat (repeat (repeat twice))) 10)"));
console.log(lispEntry("((repeat (repeat (repeat (repeat twice)))) 10)"));

console.log(lispEntry("(define circle-area (lambda (r) (* pi (* r r))))"));
console.log(lispEntry("(circle-area 3)"));
console.log(
  lispEntry("(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))")
);
console.log(lispEntry("(fact 10)"));
console.log(lispEntry("(fact 100)"));
console.log(lispEntry("(circle-area (fact 10))"));
console.log(lispEntry("(begin (define r 20) (define l ((if (< 4 5) + -) r r)) (* r l))"))