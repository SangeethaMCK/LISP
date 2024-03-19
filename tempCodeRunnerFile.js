us 5)'));
console.log(expParser(`(* radius radius)`));
console.log(expParser('(set! radius 6)'));
console.log(expParser('(set! a 6)'))
console.log(expParser(`(* 2 radius)`));
console.log(expParser("( / (+ 7 10 19 ) 9 )"));
console.log(expParser("(if (< (* 11 11) 120) (* 7 6) (+ 1 2))"))
console.log(expParser("(max 3 24 5)"))
console.log(expParser("'(quote #(a b c)) "));
console.log(expParser("(quote a) "));
console.log(expParser("(begin (+ 2 3) (* 4 4) (- 1 3))"))
console.log(expParser('"a"'));
console.log(expParser("(if(> 9 8 ) (+ 1 2) (+ 3 4)"));
console.log(expParser("a radius"))