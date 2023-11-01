// import sql from "mssql/msnodesqlv8.js";
// import express from 'express';
//
// // Connect to SQL Server using Windows Auth
// const conn = new sql.ConnectionPool({
//     connectionString:
//         "Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes",
// });
//
// async () =>{
//     try{
//         await conn.connect(`Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes`)
//         let result = await sql.query(`select * from checktable`);
//     }catch (err){
//         console.log(err)
//     }
// }

// conn.connect()
//     .then(function () {
//       console.log("Connected to SQL Server");
//     })
//     .catch(function (err) {
//       console.log(err);
//     }
//     );

import sql from "mssql/msnodesqlv8.js"

async () => {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect('Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes')
        const result = await sql.query`select * from checktable`
        console.log("??");
        console.dir(result)
    } catch (err) {
        console.log(err)
    }
}