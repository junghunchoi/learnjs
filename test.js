import sql from "mssql/msnodesqlv8.js";

// Connect to SQL Server using Windows Auth
const conn = new sql.ConnectionPool({
  connectionString:
    "Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes",
});

// conn.connect()
//     .then(function () {
//       console.log("Connected to SQL Server");
//     })
//     .catch(function (err) {
//       console.log(err);
//     }
//     );

console.log("Starting...");
connectAndQuery();

async function connectAndQuery() {
  try {
    // var poolConnection = await sql.connect(conn);
    var resultSet = await conn.request().query(`select * from checktable`);

    console.log(`${resultSet.recordset.length} rows returned`);
  } catch (err) {
    console.log(err);
  }
}
