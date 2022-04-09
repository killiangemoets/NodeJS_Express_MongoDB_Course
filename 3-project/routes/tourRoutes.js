const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

// In a param middleware function we also have access to a 4th argument: the value of the parameter in question
router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
