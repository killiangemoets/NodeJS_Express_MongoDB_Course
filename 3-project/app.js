// NOTE : This app.js file is usually mainly used for middleware declarations

const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES

if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// This express.json is middleware. And middleware is basically a function that can modify the incoming request data. It's called middleware bc it stands between, so in the middle of the request and the response. It's a step that the request goes through while it's being processed. (In this exemple the step the request goes through is simply that the data from the body is added to it, i.e. to the request object, by using this middleware. We need app.use to use this middle middleware)
app.use(express.json());

// How to serve static files
app.use(express.static(`${__dirname}/public`));

// We add more middlewares to our middlewares stack.
// In all middleware functions we have access to request, the response and the next function.
// This middleware here applies to all the requests (coming after) because we didn't specify any route.
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

app.use((req, res, next) => {
  // We add "requestTime" to the request
  req.requestTime = new Date().toISOString();
  next(); //We call the next middleware in the stack
});

// It's called MOUNTING the router, i.e mounting a new router on a route.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
