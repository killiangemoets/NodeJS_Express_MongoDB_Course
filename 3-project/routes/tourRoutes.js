const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

// In a param middleware function we also have access to a 4th argument: the value of the parameter in question
// router.param('id', tourController.checkID);

// ?limit=5&sort=-ratingAvarage,price -> Let's say that this is a request that is done all the time and we want to provide a route that is simple and easy to memorize for the user.
//We will create a middleware to prefill the req.query
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
