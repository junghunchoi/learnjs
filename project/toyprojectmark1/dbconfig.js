const  config = {
  user:  'junghun', // sql user
  password:  'wjdgns13', //sql user password
  server:  'DESKTOP-UFIU5K0', // if it does not work try- localhost
  database:  'master',
  options: {
    trustedconnection:  true,
    enableArithAbort:  true,
    encrypt:false

  },
  port:  1433
}

module.exports = config;