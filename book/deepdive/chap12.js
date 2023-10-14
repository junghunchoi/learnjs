// 콜백함수
//함수를 인자로 받아 재생산 없이 고차함수를 아래와 같이 재활용할 수 있게 한다.
function repeat(n,f) {
    for (let i = 0; i < n; i++) {
        f(i);
    }
}

const logAll = function (i) {
    console.log(i);
};

repeat(5, logAll);

const logOdds = function (i) {
    if(i%2) console.log(i);
};

repeat(5,logOdds)

// 함수의 매개변수를통해 다른 함수의 내부로 전달되는 함수를 콜백함수라 하며, 콜백함수를 전달받은 함수를 고차함수라 한다.

// 콜백 함수를 사용하는 고차 함수 map
let res = [1,2,3].map(function (item){
    return item * 2;
});

console.log(res);

// 고차 함수 filter
res = [1,2,3].filter(function (item){
    return item % 2; // 나머지가 0일 경우 필터됨
})

console.log(res) // 1,3

res = [1,2,3].reduce(function (acc,cur){
    return acc + cur;
},0)

console.log(res) // 6