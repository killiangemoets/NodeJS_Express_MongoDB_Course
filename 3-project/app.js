// NOTE : This app.js file is usually mainly used for middleware declarations
const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHanlder = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://*.cloudflare.com',
  'https://js.stripe.com',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://www.myfonts.com/fonts/radomir-tinkov/gilroy/*',
];
const connectSrcUrls = [
  'https://*.mapbox.com/',
  'https://*.cloudflare.com',
  'https://*.stripe.com',
  'http://127.0.0.1:3000',
];

const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      frameSrc: ['https://*.stripe.com'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
//         baseUri: ["'self'"],
//         fontSrc: ["'self'", 'https:', 'data:'],
//         scriptSrc: [
//           "'self'",
//           'https:',
//           'http:',
//           'blob:',
//           'https://*.mapbox.com',
//           'https://js.stripe.com',
//           'https://m.stripe.network',
//           'https://*.cloudflare.com',
//         ],
//         frameSrc: ["'self'", 'https://js.stripe.com'],
//         objectSrc: ["'none'"],
//         styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
//         workerSrc: [
//           "'self'",
//           'data:',
//           'blob:',
//           'https://*.tiles.mapbox.com',
//           'https://api.mapbox.com',
//           'https://events.mapbox.com',
//           'https://m.stripe.network',
//         ],
//         childSrc: ["'self'", 'blob:'],
//         imgSrc: ["'self'", 'data:', 'blob:'],
//         formAction: ["'self'"],
//         connectSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           'data:',
//           'blob:',
//           'https://*.stripe.com',
//           'https://*.mapbox.com',
//           'https://*.cloudflare.com/',
//           'https://bundle.js:*',
//           'ws://127.0.0.1:*/',
//         ],
//         upgradeInsecureRequests: [],
//       },
//     },
//   })
// );

// Development logging
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
// rateLimit is a function which will, based on our object, create a middleware function, which we now can use using app.use.
// In here we can define how many requests per IP we are going to allow in a certain amount of time
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
}); // We want to allow 100 requests from the same IP in one hour
app.use('/api', limiter);

// Body parser, reading data from body into req.body
// This express.json is middleware. And middleware is basically a function that can modify the incoming request data. It's called middleware bc it stands between, so in the middle of the request and the response. It's a step that the request goes through while it's being processed. (In this exemple the step the request goes through is simply that the data from the body is added to it, i.e. to the request object, by using this middleware. We need app.use to use this middle middleware)
app.use(express.json({ limit: '10kb' }));
// we can limit the amount of data that comes in the body

// This middleware parses the data from cookies
app.use(cookieParser());

// We need this middleware to parse data coming from a URL encoded form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanatize());

// Data sanatization against XSS
app.use(xss());

// Prevent parameter pollution
// (should be used by the end because it clears up the query string. For exemple if we have api/v1/tours?sort=duration&sort=price, we won't get an error anymore but we will only consider the last sort)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAvarage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ], // we can specify a white list of properties for which we actually allow duplicates in the query string
  })
);

app.use(compression()); // this is going to compress all the text that is sent to clients (not images)

// We add more middlewares to our middlewares stack.
// In all middleware functions we have access to request, the response and the next function.
// This middleware here applies to all the requests (coming after) because we didn't specify any route.
// app.use((req, res, next) => {
//   console.log('Hello from the middleware!');
//   next();
// });

// Test middleware
app.use((req, res, next) => {
  // We add "requestTime" to the request
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next(); //We call the next middleware in the stack
});

// 3) ROUTES
// It's called MOUNTING the router, i.e mounting a new router on a route.
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//We implement a route handler We could use get but we want to handle all the routes (all the url's) for all the verbs(get, post, delete, patch..). To do that we use app.all() and we pass the star * bc we want all the url's
// NOTE: we have to put it after calling (i.e mounting) the routers
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // This error is also handle in other files like tourController.js so we want to handle this error in a central middleware.

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // if the next function receives an arugment, no matter what it is, Express will automatically know that there was an error
  // it will therefore jump to the error handling middleware
  // next(err);

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// To define an error middleware, all we have to do is to give the middleware function 4 arguments and Express will then automatically recognize it as an error handling middleware (and therefore only call it when there is an error).
app.use(globalErrorHanlder);

module.exports = app;
