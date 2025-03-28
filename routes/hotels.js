const express = require('express');
const {getHotels, getHotel, createHotel, updateHotel, deleteHotel, blacklistUser} = require('../controllers/hotels');

const appointmentRouter = require('./appointment');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

//Re-route into other routers
router.use('/:hotelId/appointments/', appointmentRouter);

router.route('/:hotelId/blacklist').put(protect, authorize('admin'), blacklistUser);
router.route('/').get(getHotels).post(protect, authorize('admin'), createHotel);
router.route('/:id').get(getHotel).put(protect, authorize('admin'), updateHotel).delete(protect, authorize('admin'), deleteHotel);

module.exports=router;