import lispInter from "./lispInter.js";

// lispInter("()");
console.log(lispInter("(+ 1 1)"));
// console.log(lispInter("(dw 3 3 )"));
console.log(lispInter("(define circle-area (lambda (r) (* pi (* r r))))"));
console.log(lispInter("(circle-area 3)"));
console.log(
  lispInter("(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))")
);
console.log(lispInter("(fact 10)"));
console.log(lispInter("(fact 100)"));
console.log(lispInter("(circle-area (fact 10))"));
console.log(lispInter("(define first car)"));
console.log(lispInter("(define rest cdr)"));
console.log(
  lispInter(
    "(define count (lambda (item L) (if L (+ (equal? item (first L)) (count item (rest L))) 0)))"
  )
);
console.log(lispInter("(count 0 (list 0 1 2 3 0 0))"));
console.log(
  lispInter(
    "(count (quote the) (quote (the more the merrier the bigger the better)))"
  )
);
lispInter("(define twice (lambda (x) (* 2 x)))");
console.log(lispInter("(twice 5)"));
lispInter("(define repeat (lambda (f) (lambda (x) (f (f x)))))");
console.log(lispInter("((repeat twice) 10)"));
console.log(lispInter("((repeat (repeat twice)) 10)"));
console.log(lispInter("((repeat (repeat (repeat twice))) 10)"));
console.log(lispInter("((repeat (repeat (repeat (repeat twice)))) 10)"));
console.log(lispInter("(pow 2 16)"));
console.log(
  lispInter(
    "(define fib (lambda (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2))))))"
  )
);
console.log(
  lispInter(
    "(define range (lambda (a b) (if (= a b) (quote ()) (cons a (range (+ a 1) b)))))"
  )
);

console.log(lispInter("(range 0 10)"));
console.log(lispInter("(map fib (range 0 10))"));
console.log(lispInter("(map fib (range 0 20))"));