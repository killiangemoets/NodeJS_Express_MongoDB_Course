import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51MJKjkGamE1403bvWszMVFnBtgHUQYbvNipO9FdcJ4B10gNN0rrtHoOgoOVctO1DN2I6EIrIz8PXJMmrgRK7icmu00pOqj5QUt'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
