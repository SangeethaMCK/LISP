import lispEntry from "./lispInter.js";

console.log(lispEntry("(+ 1 1)"));
// console.log(lispEntry("(dw 3 3 )"));
console.log(lispEntry("(define circle-area (lambda (r) (* pi (* r r))))"));
console.log(lispEntry("(circle-area 3)"));
console.log(
  lispEntry("(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))")
);
console.log(lispEntry("(fact 10)"));
console.log(lispEntry("(fact 100)"));
console.log(lispEntry("(circle-area (fact 10))"));
// console.log(lispEntry("(define first car)"));
// console.log(lispEntry("(define rest cdr)"));
// console.log(
//   lispEntry(
//     "(define count (lambda (item L) (if L (+ (equal? item (first L)) (count item (rest L))) 0)))"
//   )
// );
// console.log(lispEntry("(count 0 (list 0 1 2 3 0 0))"));
// console.log(
//   lispEntry(
//     "(count (quote the) (quote (the more the merrier the bigger the better)))"
//   )
// );
lispEntry("(define twice (lambda (x) (* 2 x)))");
console.log(lispEntry("(twice 5)"));
lispEntry("(define repeat (lambda (f) (lambda (x) (f (f x)))))");
console.log(lispEntry("((repeat twice) 10)"));
console.log(lispEntry("((repeat (repeat twice)) 10)"));
console.log(lispEntry("((repeat (repeat (repeat twice))) 10)"));
console.log(lispEntry("((repeat (repeat (repeat (repeat twice)))) 10)"));
console.log(lispEntry("(pow 2 16)"));
// console.log(
//   lispEntry(
//     "(define fib (lambda (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2))))))"
//   )
// );
// console.log(
//   lispEntry(
//     "(define range (lambda (a b) (if (= a b) (quote ()) (cons a (range (+ a 1) b)))))"
//   )
// );

// console.log(lispEntry("(range 0 10)"));
// console.log(lispEntry("(map fib (range 0 10))"));
// console.log(lispEntry("(map fib (range 0 20))"));