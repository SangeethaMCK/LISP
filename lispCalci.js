const arithmetic = input => {
    if (input.startsWith("(")) {
        let operator, num, rest;
        let numbers = [];
        input = input.slice(1).trim();
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
        }
        input = input.slice(1).trim();
        while (input[0] !== ")") {
            if (input.startsWith("(")) {
                input = arithmetic(input)
            }
            [num, rest] = isValidNumber(input);
            numbers.push(num);
            input = rest.trim();
        }
        return (evaluate(operator, numbers) + " " + input.slice(1));
    }
}

const isValidNumber = input => {
    let regX = /^-?[0-9]*\.?[0-9]+([Ee]?[+-]?[0-9]+)?/;
    if (regX.test(input)) {
        let validNum = input.match(regX);
        if (
            (input.startsWith(0) && input[1] != "." && validNum[0].length > 1) ||
            (input.startsWith(0) && input[1] == "." && validNum[0].length < 2)
        ) return null;
        return [Number(validNum[0]), input.slice(validNum[0].length)];
    }
};
function evaluate(operator, numbers) {
    switch (operator) {
        case "+":
            return numbers.reduce((val1, val2) => parseFloat(val1) + parseFloat(val2));
        case "-":
            return numbers.reduce((val1, val2) => parseFloat(val1) - parseFloat(val2));
        case "*":
            return numbers.reduce((val1, val2) => parseFloat(val1) * parseFloat(val2));
        case "/":
            return numbers.reduce((val1, val2) => parseFloat(val1) / parseFloat(val2));
        case "%":
            return numbers.reduce((val1, val2) => parseFloat(val1) % parseFloat(val2));
        case ">":
            return numbers.reduce((val1, val2) => parseFloat(val1) > parseFloat(val2));
        case "<":
            return numbers.reduce((val1, val2) => parseFloat(val1) < parseFloat(val2));
        case "=":
            return numbers.reduce((val1, val2) => parseFloat(val1) == parseFloat(val2));
        case ">=":
            return numbers.reduce((val1, val2) => parseFloat(val1) >= parseFloat(val2));
        case ">=":
            return numbers.reduce((val1, val2) => parseFloat(val1) <= parseFloat(val2));
        case "max":
            return numbers.reduce((val1, val2) => Math.max(parseFloat(val1), parseFloat(val2)));
        case "min":
            return numbers.reduce((val1, val2) => Math.min(parseFloat(val1), parseFloat(val2)));
    }
}
console.log(arithmetic("(/ (+ 4 5 )10)"));