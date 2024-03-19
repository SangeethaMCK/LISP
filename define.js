
const lispInter = input => {
    let variable, value, rest;
    if (input.startsWith("("))
        input = input.slice(1).trim();
    //valueparser
    if (value = valueparser(input)) {
        return value[0];
    }
    //define
    else if (input.startsWith("define")) {
        input = input.slice(6).trim();
        while (input[0] !== " ") {
            variable += input[0];
            input = input.slice(1);
        }
        [value, rest] = valueparser(input);
        return defineFunc(variable, value);
    }
    //If 
    else if (input.startsWith("if")) {
        input = input.slice(2).trim();
        value = lispInter(input); console.log(typeof value);

        if (value.startsWith("true")) {
            input = value.slice(4).trim();
            [value, rest] = lispInter(input);
            return value;
        }
        else if (value.startsWith("false")) {
            input = value.slice(5).trim();
            value = lispInter(input);
            input = value;
            while (input[0] !== " ") {
                input = input.slice(1);
            }
            value = lispInter(input.trim());
            return value;
        }
    }
    //quote
    else if (input.startsWith("quote") || input.startsWith("'")) {
        if (input.startsWith("quote")) {
            return input.slice(5, input.length - 1).trim();
        }
        else if (input.startsWith("'")) {
            input = input.slice(1);
            if (input.trim().startsWith("'")) {
                return ("(quote " + `${input}` + ")")
            }
            return input;
        }

    }
    //begin
    else {
        let numbers = [];
        if (input.startsWith("max")) {
            operator = "max";
            input = input.slice(3).trim();
        }
        else if (input.startsWith("min")) {
            operator = "min";
            input = input.slice(3).trim();
        }
        else {
            operator = input[0];
            if (input[1] == "=") {
                operator += "=";
                input = input.slice(1).trim();
            }
            input = input.slice(1).trim();
        }
        while (input[0] !== ")") {
            let x = operator;
            if (input.startsWith("(")) {
                x = operator;
                input = lispInter(input);
            }
            operator = x;
            [num, rest] = numparser(input);
            numbers.push(num);
            input = rest.trim();
        }
        // return (evaluate(operator, numbers) + " " + input.slice(1));
        return (evaluate(operator, numbers));
    }
}

function defineFunc(variable, val) {
    return defineObj[variable] = val;
}

// function evaluate(operator, numbers) {
//     switch (operator) {
//         case "+":
//             return numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2));
//         case "-":
//             return numbers.reduce((val1, val2) => parseFloat(val1) - parseFloat(val2));
//         case "*":
//             return numbers.reduce((val1, val2) => parseFloat(val1) * parseFloat(val2));
//         case "/":
//             return numbers.reduce((val1, val2) => parseFloat(val1) / parseFloat(val2));
//         case "%":
//             return numbers.reduce((val1, val2) => parseFloat(val1) % parseFloat(val2));
//         case ">":
//             return numbers.reduce((val1, val2) => parseFloat(val1) > parseFloat(val2));
//         case "<":
//             return numbers.reduce((val1, val2) => parseFloat(val1) < parseFloat(val2));
//         case "==":
//             return numbers.reduce((val1, val2) => parseFloat(val1) == parseFloat(val2));
//         case ">=":
//             return numbers.reduce((val1, val2) => parseFloat(val1) >= parseFloat(val2));
//         case "<=":
//             return numbers.reduce((val1, val2) => parseFloat(val1) <= parseFloat(val2));
//         case "max":
//             return numbers.reduce((val1, val2) => Math.max(parseFloat(val1), parseFloat(val2)));
//         case "min":
//             return numbers.reduce((val1, val2) => Math.min(parseFloat(val1), parseFloat(val2)));
//     }
// }
const valueparser = (input) => {
    let value = [];
    input = input.trim();
    if ((value =
        nullparser(input) || boolparser(input) || stringparser(input) || numparser(input) ))
        return value;
};

const nullparser = (input) => {
    if (!input.startsWith(null)) return null;
    else return [null, input.slice(4)];
};
const boolparser = (input) => {
    if (input.startsWith("true")) return [true, input.slice(4)];
    else if (input.startsWith("false")) return [false, input.slice(5)];
    else return null;
};
const numparser = (input) => {
    input = input.trim();
    let regX = /(^-?[0-9]*\.?[0-9]+[Ee]?[-+]?[0-9]*)/;
    if (!regX.test(input))
        return null;
    let num = input.match(regX);
    if (                                                                   //056, 09.43, 0. are not valid
        (input.startsWith(0) && input[1] != "." && num[0].length > 1) ||
        (input.startsWith(0) && input[1] == "." && num[0].length < 2)
    )
        throw new SyntaxError("Not a valid number");
    return [Number(num[0]), input.slice(num[0].length)];

};
const stringparser = (input) => {
    if (!input.startsWith('"')) return null;
    let string = "";
    let escapeChar = false;                            //if any escape char is found, changes to true
    let strPosition = 1;
    let str, rest;
    for (let index = 1; index < input.length; index++) {
        if (
            (input[index - 2] == "\\" && input[index - 1] == "\\" && input[index] == '"') ||       // to avoid \\"
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
                    const hexCodePoint = str.substring(strPosition + 1, strPosition + 5);           //it holds value like 0032 (\\u0032)
                    const char_unicode = String.fromCharCode(parseInt(hexCodePoint, 16));    //converts unicode to a character
                    string += char_unicode.toString();
                    strPosition = strPosition + 4;                                               //to skip  4 digits of unicode
                    break;
                }
                default:
                    throw new SyntaxError("Invalid escape sequence");
            }
            escapeChar = false;                           //to change it for every loop
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

const env={
    "+":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "-":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "*":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "/":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "%":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "<":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    ">":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    ">=":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "<=":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "==":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "max":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
    "min":numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2)),
}
console.log(lispInter(" (if (< 10 20) (+ 1 1) (+ 3 3))"));
// console.log(lispInter("(* (- 9 3) 6)"))
// console.log(lispInter("define a 10"));


while (input[0] !== ")") {
    variable='';
    if (input.startsWith("(")) {
        input= lispInter(input); 
    } operator=x;

    while(input[0]!==" " && input[0]!==")"){
        variable+=input[0]; 
        input=input.slice(1);

    }input=input.slice(1);
    rest=input;
    if(env[variable]){
        numbers.push(env[variable]);
    } 
    else if (!isNaN(variable)){ 
    [num, rest] = numparser(variable);
    numbers.push(num); 
    input = rest.trim(); console.log(input)}
}