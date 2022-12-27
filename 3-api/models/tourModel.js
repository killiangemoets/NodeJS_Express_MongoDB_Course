const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator'); // We will use the validator.js library -> See on github
// const User = require('./userModel');

// To create a model, we actually need a schema. We use a schema to describe our data, to set default values, etc.
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true, // A name must be unique
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // We  can use a validator from validator.js
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'], // this notation is a short hand for the complete object like below
      enum: {
        // enum works only for strings (not numbers)
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // this function run each time there is a new value for ratingsAverage
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // We will create our own validator
      validate: {
        validator: function (val) {
          // This function has to return true (validate) or false
          // This only points to current doc on NEW document creation! (Doesn't work for update) !!!
          return val < this.price;
        },
        message: `Discount price ({VALUE}) should be below regular price`,
        // We can access the value in the message. It's internal to Mongoose, it has nothing to do with JavaScript
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //It will always hide this createdAt field
    },
    startDates: [Date],
    secretTour: {
      type: Boolean, //We wadd a secretTour parameter, if it's true, we won't show up the tour thanks to the pre-find middleware
      default: false,
    },
    startLocation: {
      // GeoJSON in order to specify geospatial data
      type: {
        type: String,
        default: 'Point', // we can specify multiple geometries in MongoDB, the default one is Point
        enum: ['Point'], // and here Point is the only possible option
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  // We passed a first object for the schema definition but we can also pass a second object for the options

  {
    toJSON: { virtuals: true },
    // Each time the date is actually outputted as JSON, we want virtuals to be true (so virtuals to be part of the output)
    // A virtual property is a field not stored in the database but calulated using some other value
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
// 1 means that we are sorting the price index in an ascending order, while -1 stands for descending order
// WHY? when we query api/v1/tours?price[lt]=1000 for example, mongoDB is only gonna need to scan the first documents and not all of them => Increase the performance
tourSchema.index({ slug: 1 });

// In order to be able to do geospatial queries, we need to first attribute an index to the field where the geospatial data that we're searching for is stored.
// For geospatial data, this index needs to be a 2D sphere index if the data describes real points on the earth like spehere
// we can also use a 2D index if we're using just fictional points on a simple 2 dimensional plane
tourSchema.index({ startLocation: '2dsphere' });

// We define a virtual property on our Tour schema
// We add a get method bc this virtual property will be created each time that we get some date out of the database
tourSchema.virtual('durationWeeks').get(function () {
  if (!this.duration) return undefined;
  return this.duration / 7;
});
// IMPORTANT: We CANNOT use this virtual property in a query bc they're technically not part of the databse

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // we specify the tour field from the review model
  localField: '_id', // this _id, which is what is called in the local model (i.e. the tour model), is called tour in the foreign model (i.e. the review model)
});

// Pre-save hook:
// This function will be called before a document is saved to thedatabase
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// So this middleware doesn't work when we update a doc
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (guide_id) => await User.findById(guide_id)
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// /!\ With this method, when we update the user, we also need to update the tour document

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
//Let's add a pre-find hook, i.e. a middleware that is gonna run before any find query is executed (not before findById or findOne !!).
// tourSchema.pre('find', function (next) {
// We want a middlfeware far all the queries that start with find:
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  //We do it like this in case some tour doesn't have the secretTour attribut (so are either true or false)
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});
// AGGREGATION MIDDLEWARE
//We also want to exclude the secret tour of all our agregations
// tourSchema.pre('aggregate', function (next) {
//   //this.pipeline() is an array so we use unshift to add an element at the beginning of this array
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

// Mongoose is all about models. A model is like a blueprint that we use to create documents. It's a bit like classes in JavaScript (that we use as blueprints to create objects out of them).
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// This testTour document is an instance of the tour model so it has a couple method on it that we can use to interact with the database.
// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 516,
// });

// The save method will return a promise that we can then consume.
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERROR:', err);
//   });
