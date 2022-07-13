const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  //   201 for created
  res.status(201).json({
    status: 'success',
    date: {
      user: newUser,
    },
  });
});
