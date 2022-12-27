//NOTE: it's a good practice to have everything related to express in one file and everything related to the server in the other file.

const mongoose = require('mongoose');
// This command will read our variables from the config file and save them into node JS environement variables
// NOTE: need to be call before requirering the app file
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION! Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const { kStringMaxLength } = require('buffer');

// console.log(app.get('env'));
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

// This connect method will return a promise so we will handle that promise by using then()
// Thise promise get access to a connection object.
mongoose.connect(DB, options).then((con) => {
  // console.log(con.connection);
  console.log('DB connection successful!');
});
// .catch((err) => console.log('ERROR'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// By doing that, any promise rejection that we might not catch somewhere in the application (exemple: wrong password to connect to the data base) is handled here
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');

  // By doing server.close, we give the server time to finish all the request that are still pending or being handled at the time
  // And only after that, the server is then killed
  server.close(() => {
    // In here we can actually pass a code. The code 0 stands for a success and 1 stands for uncaught exception
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

// console.log(x);
