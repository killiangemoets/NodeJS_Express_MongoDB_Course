//NOTE: it's a good practice to have everything related to express in one file and everything related to the server in the other file.

const mongoose = require('mongoose');
// This command will read our variables from the config file and save them into node JS environement variables
// NOTE: need to be call before requirering the app file
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(app.get('env'));
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

// This connect method will return a promise so we will handle that promise by using then()
// Thise promise get access to a connection object.
mongoose.connect(DB, options).then((con) => {
  // console.log(con.connection);
  console.log('DB connection successful!');
});

// To create a model, we actually need a schema. We use a schema to describe our data, to set default values, etc.
const tourSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  price: Number,
});

// Mongoose is all about models. A model is like a blueprint that we use to create documents. It's a bit like classes in JavaScript (that we use as blueprints to create objects out of them).

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
