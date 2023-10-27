async function wait() {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
           new Error("에러 발생!");
        }, 1000);
    });

    return 10;
}

function f() {
    wait().then(
        result => console.log(result)
        // error => console.error(error)
    ).catch(error=>console.log("error"));
}

f();