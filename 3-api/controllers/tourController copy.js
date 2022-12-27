const { query } = require('express');
const Tour = require('./../models/tourModel');

// This was just for testing purposes.
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAvarage,price';
  req.query.fields = 'name,price,ratingsAvarage,summary,difficulty';
  next(); // NOT FORGET THE NEXT IN  A MIDDLEWARE!
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    //// BUILD QUERY ////
    // FIRST WAY OF WRITING A QUERY
    // const tours = await Tour.find(queryObj);
    // SECOND WAY OF WRITING A QUERY
    // We start chaining some special Mongoose methods
    // const tours = await Tour.find()
    //   .where('duration')
    //   .lessthan(5)
    //   .where('difficulty')
    //   .equals('easy');

    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });
    console.log(queryObj);

    // 1B) Advanced filtering
    //We stringify the object to then replace a piece of content
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));
    // Note : We add a \b before and after bc we only want to match these exact words.
    // We add the g flag which means that it will actually happen multiple times
    // The replace method accept a callback function and its first argument is the match string
    // So we place the dollar sign in front of the string to have a mongoDB operator
    // Indeed, usually we don't pass the $ sign into the url bc not good for user experience (easier for them to use the API)
    let query = Tour.find(JSON.parse(queryStr));

    // { difficulty : 'easy', duraction: {$gte 5}}
    // gte means greater than or equal
    // gte, gt, lte, lt
    // $ means that it is a mongoDB operator

    // 2) Sorting
    // Note: if we pass sort=-price in the url, it will sort the prices in the descending order
    if (req.query?.sort) {
      // to do sort('price ratingsAverage') (it's how it works in mongoose),
      // we have to pass sort=price,ratingsAverage in the url and do some manipulations here
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      // We sort it by default
      query = query.sort('-createdAt');
    }

    // 3) Field limiting
    // In order to allow clients to choose which fields they want to get back in the response
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      // query = query.select('name duration price') is the result expected
      query = query.select(fields);
    } else {
      // By default we will remove the _v = 0 (mongoDB juste creates these fields bc it uses them internally but we don't need them)
      // THE - SIGN MEANS EXCLUDING
      query = query.select('-__v');
    }

    // 4) Pagination
    // In ?page=2&limit=10, the limit means the amount of results that we want per page
    // page1: 1-10, page2 : 11-20,page 3: 21-30 ...

    const page = +req.query.page || 1; // By default we want the page 1
    const limit = +req.query.limit || 100;
    const skip = limit * (page - 1);
    query = query.skip(skip).limit(limit);
    // limit is the amount of results that we want in the query
    // skip is the amount of results that should be skipped before actually querying data

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }
    // EXECUTE QUERY
    // the query looks like query.sort.select().skip().limit()...
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // same than Tour.findOne({_id: req.params.id})

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    //We can do it a better way:
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      date: {
        tour: newTour,
      },
    });
  } catch (err) {
    // Exemple of error: trying to create a document without one of the require fields bc it will reject the promise.
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent:' + err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // As a third argument, we can pass in some options.
    // new: true to return to the new document.
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
