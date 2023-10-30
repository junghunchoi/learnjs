const express= require('express')
const app = express()

const server = app.listen(3001,()=>{
    console.log('start server : localhost : 3001');
})