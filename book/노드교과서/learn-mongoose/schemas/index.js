const mongoose = require('mongoose');


const connect = async () => {
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }

    try {
        await mongoose.connect('mongodb://localhost:27017', {
            dbName: 'nodejs',
            useNewUrlParser: true,
        });
        console.log('몽고디비 연결 성공');
    } catch (error) {
        console.log('몽고디비 연결 에러', error);
    }
}

module.exports = connect;