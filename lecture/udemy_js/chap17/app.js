const button = document.querySelector('button');
const output = document.querySelector('p');

const getPosition = (options) => {
    const promise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((success => {
            resolve(success);
        }, error => {
        }, options))

    })

    return promise
}

const setTimer = (duration) => {
    const promise = new Promise(((resolve, reject) => {
        setTimeout(() => {
            console.log(typeof resolve)
            resolve('Done');
        }, duration)
    }));
    return promise;
}

function trackUserHandler() {
    navigator.geolocation.getCurrentPosition(position => {
        setTimer(2000).then(data => {
            console.log(data, position)
        })
    }, positionError => {
        console.log(positionError)
    })

    console.log("Getting position");
}

button.addEventListener('click', trackUserHandler);


console.log()