class APIFeatures {
  // We will pass 2 arguments:
  // - The mongoose query
  // - The queryString that we get from express
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //BUILD QUERY
    // 1A) Filtering
    console.log(this.queryString);
    const queryObj = { ...this.queryString };
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
    // let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));

    // Example: {difficulty: 'easy', duration: {$gte: 5}}
    // gte, gt, lte, lt
    return this;
  }

  sort() {
    // 2) Sorting
    // Note: if we pass sort=-price in the url, it will sort the prices in the descending order
    if (this.queryString.sort) {
      // to do sort('price ratingsAverage') (it's how it works in mongoose),
      // we have to pass sort=price,ratingsAverage in the url and do some manipulations here
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      // We sort it by default
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 3) Field limiting
    // In order to allow clients to choose which fields they want to get back in the response
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // query = query.select('name duration price') is the result expected
      this.query = this.query.select(fields);
    } else {
      // By default we will remove the _v = 0 (mongoDB juste creates these fields bc it uses them internally but we don't need them)
      // THE - SIGN MEANS EXCLUDING
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    // In ?page=2&limit=10, the limit means the amount of results that we want per page
    // page1: 1-10, page2 : 11-20,page 3: 21-30 ...

    const page = +this.queryString.page || 1; // By default we want the page 1
    const limit = +this.queryString.limit || 100;
    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit);
    // limit is the amount of results that we want in the query
    // skip is the amount of results that should be skipped before actually querying data

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    return this;
  }
}

module.exports = APIFeatures;
