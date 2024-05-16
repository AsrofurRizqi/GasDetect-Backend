require('dotenv').config();
module.exports={
  "development": {
    "username": "postgres",
    "password": "123",
    "database": "test",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "timezone": "Asia/Jakarta",
    "dialectOptions": {
      useUTC: false
    },
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    use_env_variable: 'DATABASE_URL',
    dialect: "postgress",
    timezone: "+07:00",
    protocol: "postgress",
    dialectOptions: {
      ssl : {
        require : true,
        rejectUnauthorized : false
      },
      timezone: 'local'
    }
  }
}
