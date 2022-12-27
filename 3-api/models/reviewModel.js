const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    // Each time the date is actually outputted as JSON, we want virtuals to be true (so virtuals to be part of the output)
    // A virtual property is a field not stored in the database but calulated using some other value
    toObject: { virtuals: true },
  }
);

// Each combination of tour and user has always to be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // since we use a static method, this points to the model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// We should use post and not pre! Indeed, at pre save, the current review is not really in the collection just yet
reviewSchema.post('save', function () {
  //this points to current review

  // Review.calcAverageRatings(this.tour); NO bc Review is not defined here!

  // this.constructor points to the model
  this.constructor.calcAverageRatings(this.tour);
});

// Behind the scene, findByIdAndUpdate and findByIdAndDelete are only a shorthand for findOneAndUpadate and findOneAndDelete
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   // this points to the current query, so we can exceture the query and then that will give us the document that's currently being processed
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// });
reviewSchema.post(/^findOneAnd/, async function (doc) {
  // await this.r.constructor.calcAverageRatings(this.r.tour);
  await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
