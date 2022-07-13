class AppError extends Error {
  constructor(message, statusCode) {
    // When we extend a parent class, we call super in order to call the parent constructor
    super(message); // We call the parent class and the parent is Error, and whatever we pass into it is gonna be the message property
    this.statusCode = statusCode;
    // fail if 404 and error if 500
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // This line is just to avoid than the a new object is created and a constructor function is called, that function call is not gonna appear in the stack trace, and won't pollute it.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
