const env = {
    "+": numbers => { return numbers.reduce((a, b) => a + b); },
    "-": numbers => { return numbers.reduce((a, b) => a - b); },
    "*": numbers => { return numbers.reduce((a, b) => a * b); },
    "/": numbers => { return numbers.reduce((a, b) => a / b); }, //
    "%": numbers => { return numbers.reduce((a, b) => a % b); },
    "max": numbers => { return numbers.reduce((a, b) => Math.max(a, b)); },
    "min": numbers => { return numbers.reduce((a, b) => Math.min(a, b)); },
    "<": numbers => { if (numbers[0] < numbers[1]) return true; return false; },
    ">": numbers => { if (numbers[0] > numbers[1]) return true; return false; },
    ">=": numbers => { if (numbers[0] >= numbers[1]) return true; return false; },
    "<=": numbers => { if (numbers[0] <= numbers[1]) return true; return false; },
    "=": numbers => { if (numbers[0] == numbers[1]) return true; return false; }
};
const expParser = input => {
    if (input.startsWith("(")) {
        return splParser(input);
    }
    else if (input.startsWith(")")) {
        return "unexpected";
    }
    else if (input.startsWith("'")) {
        input = input.slice(1).trim();
        return input;
    }
    else {
        return env[input] || valueparser(input);
    }
};
const splParser = input => {
    let variable = '', value, rest;
    let op;
    if (input.startsWith("(")) {
        input = input.slice(1).trim();
        if (input == (")")) {
            return "()";
        }
    }
    //If
    if (input.startsWith("if")) {
        input = input.slice(2).trim();
        [value, rest] = expParser(input);

        if (value == true) {
            [value, rest] = expParser(rest);
            return value;
        }

        [value, rest] = expParser(rest);
        input = rest;
        [value, rest] = expParser(input.trim());
        return value;

    }
    //define
    else if (input.startsWith("define")) {
        input = input.slice(6).trim();
        while (input[0] != " ") {
            variable += input[0];
            input = input.slice(1);
        }
        [value, rest] = valueparser(input.trim());
        env[variable] = value;
    }
    //set!
    else if (input.startsWith("set!")) {
        input = input.slice(4).trim();
        while (input[0] != " ") {
            variable += input[0];
            input = input.slice(1);
        }
        [value, rest] = valueparser(input.trim());
        if (env[variable])
            env[variable] = value;
        else return "not found";
    }
    //begin
    else if (input.startsWith("begin")) {
        input = input.slice(5).trim();
        let result;
        while (input != ")") {
            [result, input] = expParser(input);
            // input = rest;
        }
        return result;
    }
    //quote
    else if (input.startsWith("quote")) {
        if (input.startsWith("quote")) {
            return input.slice(5, input.length - 1).trim();
        }
    }
    //lambda
    // else if(input.startsWith("lambda")){
    //     let args='';
    //     let variable='';
    //     input=input.slice(7).trim();
    //     if(input.startsWith("(")){
    //     input=input.slice(1).trim();
    //     while(input[0]!=")"){
    //         if(input[0]==" "){
    //            args+=variable;
    //            args+=",";
    //            variable='';
    //            input=input.trim();
    //         }
    //         else{
    //         variable+=input[0];
    //         input=input.slice(1);
    //     }} input=input.slice(1).trim();
    //     }
    //     while(input[0]!=")")
    //     if(input.startsWith("(")){
    //         i
    // }}
    //evaluate
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
            op = operator;
            input = input.slice(1).trim();
        }
        while (input[0] !== ")") {
            variable = '';
            if (input[0] == "(") {
                input = expParser(input);
                numbers.push(input[0]);
                input = input[1];
                operator = op;
            }
            if (!numparser(input)) {
                while (input[0] !== " " && input[0] !== ")") {
                    variable += input[0];
                    input = input.slice(1);
                }
                rest = input.trim();
                if (env[variable]) {
                    numbers.push(env[variable]);
                }
            }
            else {
                [input, rest] = numparser(input);
                numbers.push(input);
            }
            input = rest.trim();
        }
        input = input.slice(1).trim();
        if (input)
            return [env[operator](numbers), input];
        else return env[operator](numbers);
    }
};
const valueparser = (input) => {
    input = input.trim();
    const value = nullparser(input) || boolparser(input) || stringparser(input) || numparser(input)
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
// console.log(expParser('(defineradius 5)'));
// console.log(expParser(`(* radius radius)`));
// console.log(expParser('(set! radius 6)'));
// console.log(expParser('(set! a 6)'))
// console.log(expParser(`(* 2 radius)`));
// console.log(expParser("( / (+ 7 10 19 ) 9 )"));
// console.log(expParser("(if (> (* 11 11) 120) (* (+ 7 6)2) (+ 1 2))"))
// console.log(expParser("(max 3 24 5)"))
// console.log(expParser("'(quote #(a b c)) "));
// console.log(expParser("(quote a) "));
// console.log(expParser("(begin (+ 2 3) (* 4 4) (- 1 3))"))
// console.log(expParser('"a"'));
// console.log(expParser("(if(> 9 8 ) (+ 1 2) (+ 3 4)"));
// console.log(expParser("a"))
// console.log(expParser(`(if(< 4 3) 3 2 )`))
console.log(expParser("(define (a) 10)"))
console.log(env["(a)"])