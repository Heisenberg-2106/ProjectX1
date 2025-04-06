import express from 'express';
import {
  createAppointment,
  getUserAppointments,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Appointment creation and listing
router.route('/')
  .post(
    restrictTo('patient'), 
    createAppointment
  )
  .get(
    getUserAppointments
  );

// Individual appointment management
router.route('/:id/cancel')
  .put(
    restrictTo('patient'),
    cancelAppointment
  );

export default router;