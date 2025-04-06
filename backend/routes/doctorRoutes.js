import express from 'express';
import {
  getAllDoctors,
  getDoctor,
  updateDoctor,
  addAvailableSlot,
  deleteAvailableSlot,
  getDoctorAppointments,
  addReview,
} from '../controllers/doctorController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.route('/').get(getAllDoctors);
router.route('/:id').get(getDoctor);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware require authentication

// Doctor-specific routes
router.route('/:id').patch(
  restrictTo('doctor', 'admin'), // Only doctors and admins can update profiles
  updateDoctor
);

// Slot management routes (doctor only)
router
  .route('/:id/slots')
  .post(restrictTo('doctor'), addAvailableSlot);

router
  .route('/:id/slots/:slotId')
  .delete(restrictTo('doctor'), deleteAvailableSlot);

// Doctor appointments (doctor only)
router
  .route('/:id/appointments')
  .get(restrictTo('doctor'), getDoctorAppointments);

// Reviews (patients only)
router
  .route('/:id/reviews')
  .post(restrictTo('patient'), addReview);

export default router;