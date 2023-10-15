const arr = Array(100).fill().map((arr,i)=> i)

console.log(arr);

arr.forEach((row)=>{
    arr.forEach(col => {
        console.log("col", col);
    });
    console.log("row",row)})